import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { authenticate, AuthenticatedRequest } from "../middleware/auth.js";
import { validate, validateQuery, schemas } from "../middleware/validation.js";
import crypto from "crypto";
import * as bip39 from "bip39";
import * as bitcoin from "bitcoinjs-lib";
import { ethers } from "ethers";

const router = Router();

function encrypt(text: string): string {
  const key = crypto
    .createHash("sha256")
    .update(process.env.JWT_SECRET || "default_secret")
    .digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

router.post(
  "/generate",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;

      // Check existing wallets
      const { data: existing, error: qErr } = await supabase
        .from("wallets")
        .select("asset_type,address,private_key_encrypted")
        .eq("user_id", userId);

      if (qErr) {
        console.error("Wallet query error:", qErr);
      }

      const hasBtc = existing?.some(
        (w) => w.asset_type === "BTC" && w.address && w.private_key_encrypted
      );
      const hasUsdt = existing?.some(
        (w) => w.asset_type === "USDT" && w.address && w.private_key_encrypted
      );

      let btcAddress: string | undefined = existing?.find(
        (w) => w.asset_type === "BTC"
      )?.address as string | undefined;
      let usdtAddress: string | undefined = existing?.find(
        (w) => w.asset_type === "USDT"
      )?.address as string | undefined;

      // Generate missing BTC
      if (!hasBtc) {
        const network =
          process.env.BTC_NETWORK === "testnet"
            ? bitcoin.networks.testnet
            : bitcoin.networks.bitcoin;
        
        // Generate a demo address for testing purposes
        // In production, you'd use proper HD wallet generation
        const demoAddresses = {
          mainnet: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", // Genesis block address
          testnet: "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx", // Testnet address
        };
        
        btcAddress = network === bitcoin.networks.testnet 
          ? demoAddresses.testnet 
          : demoAddresses.mainnet;
        const wif = "demo-private-key"; // In production, generate real private key

        await supabase.from("wallets").upsert(
          {
            user_id: userId,
            asset_type: "BTC",
            address: btcAddress || null,
            private_key_encrypted: encrypt(wif),
          },
          { onConflict: "user_id,asset_type", ignoreDuplicates: true }
        );
      }

      // Generate missing USDT
      if (!hasUsdt) {
        const wallet = ethers.Wallet.createRandom();
        usdtAddress = wallet.address;

        await supabase.from("wallets").upsert(
          {
            user_id: userId,
            asset_type: "USDT",
            address: usdtAddress,
            private_key_encrypted: encrypt(wallet.privateKey),
          },
          { onConflict: "user_id,asset_type", ignoreDuplicates: true }
        );
      }

      res.json({
        message:
          !hasBtc || !hasUsdt ? "Wallets generated" : "Wallets already exist",
        btcAddress,
        usdtAddress,
      });
    } catch (error) {
      console.error("Error generating wallets:", error);
      res.status(500).json({ error: "Failed to generate wallets" });
    }
  }
);

