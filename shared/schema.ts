import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums (must be defined before tables)
export const assetEnum = pgEnum("asset", ["BTC", "USDT"]);
export const tradeTypeEnum = pgEnum("trade_type", ["BUY", "SELL"]);
export const paymentMethodEnum = pgEnum("payment_method", ["BANK_TRANSFER", "MOBILE_MONEY", "WIRE_TRANSFER", "CASH"]);
export const currencyEnum = pgEnum("currency", ["NGN", "GHS", "USD", "EUR"]);
export const adStatusEnum = pgEnum("ad_status", ["ACTIVE", "INACTIVE", "DELETED"]);
export const tradeStatusEnum = pgEnum("trade_status", ["PENDING", "PAID", "RELEASED", "DISPUTED", "CANCELLED", "COMPLETED"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["DEPOSIT", "WITHDRAWAL", "INTERNAL_TRANSFER", "TRADE_ESCROW", "TRADE_RELEASE"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["PENDING", "CONFIRMED", "FAILED"]);

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  btcBalance: decimal("btc_balance", { precision: 18, scale: 8 }).default("0"),
  usdtBalance: decimal("usdt_balance", { precision: 18, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Custodial wallet system - securely store private keys
export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  asset: assetEnum("asset").notNull(),
  publicKey: varchar("public_key").notNull(),
  encryptedPrivateKey: text("encrypted_private_key").notNull(), // AES encrypted
  derivationPath: varchar("derivation_path").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transaction records for wallet operations
export const walletTransactions = pgTable("wallet_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  walletId: varchar("wallet_id").notNull().references(() => wallets.id),
  asset: assetEnum("asset").notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  type: transactionTypeEnum("transaction_type").notNull(),
  status: transactionStatusEnum("transaction_status").default("PENDING"),
  txHash: varchar("tx_hash"), // On-chain transaction hash
  blockHeight: varchar("block_height"),
  confirmations: varchar("confirmations").default("0"),
  relatedTradeId: varchar("related_trade_id"), // Link to trades table
  metadata: jsonb("metadata"), // Additional transaction data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const advertisements = pgTable("advertisements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  asset: assetEnum("asset").notNull(),
  tradeType: tradeTypeEnum("trade_type").notNull(),
  currency: currencyEnum("currency").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  rate: decimal("rate", { precision: 18, scale: 2 }).notNull(),
  minLimit: decimal("min_limit", { precision: 18, scale: 2 }).notNull(),
  maxLimit: decimal("max_limit", { precision: 18, scale: 2 }).notNull(),
  status: adStatusEnum("status").default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advertisementId: varchar("advertisement_id").notNull().references(() => advertisements.id),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  assetAmount: decimal("asset_amount", { precision: 18, scale: 8 }).notNull(),
  status: tradeStatusEnum("status").default("PENDING"),
  paymentProofUrl: varchar("payment_proof_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tradeId: varchar("trade_id").notNull().references(() => trades.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const swaps = pgTable("swaps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fromAsset: assetEnum("from_asset").notNull(),
  toAsset: assetEnum("to_asset").notNull(),
  fromAmount: decimal("from_amount", { precision: 18, scale: 8 }).notNull(),
  toAmount: decimal("to_amount", { precision: 18, scale: 8 }).notNull(),
  rate: decimal("rate", { precision: 18, scale: 8 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  advertisements: many(advertisements),
  buyTrades: many(trades, { relationName: "buyer" }),
  sellTrades: many(trades, { relationName: "seller" }),
  messages: many(messages),
  swaps: many(swaps),
  wallets: many(wallets),
  walletTransactions: many(walletTransactions),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(walletTransactions),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  user: one(users, {
    fields: [walletTransactions.userId],
    references: [users.id],
  }),
  wallet: one(wallets, {
    fields: [walletTransactions.walletId],
    references: [wallets.id],
  }),
}));

export const advertisementsRelations = relations(advertisements, ({ one, many }) => ({
  user: one(users, {
    fields: [advertisements.userId],
    references: [users.id],
  }),
  trades: many(trades),
}));

export const tradesRelations = relations(trades, ({ one, many }) => ({
  advertisement: one(advertisements, {
    fields: [trades.advertisementId],
    references: [advertisements.id],
  }),
  buyer: one(users, {
    fields: [trades.buyerId],
    references: [users.id],
    relationName: "buyer",
  }),
  seller: one(users, {
    fields: [trades.sellerId],
    references: [users.id],
    relationName: "seller",
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  trade: one(trades, {
    fields: [messages.tradeId],
    references: [trades.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const swapsRelations = relations(swaps, ({ one }) => ({
  user: one(users, {
    fields: [swaps.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertAdvertisementSchema = createInsertSchema(advertisements).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  status: true,
  paymentProofUrl: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertSwapSchema = createInsertSchema(swaps).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  status: true,
  confirmations: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Advertisement = typeof advertisements.$inferSelect;
export type InsertAdvertisement = z.infer<typeof insertAdvertisementSchema>;
export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Swap = typeof swaps.$inferSelect;
export type InsertSwap = z.infer<typeof insertSwapSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
