import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/ui/navigation";
import BottomNavigation from "@/components/ui/bottom-navigation";
import CreateAdModal from "@/components/ui/create-ad-modal";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Bitcoin,
  Search,
  Filter,
  Eye,
  EyeOff,
  MoreVertical,
  Calendar,
  DollarSign,
  Activity,
  RefreshCw,
  FileText,
  Clock,
  AlertTriangle,
} from "lucide-react";

// Enhanced types
interface Advertisement {
  id: string;
  tradeType: "BUY" | "SELL";
  asset: "BTC" | "USDT";
  currency: string;
  rate: string;
  minLimit: string;
  maxLimit: string;
  paymentMethod: string;
  status: "ACTIVE" | "PAUSED" | "EXPIRED" | "DELETED";
  createdAt: string;
  updatedAt?: string;
  views: number;
  trades: number;
  terms?: string;
}

interface FilterState {
  search: string;
  status: string;
  asset: string;
  tradeType: string;
}

// Enhanced mock data
const mockUserAds: Advertisement[] = [
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
    updatedAt: "2024-01-15T10:30:00Z",
    views: 126,
    trades: 8,
    terms: "Payment within 15 minutes. Bank transfer only.",
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
    updatedAt: "2024-01-14T15:45:00Z",
    views: 89,
    trades: 5,
    terms: "Fast mobile money transfer. Online 24/7.",
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
    status: "PAUSED",
    createdAt: "2024-01-13T08:20:00Z",
    updatedAt: "2024-01-14T12:00:00Z",
    views: 45,
    trades: 2,
    terms: "SEPA transfers only. Weekend trading available.",
  },
  {
    id: "4",
    tradeType: "SELL",
    asset: "BTC",
    currency: "NGN",
    rate: "68500000",
    minLimit: "50000",
    maxLimit: "5000000",
    paymentMethod: "BANK_TRANSFER",
    status: "EXPIRED",
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-12T16:30:00Z",
    views: 203,
    trades: 12,
  },
];

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi" },
];

const statusConfig = {
  ACTIVE: {
    color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    label: "Active",
  },
  PAUSED: {
    color: "text-amber-400 border-amber-400/30 bg-amber-400/10",
    label: "Paused",
  },
  EXPIRED: {
    color: "text-red-400 border-red-400/30 bg-red-400/10",
    label: "Expired",
  },
  DELETED: {
    color: "text-gray-400 border-gray-400/30 bg-gray-400/10",
    label: "Deleted",
  },
};

