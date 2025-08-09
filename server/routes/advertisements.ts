import { Router } from "express";
import { supabase } from "../config/supabase.js";
import {
  authenticate,
  AuthenticatedRequest,
  optionalAuth,
} from "../middleware/auth.js";
import { validate, validateQuery, schemas } from "../middleware/validation.js";

const router = Router();

// Get all advertisements (public route with optional auth)
router.get(
  "/",
  optionalAuth,
  validateQuery(schemas.advertisementFilters),
  async (req: AuthenticatedRequest, res) => {
    try {
      const {
        trade_type,
        asset,
        currency,
        payment_method,
        page = 1,
        limit = 20,
      } = req.query;

      let query = supabase
        .from("advertisements")
        .select(
          `
        id,
        trade_type,
        asset,
        currency,
        payment_method,
        rate,
        min_limit,
        max_limit,
        terms,
        created_at,
        users!advertisements_user_id_fkey (
          id,
          first_name,
          last_name,
          username,
          profile_image_url,
          is_verified
        )
      `
        )
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false });

      // Apply filters
      if (trade_type) query = query.eq("trade_type", trade_type);
      if (asset) query = query.eq("asset", asset);
      if (currency) query = query.eq("currency", currency);
      if (payment_method) query = query.eq("payment_method", payment_method);

      // Apply pagination
      const offset = (Number(page) - 1) * Number(limit);
      query = query.range(offset, offset + Number(limit) - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching advertisements:", error);
        return res
          .status(500)
          .json({ error: "Failed to fetch advertisements" });
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
      console.error("Error in GET /advertisements:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get user's own advertisements
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
        .from("advertisements")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .neq("status", "DELETED")
        .order("created_at", { ascending: false })
        .range(offset, offset + Number(limit) - 1);

      if (error) {
        console.error("Error fetching user advertisements:", error);
        return res
          .status(500)
          .json({ error: "Failed to fetch advertisements" });
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
      console.error("Error in GET /advertisements/my:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get single advertisement
router.get("/:id", optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("advertisements")
      .select(
        `
        id,
        user_id,
        trade_type,
        asset,
        currency,
        payment_method,
        rate,
        min_limit,
        max_limit,
        terms,
        status,
        created_at,
        users!advertisements_user_id_fkey (
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
      console.error("Error fetching advertisement:", error);
      return res.status(404).json({ error: "Advertisement not found" });
    }

    // Hide deleted ads from non-owners
    if (data.status === "DELETED" && data.user_id !== req.user?.id) {
      return res.status(404).json({ error: "Advertisement not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error in GET /advertisements/:id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create new advertisement
router.post(
  "/",
  authenticate,
  validate(schemas.advertisement),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const advertisementData = { ...req.body, user_id: userId };

      // Validate min_limit < max_limit
      if (advertisementData.min_limit >= advertisementData.max_limit) {
        return res
          .status(400)
          .json({ error: "Minimum limit must be less than maximum limit" });
      }

      // For SELL orders, check if user has sufficient balance
      if (advertisementData.trade_type === "SELL") {
        const { data: wallet, error: walletError } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", userId)
          .eq("asset_type", advertisementData.asset)
          .single();

        if (walletError || !wallet) {
          return res.status(400).json({ error: "Wallet not found" });
        }

        // Calculate minimum required balance (min_limit / rate)
        const minRequiredBalance =
          advertisementData.min_limit / advertisementData.rate;

        if (parseFloat(wallet.balance) < minRequiredBalance) {
          return res.status(400).json({
            error: `Insufficient ${advertisementData.asset} balance. Required: ${minRequiredBalance}, Available: ${wallet.balance}`,
          });
        }
      }

      const { data, error } = await supabase
        .from("advertisements")
        .insert(advertisementData)
        .select()
        .single();

      if (error) {
        console.error("Error creating advertisement:", error);
        return res
          .status(400)
          .json({ error: "Failed to create advertisement" });
      }

      res.status(201).json(data);
    } catch (error) {
      console.error("Error in POST /advertisements:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update advertisement
router.put(
  "/:id",
  authenticate,
  validate(schemas.advertisement),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const updates = req.body;

      // Validate min_limit < max_limit
      if (updates.min_limit >= updates.max_limit) {
        return res
          .status(400)
          .json({ error: "Minimum limit must be less than maximum limit" });
      }

      const { data, error } = await supabase
        .from("advertisements")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating advertisement:", error);
        return res
          .status(400)
          .json({ error: "Failed to update advertisement" });
      }

      if (!data) {
        return res
          .status(404)
          .json({ error: "Advertisement not found or access denied" });
      }

      res.json(data);
    } catch (error) {
      console.error("Error in PUT /advertisements/:id:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update advertisement status
router.patch(
  "/:id/status",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user!.id;

      if (!["ACTIVE", "PAUSED", "DELETED"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const { data, error } = await supabase
        .from("advertisements")
        .update({ status })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating advertisement status:", error);
        return res
          .status(400)
          .json({ error: "Failed to update advertisement status" });
      }

      if (!data) {
        return res
          .status(404)
          .json({ error: "Advertisement not found or access denied" });
      }

      res.json(data);
    } catch (error) {
      console.error("Error in PATCH /advertisements/:id/status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete advertisement (soft delete)
router.delete("/:id", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { data, error } = await supabase
      .from("advertisements")
      .update({ status: "DELETED" })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error deleting advertisement:", error);
      return res.status(400).json({ error: "Failed to delete advertisement" });
    }

    if (!data) {
      return res
        .status(404)
        .json({ error: "Advertisement not found or access denied" });
    }

    res.json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /advertisements/:id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