// Get user's wallets
router.get("/", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;

    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .order("asset_type");

    if (error) {
      console.error("Error fetching wallets:", error);
      return res.status(500).json({ error: "Failed to fetch wallets" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error in GET /wallets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get wallet by asset type
router.get("/:asset", authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { asset } = req.params;

    if (!["BTC", "USDT"].includes(asset.toUpperCase())) {
      return res.status(400).json({ error: "Invalid asset type" });
    }

    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .eq("asset_type", asset.toUpperCase())
      .single();

    if (error) {
      console.error("Error fetching wallet:", error);
      return res.status(404).json({ error: "Wallet not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error in GET /wallets/:asset:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get wallet transactions
router.get(
  "/:asset/transactions",
  authenticate,
  validateQuery(schemas.pagination),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { asset } = req.params;
      const { page = 1, limit = 20 } = req.query;

      if (!["BTC", "USDT"].includes(asset.toUpperCase())) {
        return res.status(400).json({ error: "Invalid asset type" });
      }

      // First get the wallet
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("id")
        .eq("user_id", userId)
        .eq("asset_type", asset.toUpperCase())
        .single();

      if (walletError || !wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }

      const offset = (Number(page) - 1) * Number(limit);

      const { data, error, count } = await supabase
        .from("wallet_transactions")
        .select("*", { count: "exact" })
        .eq("wallet_id", wallet.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + Number(limit) - 1);

      if (error) {
        console.error("Error fetching wallet transactions:", error);
        return res.status(500).json({ error: "Failed to fetch transactions" });
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
      console.error("Error in GET /wallets/:asset/transactions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Add demo balance (for testing purposes)
router.post(
  "/demo-balance",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;

      // Only allow in development environment
      if (process.env.NODE_ENV === "production") {
        return res
          .status(403)
          .json({ error: "Demo balance not available in production" });
      }

      // Add demo balances to both wallets
      const { data: btcWallet, error: btcError } = await supabase
        .from("wallets")
        .update({ balance: "0.001" })
        .eq("user_id", userId)
        .eq("asset_type", "BTC")
        .select()
        .single();

      const { data: usdtWallet, error: usdtError } = await supabase
        .from("wallets")
        .update({ balance: "1000.00" })
        .eq("user_id", userId)
        .eq("asset_type", "USDT")
        .select()
        .single();

      if (btcError || usdtError) {
        console.error("Error adding demo balance:", btcError || usdtError);
        return res.status(500).json({ error: "Failed to add demo balance" });
      }

      // Record transactions for demo balance
      await Promise.all([
        supabase.from("wallet_transactions").insert({
          wallet_id: btcWallet.id,
          transaction_type: "DEPOSIT",
          amount: "0.001",
          balance_after: "0.001",
          description: "Demo balance added",
        }),
        supabase.from("wallet_transactions").insert({
          wallet_id: usdtWallet.id,
          transaction_type: "DEPOSIT",
          amount: "1000.00",
          balance_after: "1000.00",
          description: "Demo balance added",
        }),
      ]);

      res.json({
        message: "Demo balance added successfully",
        btc_balance: btcWallet.balance,
        usdt_balance: usdtWallet.balance,
      });
    } catch (error) {
      console.error("Error in POST /wallets/demo-balance:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Swap assets
router.post(
  "/swap",
  authenticate,
  validate(schemas.swap),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { from_asset, to_asset, from_amount } = req.body;

      if (from_asset === to_asset) {
        return res.status(400).json({ error: "Cannot swap same asset" });
      }

      // Mock exchange rate (in production, this would come from an exchange API)
      const exchangeRates: { [key: string]: number } = {
        BTC_USDT: 45000, // 1 BTC = 45,000 USDT
        USDT_BTC: 1 / 45000, // 1 USDT = 1/45,000 BTC
      };

      const rateKey = `${from_asset}_${to_asset}`;
      const rate = exchangeRates[rateKey];

      if (!rate) {
        return res.status(400).json({ error: "Invalid swap pair" });
      }

      const to_amount = from_amount * rate;

      // Check if user has sufficient balance
      const { data: fromWallet, error: fromWalletError } = await supabase
        .from("wallets")
        .select("id, balance")
        .eq("user_id", userId)
        .eq("asset_type", from_asset)
        .single();

      if (fromWalletError || !fromWallet) {
        return res.status(400).json({ error: "Source wallet not found" });
      }

      if (parseFloat(fromWallet.balance) < from_amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Get destination wallet
      const { data: toWallet, error: toWalletError } = await supabase
        .from("wallets")
        .select("id, balance")
        .eq("user_id", userId)
        .eq("asset_type", to_asset)
        .single();

      if (toWalletError || !toWallet) {
        return res.status(400).json({ error: "Destination wallet not found" });
      }

      // Calculate new balances
      const newFromBalance = parseFloat(fromWallet.balance) - from_amount;
      const newToBalance = parseFloat(toWallet.balance) + to_amount;

      // Update both wallets
      const { error: updateFromError } = await supabase
        .from("wallets")
        .update({ balance: newFromBalance.toString() })
        .eq("id", fromWallet.id);

      const { error: updateToError } = await supabase
        .from("wallets")
        .update({ balance: newToBalance.toString() })
        .eq("id", toWallet.id);

      if (updateFromError || updateToError) {
        console.error(
          "Error updating wallets:",
          updateFromError || updateToError
        );
        return res.status(500).json({ error: "Failed to update wallets" });
      }

      // Create swap record
      const { data: swap, error: swapError } = await supabase
        .from("swaps")
        .insert({
          user_id: userId,
          from_asset,
          to_asset,
          from_amount,
          to_amount,
          rate,
          status: "COMPLETED",
        })
        .select()
        .single();

      if (swapError) {
        console.error("Error creating swap record:", swapError);
        return res.status(500).json({ error: "Failed to create swap record" });
      }

      // Record wallet transactions
      await Promise.all([
        supabase.from("wallet_transactions").insert({
          wallet_id: fromWallet.id,
          transaction_type: "SWAP",
          amount: (-from_amount).toString(),
          balance_after: newFromBalance.toString(),
          reference_id: swap.id,
          reference_type: "SWAP",
          description: `Swapped ${from_amount} ${from_asset} to ${to_amount} ${to_asset}`,
        }),
        supabase.from("wallet_transactions").insert({
          wallet_id: toWallet.id,
          transaction_type: "SWAP",
          amount: to_amount.toString(),
          balance_after: newToBalance.toString(),
          reference_id: swap.id,
          reference_type: "SWAP",
          description: `Received ${to_amount} ${to_asset} from ${from_amount} ${from_asset}`,
        }),
      ]);

      res.json({
        swap,
        from_balance: newFromBalance,
        to_balance: newToBalance,
      });
    } catch (error) {
      console.error("Error in POST /wallets/swap:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get swap history
router.get(
  "/swaps",
  authenticate,
  validateQuery(schemas.pagination),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 20 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const { data, error, count } = await supabase
        .from("swaps")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + Number(limit) - 1);

      if (error) {
        console.error("Error fetching swap history:", error);
        return res.status(500).json({ error: "Failed to fetch swap history" });
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
      console.error("Error in GET /wallets/swaps:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
