import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/ui/navigation";
import AdList from "@/components/ui/ad-list";
import BottomNavigation from "@/components/ui/bottom-navigation";
import { Button } from "@/components/ui/button";

export default function BrowseAds() {
  const { isAuthenticated, isLoading } = useAuth();
  const [filters, setFilters] = useState({
    asset: "",
    tradeType: "",
    currency: "",
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === prev[key] ? "" : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-bitoja-black mb-2">
            Browse Advertisements
          </h1>
          <p className="text-gray-600">Find the best trading opportunities</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Filter Results
          </h2>

          <div className="space-y-4">
            {/* Asset Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filters.asset === "BTC" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("asset", "BTC")}
                  className={
                    filters.asset === "BTC"
                      ? "bg-bitoja-green hover:bg-bitoja-green-dark"
                      : ""
                  }
                >
                  Bitcoin (BTC)
                </Button>
                <Button
                  variant={filters.asset === "USDT" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("asset", "USDT")}
                  className={
                    filters.asset === "USDT"
                      ? "bg-bitoja-green hover:bg-bitoja-green-dark"
                      : ""
                  }
                >
                  Tether (USDT)
                </Button>
              </div>
            </div>

            {/* Trade Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trade Type
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filters.tradeType === "BUY" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("tradeType", "BUY")}
                  className={
                    filters.tradeType === "BUY"
                      ? "bg-bitoja-green hover:bg-bitoja-green-dark"
                      : ""
                  }
                >
                  Buy Offers
                </Button>
                <Button
                  variant={filters.tradeType === "SELL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("tradeType", "SELL")}
                  className={
                    filters.tradeType === "SELL"
                      ? "bg-bitoja-green hover:bg-bitoja-green-dark"
                      : ""
                  }
                >
                  Sell Offers
                </Button>
              </div>
            </div>

            {/* Currency Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filters.currency === "USD" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("currency", "USD")}
                  className={
                    filters.currency === "USD"
                      ? "bg-bitoja-green hover:bg-bitoja-green-dark"
                      : ""
                  }
                >
                  USD
                </Button>
                <Button
                  variant={filters.currency === "EUR" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("currency", "EUR")}
                  className={
                    filters.currency === "EUR"
                      ? "bg-bitoja-green hover:bg-bitoja-green-dark"
                      : ""
                  }
                >
                  EUR
                </Button>
                <Button
                  variant={filters.currency === "NGN" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("currency", "NGN")}
                  className={
                    filters.currency === "NGN"
                      ? "bg-bitoja-green hover:bg-bitoja-green-dark"
                      : ""
                  }
                >
                  NGN
                </Button>
                <Button
                  variant={filters.currency === "GHS" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("currency", "GHS")}
                  className={
                    filters.currency === "GHS"
                      ? "bg-bitoja-green hover:bg-bitoja-green-dark"
                      : ""
                  }
                >
                  GHS
                </Button>
              </div>
            </div>
          </div>
        </div>

        <AdList
          title="Available Advertisements"
          filters={filters}
          showCreateButton={false}
        />
      </div>

      <BottomNavigation />
    </div>
  );
}
