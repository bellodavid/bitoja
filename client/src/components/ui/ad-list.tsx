import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TradeModal from "./trade-modal";

interface AdListProps {
  title: string;
  limit?: number;
  filters?: {
    asset?: string;
    tradeType?: string;
    currency?: string;
  };
  showCreateButton?: boolean;
}

// Mock data for advertisements
const mockAds = [
  {
    id: "1",
    tradeType: "BUY",
    asset: "BTC",
    currency: "USD",
    rate: "45000",
    minLimit: "100",
    maxLimit: "10000",
    paymentMethod: "BANK_TRANSFER",
    user: {
      id: "user1",
      firstName: "John",
      lastName: "Doe",
    },
  },
  {
    id: "2",
    tradeType: "SELL",
    asset: "USDT",
    currency: "USD",
    rate: "1.00",
    minLimit: "50",
    maxLimit: "5000",
    paymentMethod: "MOBILE_MONEY",
    user: {
      id: "user2",
      firstName: "Jane",
      lastName: "Smith",
    },
  },
  {
    id: "3",
    tradeType: "BUY",
    asset: "BTC",
    currency: "EUR",
    rate: "42000",
    minLimit: "200",
    maxLimit: "20000",
    paymentMethod: "WIRE_TRANSFER",
    user: {
      id: "user3",
      firstName: "Mike",
      lastName: "Johnson",
    },
  },
];

export default function AdList({
  title,
  limit,
  filters,
  showCreateButton = true,
}: AdListProps) {
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);

  // Filter mock ads based on filters
  let filteredAds = mockAds;
  if (filters) {
    filteredAds = mockAds.filter((ad) => {
      if (filters.asset && ad.asset !== filters.asset) return false;
      if (filters.tradeType && ad.tradeType !== filters.tradeType) return false;
      if (filters.currency && ad.currency !== filters.currency) return false;
      return true;
    });
  }

  // Apply limit
  if (limit) {
    filteredAds = filteredAds.slice(0, limit);
  }

  const handleAdClick = (ad: any) => {
    setSelectedAd(ad);
    setShowTradeModal(true);
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

  const formatPaymentMethod = (method: string) => {
    return method.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <>
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {showCreateButton && (
              <Button
                variant="ghost"
                className="text-bitoja-green hover:text-bitoja-green-dark text-sm font-medium"
              >
                View All
              </Button>
            )}
          </div>
        </div>

        {filteredAds.length > 0 ? (
          <div>
            {filteredAds.map((ad: any, index: number) => (
              <div
                key={ad.id}
                onClick={() => handleAdClick(ad)}
                className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  index < filteredAds.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        ad.tradeType === "BUY" ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      <span
                        className={`font-bold text-sm ${
                          ad.tradeType === "BUY"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {ad.tradeType}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {ad.asset} {ad.tradeType}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {ad.currency}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {ad.user.firstName} {ad.user.lastName} •{" "}
                        {formatPaymentMethod(ad.paymentMethod)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {getCurrencySymbol(ad.currency)}
                      {parseFloat(ad.rate).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getCurrencySymbol(ad.currency)}
                      {parseFloat(ad.minLimit).toLocaleString()} -{" "}
                      {getCurrencySymbol(ad.currency)}
                      {parseFloat(ad.maxLimit).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No advertisements found.
          </div>
        )}
      </Card>

      <TradeModal
        isOpen={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        ad={selectedAd}
      />
    </>
  );
}