export default function MyAds() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ads, setAds] = useState<Advertisement[]>(mockUserAds);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "",
    asset: "",
    tradeType: "",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Computed values
  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (
          !ad.asset.toLowerCase().includes(searchTerm) &&
          !ad.currency.toLowerCase().includes(searchTerm) &&
          !ad.paymentMethod.toLowerCase().includes(searchTerm)
        ) {
          return false;
        }
      }
      if (filters.status && ad.status !== filters.status) return false;
      if (filters.asset && ad.asset !== filters.asset) return false;
      if (filters.tradeType && ad.tradeType !== filters.tradeType) return false;
      return true;
    });
  }, [ads, filters]);

  const stats = useMemo(() => {
    const activeAds = ads.filter((ad) => ad.status === "ACTIVE").length;
    const totalViews = ads.reduce((sum, ad) => sum + ad.views, 0);
    const totalTrades = ads.reduce((sum, ad) => sum + ad.trades, 0);
    const successRate =
      totalTrades > 0
        ? ((totalTrades / (totalViews + totalTrades)) * 100).toFixed(1)
        : "0";

    return [
      {
        label: "Active Ads",
        value: activeAds.toString(),
        icon: Activity,
        color: "text-emerald-400",
      },
      {
        label: "Total Views",
        value: totalViews.toString(),
        icon: Eye,
        color: "text-blue-400",
      },
      {
        label: "Completed Trades",
        value: totalTrades.toString(),
        icon: DollarSign,
        color: "text-lime-400",
      },
      {
        label: "Success Rate",
        value: `${successRate}%`,
        icon: TrendingUp,
        color: "text-purple-400",
      },
    ];
  }, [ads]);

  // Utility functions
  const getCurrencyInfo = useCallback((currencyCode: string) => {
    return (
      currencies.find((c) => c.code === currencyCode) || {
        symbol: "",
        name: currencyCode,
      }
    );
  }, []);

  const formatPaymentMethod = useCallback((method: string) => {
    return method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }, []);

  const formatTimeAgo = useCallback((dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  }, []);

  // Handlers
  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === prev[key] ? "" : value,
      }));
    },
    []
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Your advertisements have been updated",
    });
  }, [toast]);

  const handleDeleteAd = useCallback(
    (adId: string) => {
      setAds((prevAds) => prevAds.filter((ad) => ad.id !== adId));
      toast({
        title: "Advertisement Deleted",
        description: "Your advertisement has been successfully removed",
      });
    },
    [toast]
  );

  const handleToggleStatus = useCallback(
    (adId: string) => {
      setAds((prevAds) =>
        prevAds.map((ad) =>
          ad.id === adId
            ? {
                ...ad,
                status: ad.status === "ACTIVE" ? "PAUSED" : "ACTIVE",
                updatedAt: new Date().toISOString(),
              }
            : ad
        )
      );
      toast({
        title: "Status Updated",
        description: "Advertisement status has been changed",
      });
    },
    [toast]
  );

  const handleCreateAd = useCallback(
    (newAd: any) => {
      const adWithId: Advertisement = {
        ...newAd,
        id: Date.now().toString(),
        status: "ACTIVE" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        trades: 0,
      };
      setAds((prevAds) => [adWithId, ...prevAds]);
      setShowCreateModal(false);
      toast({
        title: "Advertisement Created",
        description: "Your new advertisement is now live",
      });
    },
    [toast]
  );

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      status: "",
      asset: "",
      tradeType: "",
    });
  }, []);

  if (isLoading || !isAuthenticated) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-lime-400 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <FileText className="text-black h-6 w-6" />
            </div>
            <p className="text-gray-400 text-lg">Loading your ads...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Navigation />

      <Container>
        <Section spacing="sm">
          {/* Header */}
          <Flex
            justify="between"
            align="center"
            className="mb-8 flex-col sm:flex-row gap-4 sm:gap-0"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                My Advertisements
              </h1>
              <p className="text-gray-400">
                Manage your trading offers • {filteredAds.length} of{" "}
                {ads.length} ads
              </p>
            </div>
            <Flex gap="sm" className="w-full sm:w-auto">
              <SecondaryButton
                onClick={handleRefresh}
                disabled={isRefreshing}
                icon={
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                }
                size="sm"
                className="flex-1 sm:flex-none"
              >
                Refresh
              </SecondaryButton>
              <PrimaryButton
                onClick={() => setShowCreateModal(true)}
                icon={<Plus className="h-4 w-4" />}
                className="flex-1 sm:flex-none"
              >
                Create Ad
              </PrimaryButton>
            </Flex>
          </Flex>

          {/* Stats */}
          <Grid cols={4} gap="md" className="mb-8">
            {stats.map((stat, index) => (
              <ThemedCard key={index} variant="stat">
                <ThemedCardContent className="p-4 sm:p-6">
                  <Flex justify="between" align="start" className="mb-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 ${stat.color}`}
                    >
                      <stat.icon className="h-4 w-4" />
                    </div>
                  </Flex>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-white mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {stat.label}
                    </p>
                  </div>
                </ThemedCardContent>
              </ThemedCard>
            ))}
          </Grid>

          {/* Filters */}
          <ThemedCard className="mb-6">
            <ThemedCardHeader
              title="Filter & Search"
              description="Find specific advertisements"
              icon={<Filter className="h-6 w-6 text-black" />}
            />
            <ThemedCardContent className="p-4 sm:p-6 pt-0">
              {/* Search */}
              <div className="mb-4">
                <Label
                  htmlFor="search"
                  className="text-sm font-medium text-gray-300 mb-2 block"
                >
                  Search advertisements
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by asset, currency, or payment method..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    className="pl-10 bg-white/[0.02] border-white/10 text-gray-100 placeholder:text-gray-500 focus:border-lime-400"
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <Grid
                cols={1}
                gap="md"
                className="mb-4 sm:grid-cols-2 lg:grid-cols-4"
              >
                <div>
                  <Label className="text-sm font-medium text-gray-300 mb-2 block">
                    Status
                  </Label>
                  <Flex gap="sm" className="flex-wrap">
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <OutlineButton
                        key={status}
                        onClick={() => handleFilterChange("status", status)}
                        className={
                          filters.status === status
                            ? "bg-lime-400/10 border-lime-400 text-lime-400"
                            : ""
                        }
                        size="sm"
                      >
                        {config.label}
                      </OutlineButton>
                    ))}
                  </Flex>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-300 mb-2 block">
                    Asset
                  </Label>
                  <Flex gap="sm" className="flex-wrap">
                    <OutlineButton
                      onClick={() => handleFilterChange("asset", "BTC")}
                      className={
                        filters.asset === "BTC"
                          ? "bg-lime-400/10 border-lime-400 text-lime-400"
                          : ""
                      }
                      size="sm"
                    >
                      <Bitcoin className="h-3 w-3 mr-1" />
                      BTC
                    </OutlineButton>
                    <OutlineButton
                      onClick={() => handleFilterChange("asset", "USDT")}
                      className={
                        filters.asset === "USDT"
                          ? "bg-lime-400/10 border-lime-400 text-lime-400"
                          : ""
                      }
                      size="sm"
                    >
                      ₮ USDT
                    </OutlineButton>
                  </Flex>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-300 mb-2 block">
                    Trade Type
                  </Label>
                  <Flex gap="sm" className="flex-wrap">
                    <OutlineButton
                      onClick={() => handleFilterChange("tradeType", "BUY")}
                      className={
                        filters.tradeType === "BUY"
                          ? "bg-emerald-400/10 border-emerald-400 text-emerald-400"
                          : ""
                      }
                      size="sm"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Buy
                    </OutlineButton>
                    <OutlineButton
                      onClick={() => handleFilterChange("tradeType", "SELL")}
                      className={
                        filters.tradeType === "SELL"
                          ? "bg-red-400/10 border-red-400 text-red-400"
                          : ""
                      }
                      size="sm"
                    >
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Sell
                    </OutlineButton>
                  </Flex>
                </div>

                <div className="flex items-end">
                  <SecondaryButton
                    onClick={clearFilters}
                    size="sm"
                    className="w-full"
                  >
                    Clear Filters
                  </SecondaryButton>
                </div>
              </Grid>
            </ThemedCardContent>
          </ThemedCard>

          {/* Ads List */}
          {filteredAds.length > 0 ? (
            <div className="space-y-4">
              {filteredAds.map((ad) => (
                <ThemedCard key={ad.id} hover>
                  <ThemedCardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {/* Mobile Layout */}
                      <div className="sm:hidden">
                        <Flex justify="between" align="start" className="mb-3">
                          <Flex gap="sm">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                ad.tradeType === "BUY"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {ad.tradeType === "BUY" ? (
                                <TrendingUp className="h-5 w-5" />
                              ) : (
                                <TrendingDown className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Flex
                                align="center"
                                gap="sm"
                                className="mb-1 flex-wrap"
                              >
                                <span className="font-semibold text-white text-base">
                                  {ad.tradeType} {ad.asset}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={statusConfig[ad.status].color}
                                >
                                  {statusConfig[ad.status].label}
                                </Badge>
                              </Flex>
                              <p className="text-sm text-gray-400">
                                {getCurrencyInfo(ad.currency).symbol}
                                {parseFloat(ad.rate).toLocaleString()} •{" "}
                                {formatPaymentMethod(ad.paymentMethod)}
                              </p>
                            </div>
                          </Flex>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <OutlineButton
                                size="sm"
                                className="flex-shrink-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </OutlineButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#0b0f13] border border-white/10">
                              <DropdownMenuItem className="text-gray-200 hover:bg-white/10">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(ad.id)}
                                className="text-gray-200 hover:bg-white/10"
                              >
                                {ad.status === "ACTIVE" ? (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteAd(ad.id)}
                                className="text-red-400 hover:bg-red-400/10"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </Flex>

                        {/* Stats - Mobile */}
                        <div className="grid grid-cols-3 gap-3 p-3 bg-white/[0.02] rounded-lg">
                          <div className="text-center">
                            <p className="text-lg font-bold text-white">
                              {ad.views}
                            </p>
                            <p className="text-xs text-gray-400">Views</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-white">
                              {ad.trades}
                            </p>
                            <p className="text-xs text-gray-400">Trades</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {formatTimeAgo(ad.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Limits - Mobile */}
                        <div className="text-sm text-gray-400">
                          Limits: {getCurrencyInfo(ad.currency).symbol}
                          {parseFloat(ad.minLimit).toLocaleString()} -{" "}
                          {getCurrencyInfo(ad.currency).symbol}
                          {parseFloat(ad.maxLimit).toLocaleString()}
                        </div>

                        {/* Terms - Mobile */}
                        {ad.terms && (
                          <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
                            <p className="text-sm text-gray-400 line-clamp-2">
                              {ad.terms}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:block">
                        <Flex justify="between" align="start">
                          <Flex gap="md" className="flex-1">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                ad.tradeType === "BUY"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {ad.tradeType === "BUY" ? (
                                <TrendingUp className="h-6 w-6" />
                              ) : (
                                <TrendingDown className="h-6 w-6" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <Flex
                                justify="between"
                                align="start"
                                className="mb-2"
                              >
                                <div>
                                  <Flex
                                    align="center"
                                    gap="sm"
                                    className="mb-1 flex-wrap"
                                  >
                                    <span className="font-semibold text-white text-lg">
                                      {ad.tradeType} {ad.asset}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs border-lime-400/30 text-lime-400"
                                    >
                                      {ad.currency}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className={statusConfig[ad.status].color}
                                    >
                                      {statusConfig[ad.status].label}
                                    </Badge>
                                  </Flex>
                                  <Flex
                                    align="center"
                                    gap="sm"
                                    className="text-sm text-gray-400 flex-wrap"
                                  >
                                    <span>
                                      {formatPaymentMethod(ad.paymentMethod)}
                                    </span>
                                    <span>•</span>
                                    <Eye className="h-4 w-4" />
                                    <span>{ad.views} views</span>
                                    <span>•</span>
                                    <DollarSign className="h-4 w-4" />
                                    <span>{ad.trades} trades</span>
                                    <span>•</span>
                                    <Clock className="h-4 w-4" />
                                    <span>{formatTimeAgo(ad.createdAt)}</span>
                                  </Flex>
                                </div>

                                <div className="text-right flex-shrink-0 ml-4">
                                  <div className="text-2xl font-bold text-white">
                                    {getCurrencyInfo(ad.currency).symbol}
                                    {parseFloat(ad.rate).toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    per {ad.asset}
                                  </div>
                                </div>
                              </Flex>

                              <Flex
                                justify="between"
                                align="center"
                                className="flex-wrap gap-2"
                              >
                                <div>
                                  <div className="text-sm text-gray-400">
                                    Limits:{" "}
                                    {getCurrencyInfo(ad.currency).symbol}
                                    {parseFloat(
                                      ad.minLimit
                                    ).toLocaleString()} -{" "}
                                    {getCurrencyInfo(ad.currency).symbol}
                                    {parseFloat(ad.maxLimit).toLocaleString()}
                                  </div>
                                </div>
                                <Flex gap="sm">
                                  <OutlineButton size="sm">
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </OutlineButton>
                                  <OutlineButton
                                    size="sm"
                                    onClick={() => handleToggleStatus(ad.id)}
                                    className={
                                      ad.status === "ACTIVE"
                                        ? "text-amber-400 border-amber-400/30"
                                        : "text-emerald-400 border-emerald-400/30"
                                    }
                                  >
                                    {ad.status === "ACTIVE" ? (
                                      <>
                                        <EyeOff className="h-4 w-4 mr-1" />
                                        Pause
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="h-4 w-4 mr-1" />
                                        Activate
                                      </>
                                    )}
                                  </OutlineButton>
                                  <OutlineButton
                                    size="sm"
                                    onClick={() => handleDeleteAd(ad.id)}
                                    className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </OutlineButton>
                                </Flex>
                              </Flex>

                              {ad.terms && (
                                <div className="mt-3 p-3 bg-white/[0.02] rounded-lg border border-white/5">
                                  <p className="text-sm text-gray-400 line-clamp-2">
                                    {ad.terms}
                                  </p>
                                </div>
                              )}
                            </div>
                          </Flex>
                        </Flex>
                      </div>
                    </div>
                  </ThemedCardContent>
                </ThemedCard>
              ))}
            </div>
          ) : (
            <ThemedCard>
              <ThemedCardContent className="p-8 sm:p-12 text-center">
                <div className="w-16 h-16 bg-gray-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {ads.length === 0 ? (
                    <FileText className="h-8 w-8 text-gray-500" />
                  ) : (
                    <Search className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {ads.length === 0
                    ? "No advertisements yet"
                    : "No matching advertisements"}
                </h3>
                <p className="text-gray-400 mb-6">
                  {ads.length === 0
                    ? "Create your first advertisement to start trading"
                    : "Try adjusting your filters to find what you're looking for"}
                </p>
                {ads.length === 0 ? (
                  <PrimaryButton
                    onClick={() => setShowCreateModal(true)}
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Create Your First Ad
                  </PrimaryButton>
                ) : (
                  <SecondaryButton onClick={clearFilters}>
                    Clear all filters
                  </SecondaryButton>
                )}
              </ThemedCardContent>
            </ThemedCard>
          )}
        </Section>
      </Container>

      <BottomNavigation />

      <CreateAdModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAd}
      />
    </PageLayout>
  );
}
