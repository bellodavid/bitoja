import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/ui/navigation";
import BottomNavigation from "@/components/ui/bottom-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, ArrowUpDown, AlertCircle } from "lucide-react";

// Mock data for trades and swaps
const mockTrades = [
  {
    id: "1",
    type: "trade",
    asset: "BTC",
    amount: "0.001",
    currency: "USD",
    rate: "45000",
    status: "COMPLETED",
    createdAt: "2024-01-15T10:30:00Z",
    counterparty: "John Doe",
  },
  {
    id: "2",
    type: "trade",
    asset: "USDT",
    amount: "100",
    currency: "USD",
    rate: "1.00",
    status: "PENDING",
    createdAt: "2024-01-14T15:45:00Z",
    counterparty: "Jane Smith",
  },
];

const mockSwaps = [
  {
    id: "1",
    type: "swap",
    fromAsset: "BTC",
    fromAmount: "0.001",
    toAsset: "USDT",
    toAmount: "45",
    rate: "45000",
    status: "COMPLETED",
    createdAt: "2024-01-13T12:00:00Z",
  },
];

export default function History() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "PENDING":
      case "PAID":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "DISPUTED":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "COMPLETED":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "PENDING":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "PAID":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "DISPUTED":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Combine and sort trades and swaps by date
  const allTransactions = [...mockTrades, ...mockSwaps].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "NGN":
        return "₦";
      case "GHS":
        return "₵";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-bitoja-black mb-2">
            Transaction History
          </h1>
          <p className="text-gray-600">Your trading and swap history</p>
        </div>

        {allTransactions.length > 0 ? (
          <div className="space-y-4">
            {allTransactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-bitoja-green rounded-full flex items-center justify-center">
                        {transaction.type === "swap" ? (
                          <ArrowUpDown className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {transaction.asset === "BTC" ? "₿" : "₮"}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {transaction.type === "swap"
                              ? `${transaction.fromAsset} → ${transaction.toAsset}`
                              : `${transaction.asset} ${transaction.type}`}
                          </span>
                          <span className={getStatusBadge(transaction.status)}>
                            {transaction.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.type === "swap"
                            ? `${transaction.fromAmount} ${transaction.fromAsset} → ${transaction.toAmount} ${transaction.toAsset}`
                            : `${transaction.amount} ${
                                transaction.asset
                              } • ${getCurrencySymbol(
                                transaction.currency
                              )}${parseFloat(
                                transaction.rate
                              ).toLocaleString()}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.type === "trade" &&
                            transaction.counterparty && (
                              <span>with {transaction.counterparty} • </span>
                            )}
                          {formatDate(transaction.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(transaction.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No transactions yet
              </h3>
              <p className="text-gray-500">
                Your trading and swap history will appear here
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
