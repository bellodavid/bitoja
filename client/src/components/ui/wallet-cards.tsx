import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WalletCards() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const btcBalance = parseFloat(user?.btcBalance || "0");
  const usdtBalance = parseFloat(user?.usdtBalance || "0");
  const btcUsdValue = btcBalance * 45000; // Example rate
  const usdtUsdValue = usdtBalance * 1;

  const handleAddDemoBalance = () => {
    const newBtcBalance = (btcBalance + 0.001).toFixed(8);
    const newUsdtBalance = (usdtBalance + 100).toFixed(2);

    updateUser({
      btcBalance: newBtcBalance,
      usdtBalance: newUsdtBalance,
    });

    toast({
      title: "Demo balance added",
      description:
        "Your wallet has been funded with demo BTC and USDT for testing",
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* BTC Wallet */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold">₿</span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">Bitcoin</h3>
                <p className="text-sm text-gray-500">BTC</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-bitoja-green hover:text-bitoja-green-dark"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900">
              {btcBalance.toFixed(8)}
            </p>
            <p className="text-sm text-gray-500">
              ≈ $
              {btcUsdValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* USDT Wallet */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">₮</span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">Tether</h3>
                <p className="text-sm text-gray-500">USDT</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-bitoja-green hover:text-bitoja-green-dark"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900">
              {usdtBalance.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">
              ≈ $
              {usdtUsdValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Demo Balance Button */}
      {btcBalance === 0 && usdtBalance === 0 && (
        <div className="md:col-span-2 mt-4">
          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">
                Get Started with Demo Funds
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your wallet is empty. Add demo balance to start trading and
                testing the platform!
              </p>
              <Button
                onClick={handleAddDemoBalance}
                className="bg-bitoja-green hover:bg-bitoja-green-dark"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Demo Balance
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
