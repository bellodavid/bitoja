import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { authenticate, AuthenticatedRequest } from "../middleware/auth.js";
import { validate, validateQuery, schemas } from "../middleware/validation.js";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || "./uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// Get user's trades (both as buyer and seller)
router.get(
  "/my",
  authenticate,
  validateQuery(schemas.pagination),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 20 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const { data, error, count } = await supabase
        .from("trades")
        .select(
          `
        id,
        amount,
        asset_amount,
        status,
        payment_proof_url,
        created_at,
        updated_at,
        advertisements!trades_advertisement_id_fkey (
          id,
          trade_type,
          asset,
          currency,
          payment_method,
          rate
        ),
        buyer:users!trades_buyer_id_fkey (
          id,
          first_name,
          last_name,
          username,
          profile_image_url
        ),
        seller:users!trades_seller_id_fkey (
          id,
          first_name,
          last_name,
          username,
          profile_image_url
        )
      `,
          { count: "exact" }
        )
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .range(offset, offset + Number(limit) - 1);

      if (error) {
        console.error("Error fetching user trades:", error);
        return res.status(500).json({ error: "Failed to fetch trades" });
      }

      res.json({
        data,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Error in GET /trades/my:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get single trade
router.get("/:id", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { data, error } = await supabase
      .from("trades")
      .select(
        `
        id,
        advertisement_id,
        buyer_id,
        seller_id,
        amount,
        asset_amount,
        status,
        payment_proof_url,
        dispute_reason,
        completed_at,
        created_at,
        updated_at,
        advertisements!trades_advertisement_id_fkey (
          id,
          trade_type,
          asset,
          currency,
          payment_method,
          rate,
          terms
        ),
        buyer:users!trades_buyer_id_fkey (
          id,
          first_name,
          last_name,
          username,
          profile_image_url,
          is_verified
        ),
        seller:users!trades_seller_id_fkey (
          id,
          first_name,
          last_name,
          username,
          profile_image_url,
          is_verified
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching trade:", error);
      return res.status(404).json({ error: "Trade not found" });
    }

    // Check if user is involved in this trade
    if (data.buyer_id !== userId && data.seller_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error in GET /trades/:id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create new trade
router.post(
  "/",
  authenticate,
  validate(schemas.trade),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { advertisement_id, amount } = req.body;

      // Get advertisement details
      const { data: advertisement, error: adError } = await supabase
        .from("advertisements")
        .select(
          `
        id,
        user_id,
        trade_type,
        asset,
        rate,
        min_limit,
        max_limit,
        status
      `
        )
        .eq("id", advertisement_id)
        .single();

      if (adError || !advertisement) {
        return res.status(404).json({ error: "Advertisement not found" });
      }

      if (advertisement.status !== "ACTIVE") {
        return res.status(400).json({ error: "Advertisement is not active" });
      }

      if (advertisement.user_id === userId) {
        return res
          .status(400)
          .json({ error: "Cannot trade with your own advertisement" });
      }

      // Validate amount is within limits
      if (
        amount < advertisement.min_limit ||
        amount > advertisement.max_limit
      ) {
        return res.status(400).json({
          error: `Amount must be between ${advertisement.min_limit} and ${advertisement.max_limit}`,
        });
      }

      // Calculate asset amount
      const asset_amount = amount / advertisement.rate;

      // Determine buyer and seller based on trade type
      const buyer_id =
        advertisement.trade_type === "SELL" ? userId : advertisement.user_id;
      const seller_id =
        advertisement.trade_type === "SELL" ? advertisement.user_id : userId;

      // For SELL orders, check if seller has sufficient balance
      if (advertisement.trade_type === "SELL") {
        const { data: wallet, error: walletError } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", seller_id)
          .eq("asset_type", advertisement.asset)
          .single();

        if (walletError || !wallet) {
          return res.status(400).json({ error: "Seller wallet not found" });
        }

        if (parseFloat(wallet.balance) < asset_amount) {
          return res.status(400).json({ error: "Insufficient seller balance" });
        }
      }

      // Create the trade
      const { data, error } = await supabase
        .from("trades")
        .insert({
          advertisement_id,
          buyer_id,
          seller_id,
          amount,
          asset_amount,
          status: "PENDING",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating trade:", error);
        return res.status(400).json({ error: "Failed to create trade" });
      }

      res.status(201).json(data);
    } catch (error) {
      console.error("Error in POST /trades:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Upload payment proof
router.post(
  "/:id/payment-proof",
  authenticate,
  upload.single("proof"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Get trade details
      const { data: trade, error: tradeError } = await supabase
        .from("trades")
        .select("buyer_id, seller_id, status")
        .eq("id", id)
        .single();

      if (tradeError || !trade) {
        return res.status(404).json({ error: "Trade not found" });
      }

      // Only buyer can upload payment proof
      if (trade.buyer_id !== userId) {
        return res
          .status(403)
          .json({ error: "Only buyer can upload payment proof" });
      }

      if (trade.status !== "PENDING") {
        return res
          .status(400)
          .json({ error: "Cannot upload proof for this trade status" });
      }

      // Update trade with payment proof URL and status
      const proofUrl = `/uploads/${req.file.filename}`;
      const { data, error } = await supabase
        .from("trades")
        .update({
          payment_proof_url: proofUrl,
          status: "PAID",
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating trade with payment proof:", error);
        return res
          .status(400)
          .json({ error: "Failed to upload payment proof" });
      }

      res.json(data);
    } catch (error) {
      console.error("Error in POST /trades/:id/payment-proof:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Release tokens (complete trade)
router.post(
  "/:id/release",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Get trade details
      const { data: trade, error: tradeError } = await supabase
        .from("trades")
        .select(
          `
        id,
        buyer_id,
        seller_id,
        asset_amount,
        status,
        advertisements!trades_advertisement_id_fkey (
          asset
        )
      `
        )
        .eq("id", id)
        .single();

      if (tradeError || !trade) {
        return res.status(404).json({ error: "Trade not found" });
      }

      // Only seller can release tokens
      if (trade.seller_id !== userId) {
        return res
          .status(403)
          .json({ error: "Only seller can release tokens" });
      }

      if (trade.status !== "PAID") {
        return res
          .status(400)
          .json({ error: "Trade must be in PAID status to release tokens" });
      }

      // Start a transaction to transfer tokens and update trade status
      const { data, error } = await supabase.rpc("complete_trade", {
        trade_id: id,
        seller_id: trade.seller_id,
        buyer_id: trade.buyer_id,
        asset_amount: trade.asset_amount,
        asset_type: trade.advertisements,
      });

      if (error) {
        console.error("Error completing trade:", error);
        return res.status(400).json({ error: "Failed to complete trade" });
      }

      // Update trade status
      const { data: updatedTrade, error: updateError } = await supabase
        .from("trades")
        .update({
          status: "COMPLETED",
          completed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating trade status:", updateError);
        return res.status(400).json({ error: "Failed to update trade status" });
      }

      res.json(updatedTrade);
    } catch (error) {
      console.error("Error in POST /trades/:id/release:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update trade status
router.patch(
  "/:id/status",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { status, dispute_reason } = req.body;
      const userId = req.user!.id;

      if (!["CANCELLED", "DISPUTED"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      // Get trade details
      const { data: trade, error: tradeError } = await supabase
        .from("trades")
        .select("buyer_id, seller_id, status")
        .eq("id", id)
        .single();

      if (tradeError || !trade) {
        return res.status(404).json({ error: "Trade not found" });
      }

      // Check if user is involved in this trade
      if (trade.buyer_id !== userId && trade.seller_id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (trade.status === "COMPLETED") {
        return res
          .status(400)
          .json({ error: "Cannot change status of completed trade" });
      }

      const updateData: any = { status };
      if (status === "DISPUTED" && dispute_reason) {
        updateData.dispute_reason = dispute_reason;
      }

      const { data, error } = await supabase
        .from("trades")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating trade status:", error);
        return res.status(400).json({ error: "Failed to update trade status" });
      }

      res.json(data);
    } catch (error) {
      console.error("Error in PATCH /trades/:id/status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get trade messages
router.get(
  "/:id/messages",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // First check if user is involved in this trade
      const { data: trade, error: tradeError } = await supabase
        .from("trades")
        .select("buyer_id, seller_id")
        .eq("id", id)
        .single();

      if (tradeError || !trade) {
        return res.status(404).json({ error: "Trade not found" });
      }

      if (trade.buyer_id !== userId && trade.seller_id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get messages
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
        id,
        content,
        message_type,
        created_at,
        sender:users!messages_sender_id_fkey (
          id,
          first_name,
          last_name,
          username,
          profile_image_url
        )
      `
        )
        .eq("trade_id", id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching trade messages:", error);
        return res.status(500).json({ error: "Failed to fetch messages" });
      }

      res.json(data);
    } catch (error) {
      console.error("Error in GET /trades/:id/messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Send message
router.post(
  "/:id/messages",
  authenticate,
  validate(schemas.message),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { content, message_type = "TEXT" } = req.body;

      // First check if user is involved in this trade
      const { data: trade, error: tradeError } = await supabase
        .from("trades")
        .select("buyer_id, seller_id")
        .eq("id", id)
        .single();

      if (tradeError || !trade) {
        return res.status(404).json({ error: "Trade not found" });
      }

      if (trade.buyer_id !== userId && trade.seller_id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Create message
      const { data, error } = await supabase
        .from("messages")
        .insert({
          trade_id: id,
          sender_id: userId,
          content,
          message_type,
        })
        .select(
          `
        id,
        content,
        message_type,
        created_at,
        sender:users!messages_sender_id_fkey (
          id,
          first_name,
          last_name,
          username,
          profile_image_url
        )
      `
        )
        .single();

      if (error) {
        console.error("Error creating message:", error);
        return res.status(400).json({ error: "Failed to send message" });
      }

      res.status(201).json(data);
    } catch (error) {
      console.error("Error in POST /trades/:id/messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
