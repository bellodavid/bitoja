-- Function to complete a trade (transfer tokens between wallets)
CREATE OR REPLACE FUNCTION public.complete_trade(
  trade_id UUID,
  seller_id UUID,
  buyer_id UUID,
  asset_amount DECIMAL,
  asset_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  seller_wallet_id UUID;
  buyer_wallet_id UUID;
  seller_balance DECIMAL;
  buyer_balance DECIMAL;
BEGIN
  -- Get seller wallet
  SELECT id, balance INTO seller_wallet_id, seller_balance
  FROM public.wallets
  WHERE user_id = seller_id AND asset_type = complete_trade.asset_type;

  -- Get buyer wallet
  SELECT id, balance INTO buyer_wallet_id, buyer_balance
  FROM public.wallets
  WHERE user_id = buyer_id AND asset_type = complete_trade.asset_type;

  -- Check if seller has sufficient balance
  IF seller_balance < asset_amount THEN
    RAISE EXCEPTION 'Insufficient seller balance';
  END IF;

  -- Update seller wallet (subtract)
  UPDATE public.wallets
  SET balance = balance - asset_amount
  WHERE id = seller_wallet_id;

  -- Update buyer wallet (add)
  UPDATE public.wallets
  SET balance = balance + asset_amount
  WHERE id = buyer_wallet_id;

  -- Record transactions
  INSERT INTO public.wallet_transactions (
    wallet_id,
    transaction_type,
    amount,
    balance_after,
    reference_id,
    reference_type,
    description
  ) VALUES
  (
    seller_wallet_id,
    'TRADE',
    -asset_amount,
    seller_balance - asset_amount,
    trade_id,
    'TRADE',
    'Trade completed - tokens sent'
  ),
  (
    buyer_wallet_id,
    'TRADE',
    asset_amount,
    buyer_balance + asset_amount,
    trade_id,
    'TRADE',
    'Trade completed - tokens received'
  );

  RETURN TRUE;
END;
$$; 