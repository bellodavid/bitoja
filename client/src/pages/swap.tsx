import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/ui/navigation";
import BottomNavigation from "@/components/ui/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpDown } from "lucide-react";

export default function Swap() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user, updateUser } = useAuth();
  const [fromAsset, setFromAsset] = useState<"BTC" | "USDT">("BTC");
  const [toAsset, setToAsset] = useState<"BTC" | "USDT">("USDT");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  // Simple conversion rates (in real app, fetch from API)
  const BTC_TO_USDT_RATE = 45000;
  const USDT_TO_BTC_RATE = 1 / BTC_TO_USDT_RATE;

  useEffect(() => {
    if (fromAmount) {
      const amount = parseFloat(fromAmount);
      if (!isNaN(amount)) {
        if (fromAsset === "BTC" && toAsset === "USDT") {
          setToAmount((amount * BTC_TO_USDT_RATE).toFixed(2));
        } else if (fromAsset === "USDT" && toAsset === "BTC") {
          setToAmount((amount * USDT_TO_BTC_RATE).toFixed(8));
        }
      }
    } else {
      setToAmount("");
    }
  }, [fromAmount, fromAsset, toAsset]);

  const handleSwapAssets = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setFromAmount(toAmount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromAmount || !toAmount) {
      toast({
        title: "Error",
        description: "Please enter an amount",
        variant: "destructive",
      });
      return;
    }

    const fromAmountNum = parseFloat(fromAmount);
    const toAmountNum = parseFloat(toAmount);

    if (isNaN(fromAmountNum) || isNaN(toAmountNum)) {
      toast({
        title: "Error",
        description: "Please enter valid amounts",
        variant: "destructive",
      });
      return;
    }

    // Check if user has sufficient balance
    const currentBtcBalance = parseFloat(user?.btcBalance || "0");
    const currentUsdtBalance = parseFloat(user?.usdtBalance || "0");

    if (fromAsset === "BTC" && fromAmountNum > currentBtcBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${currentBtcBalance.toFixed(8)} BTC`,
        variant: "destructive",
      });
      return;
    }

    if (fromAsset === "USDT" && fromAmountNum > currentUsdtBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${currentUsdtBalance.toFixed(2)} USDT`,
        variant: "destructive",
      });
      return;
    }

    // Update user balances
    const newBtcBalance =
      fromAsset === "BTC"
        ? (currentBtcBalance - fromAmountNum).toFixed(8)
        : (currentBtcBalance + toAmountNum).toFixed(8);

    const newUsdtBalance =
      fromAsset === "USDT"
        ? (currentUsdtBalance - fromAmountNum).toFixed(2)
        : (currentUsdtBalance + toAmountNum).toFixed(2);

    updateUser({
      btcBalance: newBtcBalance,
      usdtBalance: newUsdtBalance,
    });

    toast({
      title: "Success",
      description: "Swap completed successfully",
    });

    setFromAmount("");
    setToAmount("");
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const currentBtcBalance = parseFloat(user?.btcBalance || "0");
  const currentUsdtBalance = parseFloat(user?.usdtBalance || "0");

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-bitoja-black mb-2">
            Swap Tokens
          </h1>
          <p className="text-gray-600">Exchange BTC and USDT instantly</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Token Swap</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* From Asset */}
              <div className="space-y-2">
                <Label htmlFor="fromAmount">From</Label>
                <div className="flex space-x-2">
                  <Input
                    id="fromAmount"
                    type="number"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="flex-1"
                  />
                  <div className="w-24">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      {fromAsset}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Balance:{" "}
                  {fromAsset === "BTC"
                    ? `${currentBtcBalance.toFixed(8)} BTC`
                    : `${currentUsdtBalance.toFixed(2)} USDT`}
                </p>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleSwapAssets}
                  className="rounded-full"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </div>

              {/* To Asset */}
              <div className="space-y-2">
                <Label htmlFor="toAmount">To</Label>
                <div className="flex space-x-2">
                  <Input
                    id="toAmount"
                    type="number"
                    placeholder="0.00"
                    value={toAmount}
                    onChange={(e) => setToAmount(e.target.value)}
                    className="flex-1"
                    readOnly
                  />
                  <div className="w-24">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      {toAsset}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Balance:{" "}
                  {toAsset === "BTC"
                    ? `${currentBtcBalance.toFixed(8)} BTC`
                    : `${currentUsdtBalance.toFixed(2)} USDT`}
                </p>
              </div>

              {/* Rate Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rate:</span>
                  <span className="font-medium">
                    1 {fromAsset} ={" "}
                    {fromAsset === "BTC"
                      ? BTC_TO_USDT_RATE.toLocaleString()
                      : USDT_TO_BTC_RATE.toFixed(8)}{" "}
                    {toAsset}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-bitoja-green hover:bg-bitoja-green-dark text-white"
                disabled={!fromAmount || !toAmount}
              >
                Swap Tokens
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
