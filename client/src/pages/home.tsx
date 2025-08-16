import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/ui/navigation";
import BottomNavigation from "@/components/ui/bottom-navigation";
import {
  PageLayout,
  Container,
  Section,
  Grid,
  Flex,
} from "@/components/theme/layout";
import {
  ThemedCard,
  ThemedCardHeader,
  ThemedCardContent,
} from "@/components/theme/themed-card";
import {
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
} from "@/components/theme/themed-button";
import { Badge } from "@/components/ui/badge";
import {
  Bitcoin,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpDown,
  Search,
  Clock,
  FileText,
  Eye,
  Users,
  Shield,
  Zap,
  Activity,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user, updateUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-lime-400 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Bitcoin className="text-black h-6 w-6" />
            </div>
            <p className="text-gray-400 text-lg">Loading BitOja...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Mock data - in real app this would come from API
  const btcBalance = parseFloat(user?.btcBalance || "0");
  const usdtBalance = parseFloat(user?.usdtBalance || "0");
  const btcUsdValue = btcBalance * 45000; // Example rate
  const usdtUsdValue = usdtBalance * 1;
  const totalPortfolioValue = btcUsdValue + usdtUsdValue;

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast({
      title: "Data refreshed",
      description: "Your portfolio and market data have been updated",
    });
  };

  const stats = [
    {
      label: "Portfolio Value",
      value: `$${totalPortfolioValue.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      change: "+12.5%",
      positive: true,
    },
    {
      label: "Active Trades",
      value: "3",
      icon: Activity,
      change: "+2",
      positive: true,
    },
    {
      label: "24h Volume",
      value: "$2,450",
      icon: TrendingUp,
      change: "+8.2%",
      positive: true,
    },
    {
      label: "Success Rate",
      value: "98.5%",
      icon: Shield,
      change: "+0.5%",
      positive: true,
    },
  ];

  const quickActions = [
    {
      title: "Buy Bitcoin",
      description: "Purchase BTC instantly",
      icon: <Bitcoin className="h-6 w-6 text-black" />,
      href: "/buy",
      variant: "primary" as const,
    },
    {
      title: "Sell Bitcoin",
      description: "Convert BTC to cash",
      icon: <DollarSign className="h-6 w-6 text-black" />,
      href: "/sell",
      variant: "secondary" as const,
    },
    {
      title: "Browse Ads",
      description: "Find trading offers",
      icon: <Search className="h-6 w-6 text-black" />,
      href: "/browse",
      variant: "outline" as const,
    },
    {
      title: "Swap Tokens",
      description: "Exchange BTC ↔ USDT",
      icon: <ArrowUpDown className="h-6 w-6 text-black" />,
      href: "/swap",
      variant: "outline" as const,
    },
  ];

  const recentActivities = [
    {
      type: "buy",
      asset: "BTC",
      amount: "0.001",
      value: "$45.00",
      time: "2 min ago",
      status: "completed",
    },
    {
      type: "sell",
      asset: "USDT",
      amount: "100.00",
      value: "$100.00",
      time: "1 hour ago",
      status: "pending",
    },
    {
      type: "buy",
      asset: "BTC",
      amount: "0.005",
      value: "$225.00",
      time: "3 hours ago",
      status: "completed",
    },
  ];

  return (
    <PageLayout>
      <Navigation />

      <Container>
        <Section spacing="sm">
          {/* Header */}
          <Flex justify="between" align="center" className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back,{" "}
                {user?.displayName || user?.email?.split("@")[0] || "Trader"}
              </h1>
              <p className="text-gray-400">
                Your trading dashboard • Last updated:{" "}
                {new Date().toLocaleTimeString()}
              </p>
            </div>
            <PrimaryButton
              onClick={handleRefresh}
              disabled={isRefreshing}
              icon={
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              }
              size="sm"
            >
              Refresh
            </PrimaryButton>
          </Flex>

          {/* Stats Grid */}
          <Grid cols={4} gap="md" className="mb-8">
            {stats.map((stat, index) => (
              <ThemedCard key={index} variant="stat">
                <ThemedCardContent className="p-6">
                  <Flex justify="between" align="start" className="mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-lime-400 to-lime-500 rounded-xl flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-black" />
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        stat.positive
                          ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
                          : "text-red-400 border-red-400/30 bg-red-400/10"
                      }`}
                    >
                      {stat.change}
                    </Badge>
                  </Flex>
                  <div>
                    <p className="text-2xl font-bold text-white mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </div>
                </ThemedCardContent>
              </ThemedCard>
            ))}
          </Grid>

          {/* Wallet Cards */}
          <Grid cols={2} gap="md" className="mb-8">
            {/* BTC Wallet */}
            <ThemedCard>
              <ThemedCardHeader
                title="Bitcoin Wallet"
                description="BTC"
                icon={<Bitcoin className="h-6 w-6 text-black" />}
              />
              <ThemedCardContent className="p-6 pt-0">
                <div className="space-y-3">
                  <div>
                    <p className="text-3xl font-bold text-white">
                      {btcBalance.toFixed(8)}
                    </p>
                    <p className="text-lg text-gray-400">
                      ≈ $
                      {btcUsdValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <Flex gap="sm">
                    <SecondaryButton size="sm" className="flex-1">
                      <ArrowDown className="h-4 w-4 mr-1" />
                      Receive
                    </SecondaryButton>
                    <OutlineButton size="sm" className="flex-1">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      Send
                    </OutlineButton>
                  </Flex>
                </div>
              </ThemedCardContent>
            </ThemedCard>

            {/* USDT Wallet */}
            <ThemedCard>
              <ThemedCardHeader
                title="Tether Wallet"
                description="USDT"
                icon={<span className="text-black font-bold text-lg">₮</span>}
              />
              <ThemedCardContent className="p-6 pt-0">
                <div className="space-y-3">
                  <div>
                    <p className="text-3xl font-bold text-white">
                      {usdtBalance.toFixed(2)}
                    </p>
                    <p className="text-lg text-gray-400">
                      ≈ $
                      {usdtUsdValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <Flex gap="sm">
                    <SecondaryButton size="sm" className="flex-1">
                      <ArrowDown className="h-4 w-4 mr-1" />
                      Receive
                    </SecondaryButton>
                    <OutlineButton size="sm" className="flex-1">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      Send
                    </OutlineButton>
                  </Flex>
                </div>
              </ThemedCardContent>
            </ThemedCard>
          </Grid>

          {/* Demo Balance Card (if balances are empty) */}
          {btcBalance === 0 && usdtBalance === 0 && (
            <ThemedCard className="mb-8 border-dashed border-2 border-lime-400/30">
              <ThemedCardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-lime-400 to-lime-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Get Started with Demo Funds
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Your wallet is empty. Add demo balance to start trading and
                  testing the platform features!
                </p>
                <PrimaryButton onClick={handleAddDemoBalance} size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Demo Balance
                </PrimaryButton>
              </ThemedCardContent>
            </ThemedCard>
          )}

          {/* Quick Actions */}
          <ThemedCard className="mb-8">
            <ThemedCardHeader
              title="Quick Actions"
              description="Start trading with these shortcuts"
            />
            <ThemedCardContent className="p-6 pt-0">
              <Grid cols={4} gap="md">
                {quickActions.map((action, index) => (
                  <ThemedCard key={index} variant="accent" hover={true}>
                    <ThemedCardContent className="p-6">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-lime-400 to-lime-500 rounded-xl flex items-center justify-center mx-auto">
                          {action.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-1">
                            {action.title}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </ThemedCardContent>
                  </ThemedCard>
                ))}
              </Grid>
            </ThemedCardContent>
          </ThemedCard>

          {/* Recent Activity */}
          <ThemedCard>
            <ThemedCardHeader
              title="Recent Activity"
              description="Your latest trading activities"
              icon={<Clock className="h-6 w-6 text-black" />}
            />
            <ThemedCardContent className="p-6 pt-0">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/5"
                  >
                    <Flex align="center" gap="md">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === "buy"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {activity.type === "buy" ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {activity.type === "buy" ? "Bought" : "Sold"}{" "}
                          {activity.amount} {activity.asset}
                        </p>
                        <p className="text-sm text-gray-400">{activity.time}</p>
                      </div>
                    </Flex>
                    <Flex align="center" gap="md">
                      <div className="text-right">
                        <p className="font-medium text-white">
                          {activity.value}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            activity.status === "completed"
                              ? "text-emerald-400 border-emerald-400/30"
                              : "text-amber-400 border-amber-400/30"
                          }`}
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    </Flex>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <SecondaryButton>
                  <FileText className="h-4 w-4 mr-2" />
                  View All History
                </SecondaryButton>
              </div>
            </ThemedCardContent>
          </ThemedCard>
        </Section>
      </Container>

      <BottomNavigation />
    </PageLayout>
  );
}
