import { supabaseAdmin } from "../config/supabase.js";
import crypto from "crypto";
import * as bip39 from "bip39";
import * as bitcoin from "bitcoinjs-lib";
import { ethers } from "ethers";

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

export async function generateWalletsIfMissingForUser(userId: string) {
  // Fetch existing wallets
  const { data: existing, error: qErr } = await supabaseAdmin
    .from("wallets")
    .select("asset_type,address,private_key_encrypted")
    .eq("user_id", userId);

  if (qErr) throw qErr;

  const hasBtc = existing?.some(
    (w) => w.asset_type === "BTC" && w.address && w.private_key_encrypted
  );
  const hasUsdt = existing?.some(
    (w) => w.asset_type === "USDT" && w.address && w.private_key_encrypted
  );

  let btcAddress = existing?.find((w) => w.asset_type === "BTC")?.address as
    | string
    | undefined;
  let usdtAddress = existing?.find((w) => w.asset_type === "USDT")?.address as
    | string
    | undefined;

  // Generate BTC address/key if missing
  if (!hasBtc) {
    const network =
      process.env.BTC_NETWORK === "testnet"
        ? bitcoin.networks.testnet
        : bitcoin.networks.bitcoin;

    // Generate demo address for testing purposes
    const demoAddresses = {
      mainnet: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      testnet: "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx",
    };

    btcAddress =
      network === bitcoin.networks.testnet
        ? demoAddresses.testnet
        : demoAddresses.mainnet;
    const wif = "demo-private-key";

    const { error: upErr } = await supabaseAdmin.from("wallets").upsert(
      {
        user_id: userId,
        asset_type: "BTC",
        address: btcAddress || null,
        private_key_encrypted: encrypt(wif),
      },
      { onConflict: "user_id,asset_type", ignoreDuplicates: true }
    );
    if (upErr) throw upErr;
  }

  // Generate USDT address/key if missing (EVM)
  if (!hasUsdt) {
    const wallet = ethers.Wallet.createRandom();
    usdtAddress = wallet.address;

    const { error: upErr } = await supabaseAdmin.from("wallets").upsert(
      {
        user_id: userId,
        asset_type: "USDT",
        address: usdtAddress,
        private_key_encrypted: encrypt(wallet.privateKey),
      },
      { onConflict: "user_id,asset_type", ignoreDuplicates: true }
    );
    if (upErr) throw upErr;
  }

  return { btcAddress, usdtAddress };
}
