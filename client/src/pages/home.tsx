import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/ui/navigation";
import WalletCards from "@/components/ui/wallet-cards";
import QuickActions from "@/components/ui/quick-actions";
import AdList from "@/components/ui/ad-list";
import BottomNavigation from "@/components/ui/bottom-navigation";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-bitoja-green rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-bitoja-black mb-2">
            Welcome back, {user?.firstName || user?.email || "Trader"}
          </h1>
          <p className="text-gray-600">Your trading dashboard</p>
        </div>

        <WalletCards />
        <QuickActions />
        <AdList title="Recent Advertisements" limit={10} />
      </div>

      <BottomNavigation />
    </div>
  );
}
