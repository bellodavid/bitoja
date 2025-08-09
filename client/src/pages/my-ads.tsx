import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/ui/navigation";
import BottomNavigation from "@/components/ui/bottom-navigation";
import CreateAdModal from "@/components/ui/create-ad-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";

// Mock data for user's advertisements
const mockUserAds = [
  {
    id: "1",
    tradeType: "BUY",
    asset: "BTC",
    currency: "USD",
    rate: "45000",
    minLimit: "100",
    maxLimit: "10000",
    paymentMethod: "BANK_TRANSFER",
    status: "ACTIVE",
    createdAt: "2024-01-15T10:30:00Z",
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
    status: "ACTIVE",
    createdAt: "2024-01-14T15:45:00Z",
  },
];

export default function MyAds() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ads, setAds] = useState(mockUserAds);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const handleDeleteAd = (adId: string) => {
    setAds((prevAds) => prevAds.filter((ad) => ad.id !== adId));
    toast({
      title: "Success",
      description: "Advertisement deleted successfully",
    });
  };

  const handleCreateAd = (newAd: any) => {
    const adWithId = {
      ...newAd,
      id: Date.now().toString(),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    setAds((prevAds) => [adWithId, ...prevAds]);
    setShowCreateModal(false);
    toast({
      title: "Success",
      description: "Advertisement created successfully",
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

  const formatPaymentMethod = (method: string) => {
    return method.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-bitoja-black mb-2">
              My Advertisements
            </h1>
            <p className="text-gray-600">Manage your trading offers</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-bitoja-green hover:bg-bitoja-green-dark text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Ad
          </Button>
        </div>

        {ads.length > 0 ? (
          <div className="space-y-4">
            {ads.map((ad) => (
              <Card key={ad.id}>
                <CardContent className="p-6">
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
                          <span className="text-sm text-gray-500">
                            {getCurrencySymbol(ad.currency)}
                            {parseFloat(ad.rate).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatPaymentMethod(ad.paymentMethod)} •{" "}
                          {getCurrencySymbol(ad.currency)}
                          {parseFloat(ad.minLimit).toLocaleString()} -{" "}
                          {getCurrencySymbol(ad.currency)}
                          {parseFloat(ad.maxLimit).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAd(ad.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
                <span className="text-gray-400 text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No advertisements yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first advertisement to start trading
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-bitoja-green hover:bg-bitoja-green-dark text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Ad
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />

      <CreateAdModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAd}
      />
    </div>
  );
}
