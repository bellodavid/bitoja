import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TradeModal from "@/components/ui/trade-modal";
import {
  Bitcoin,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Shield,
  Globe,
  RefreshCw,
  SortAsc,
  SortDesc,
} from "lucide-react";

// Types and Interfaces
interface Advertisement {
  id: string;
  tradeType: "BUY" | "SELL";
  asset: "BTC" | "USDT";
  currency: string;
  rate: string;
  minLimit: string;
  maxLimit: string;
  paymentMethod: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    rating: number;
    completedTrades: number;
    isOnline: boolean;
  };
  createdAt: string;
  terms?: string;
}

interface FilterState {
  asset: string;
  tradeType: string;
  currency: string;
  search: string;
  sortBy: "rate" | "created" | "rating";
  sortOrder: "asc" | "desc";
}

// Mock data with enhanced structure
const mockAds: Advertisement[] = [
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
      rating: 4.8,
      completedTrades: 156,
      isOnline: true,
    },
    createdAt: "2024-01-15T10:30:00Z",
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
    user: {
      id: "user2",
      firstName: "Jane",
      lastName: "Smith",
      rating: 4.9,
      completedTrades: 243,
      isOnline: true,
    },
    createdAt: "2024-01-15T09:15:00Z",
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
    user: {
      id: "user3",
      firstName: "Mike",
      lastName: "Johnson",
      rating: 4.7,
      completedTrades: 89,
      isOnline: false,
    },
    createdAt: "2024-01-15T08:45:00Z",
    terms: "SEPA transfers only. Minimum 2 hours for verification.",
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
    user: {
      id: "user4",
      firstName: "Adaora",
      lastName: "Okafor",
      rating: 5.0,
      completedTrades: 312,
      isOnline: true,
    },
    createdAt: "2024-01-15T11:20:00Z",
    terms: "Nigerian banks only. Quick release within 10 minutes.",
  },
  {
    id: "5",
    tradeType: "BUY",
    asset: "USDT",
    currency: "GHS",
    rate: "12.50",
    minLimit: "100",
    maxLimit: "10000",
    paymentMethod: "MOBILE_MONEY",
    user: {
      id: "user5",
      firstName: "Kwame",
      lastName: "Asante",
      rating: 4.6,
      completedTrades: 67,
      isOnline: true,
    },
    createdAt: "2024-01-15T07:30:00Z",
    terms: "MTN Mobile Money preferred. Available weekdays 9-5.",
  },
];

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi" },
];

const paymentMethods = [
  "BANK_TRANSFER",
  "MOBILE_MONEY",
  "WIRE_TRANSFER",
  "PAYPAL",
  "CASH_DEPOSIT",
];

export default function BrowseAds() {
  const { isAuthenticated, isLoading } = useAuth();
  const [filters, setFilters] = useState<FilterState>({
    asset: "",
    tradeType: "",
    currency: "",
    search: "",
    sortBy: "created",
    sortOrder: "desc",
  });
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtered and sorted ads using useMemo for performance
  const filteredAds = useMemo(() => {
    let result = mockAds.filter((ad) => {
      if (filters.asset && ad.asset !== filters.asset) return false;
      if (filters.tradeType && ad.tradeType !== filters.tradeType) return false;
      if (filters.currency && ad.currency !== filters.currency) return false;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const userFullName =
          `${ad.user.firstName} ${ad.user.lastName}`.toLowerCase();
        const paymentMethod = ad.paymentMethod.toLowerCase().replace("_", " ");
        return (
          userFullName.includes(searchTerm) ||
          paymentMethod.includes(searchTerm) ||
          ad.asset.toLowerCase().includes(searchTerm)
        );
      }
      return true;
    });

    // Sort results
    result.sort((a, b) => {
      const multiplier = filters.sortOrder === "asc" ? 1 : -1;
      switch (filters.sortBy) {
        case "rate":
          return multiplier * (parseFloat(a.rate) - parseFloat(b.rate));
        case "rating":
          return multiplier * (a.user.rating - b.user.rating);
        case "created":
        default:
          return (
            multiplier *
            (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          );
      }
    });

    return result;
  }, [filters]);

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

  const handleSortChange = useCallback((sortBy: FilterState["sortBy"]) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder:
        prev.sortBy === sortBy && prev.sortOrder === "desc" ? "asc" : "desc",
    }));
  }, []);

  const handleAdClick = useCallback((ad: Advertisement) => {
    setSelectedAd(ad);
    setShowTradeModal(true);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      asset: "",
      tradeType: "",
      currency: "",
      search: "",
      sortBy: "created",
      sortOrder: "desc",
    });
  }, []);

  // Utility functions
  const getCurrencyInfo = (currencyCode: string) => {
    return (
      currencies.find((c) => c.code === currencyCode) || {
        symbol: "",
        name: currencyCode,
      }
    );
  };

  const formatPaymentMethod = (method: string) => {
    return method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (isLoading || !isAuthenticated) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-lime-400 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Search className="text-black h-6 w-6" />
            </div>
            <p className="text-gray-400 text-lg">Loading marketplace...</p>
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
          <Flex justify="between" align="center" className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Trade Marketplace
              </h1>
              <p className="text-gray-400">
                Find the best trading opportunities • {filteredAds.length} ads
                available
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

          {/* Search and Filters */}
          <ThemedCard className="mb-6">
            <ThemedCardHeader
              title="Search & Filters"
              description="Find exactly what you're looking for"
              icon={<Filter className="h-6 w-6 text-black" />}
            />
            <ThemedCardContent className="p-6 pt-0">
              {/* Search Bar */}
              <div className="mb-6">
                <Label
                  htmlFor="search"
                  className="text-sm font-medium text-gray-300 mb-2"
                >
                  Search traders, payment methods, or assets
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search marketplace..."
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

              <Grid
                cols={1}
                gap="md"
                className="mb-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {/* Asset Filter */}
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
                      <Bitcoin className="h-4 w-4 mr-1" />
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

                {/* Trade Type Filter */}
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
                      <TrendingUp className="h-4 w-4 mr-1" />
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
                      <TrendingDown className="h-4 w-4 mr-1" />
                      Sell
                    </OutlineButton>
                  </Flex>
                </div>

                {/* Currency Filter */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <Label className="text-sm font-medium text-gray-300 mb-2 block">
                    Currency
                  </Label>
                  <Flex gap="sm" className="flex-wrap">
                    {currencies.map((currency) => (
                      <OutlineButton
                        key={currency.code}
                        onClick={() =>
                          handleFilterChange("currency", currency.code)
                        }
                        className={
                          filters.currency === currency.code
                            ? "bg-lime-400/10 border-lime-400 text-lime-400"
                            : ""
                        }
                        size="sm"
                      >
                        {currency.symbol} {currency.code}
                      </OutlineButton>
                    ))}
                  </Flex>
                </div>
              </Grid>

              {/* Sort and Clear */}
              <Flex
                justify="between"
                align="center"
                className="flex-col sm:flex-row gap-4 sm:gap-0"
              >
                <div className="w-full sm:w-auto">
                  <Flex gap="sm" className="flex-wrap">
                    <Label className="text-sm font-medium text-gray-300 whitespace-nowrap">
                      Sort by:
                    </Label>
                    {(["rate", "created", "rating"] as const).map(
                      (sortOption) => (
                        <OutlineButton
                          key={sortOption}
                          onClick={() => handleSortChange(sortOption)}
                          className={
                            filters.sortBy === sortOption
                              ? "bg-lime-400/10 border-lime-400 text-lime-400"
                              : ""
                          }
                          size="sm"
                          icon={
                            filters.sortBy === sortOption ? (
                              filters.sortOrder === "desc" ? (
                                <SortDesc className="h-3 w-3" />
                              ) : (
                                <SortAsc className="h-3 w-3" />
                              )
                            ) : undefined
                          }
                        >
                          {sortOption === "rate"
                            ? "Price"
                            : sortOption === "created"
                            ? "Newest"
                            : "Rating"}
                        </OutlineButton>
                      )
                    )}
                  </Flex>
                </div>
                <SecondaryButton
                  onClick={clearFilters}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Clear Filters
                </SecondaryButton>
              </Flex>
            </ThemedCardContent>
          </ThemedCard>

          {/* Ads List */}
          <ThemedCard>
            <ThemedCardHeader
              title="Available Advertisements"
              description={`${filteredAds.length} trading opportunities found`}
              icon={<Globe className="h-6 w-6 text-black" />}
            />
            <ThemedCardContent className="p-0">
              {filteredAds.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {filteredAds.map((ad, index) => (
                    <div
                      key={ad.id}
                      onClick={() => handleAdClick(ad)}
                      className="p-4 sm:p-6 hover:bg-white/[0.02] cursor-pointer transition-all duration-200"
                    >
                      <div className="space-y-4">
                        {/* Mobile Layout */}
                        <div className="sm:hidden">
                          <Flex gap="sm" className="mb-3">
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
                                  className="text-xs border-lime-400/30 text-lime-400"
                                >
                                  {ad.currency}
                                </Badge>
                                {ad.user.isOnline && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-emerald-400/30 text-emerald-400"
                                  >
                                    Online
                                  </Badge>
                                )}
                              </Flex>
                            </div>
                          </Flex>

                          {/* Price - Mobile */}
                          <div className="mb-3 p-3 bg-white/[0.02] rounded-lg">
                            <div className="text-xl font-bold text-white">
                              {getCurrencyInfo(ad.currency).symbol}
                              {parseFloat(ad.rate).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-400">
                              per {ad.asset}
                            </div>
                          </div>

                          {/* User Info - Mobile */}
                          <div className="mb-3">
                            <Flex
                              align="center"
                              gap="sm"
                              className="text-sm text-gray-400 flex-wrap"
                            >
                              <Users className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">
                                {ad.user.firstName} {ad.user.lastName}
                              </span>
                              <span>•</span>
                              <span>★ {ad.user.rating}</span>
                              <span>•</span>
                              <span>{ad.user.completedTrades} trades</span>
                            </Flex>
                            <div className="text-xs text-gray-500 mt-1">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {formatTimeAgo(ad.createdAt)}
                            </div>
                          </div>

                          {/* Payment Method and Limits - Mobile */}
                          <div className="space-y-2">
                            <Badge
                              variant="outline"
                              className="text-xs border-white/20 text-gray-300"
                            >
                              {formatPaymentMethod(ad.paymentMethod)}
                            </Badge>
                            <div className="text-sm text-gray-400">
                              Limits: {getCurrencyInfo(ad.currency).symbol}
                              {parseFloat(ad.minLimit).toLocaleString()} -{" "}
                              {getCurrencyInfo(ad.currency).symbol}
                              {parseFloat(ad.maxLimit).toLocaleString()}
                            </div>
                          </div>

                          {/* Terms Preview - Mobile */}
                          {ad.terms && (
                            <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
                              <p className="text-sm text-gray-400 line-clamp-2">
                                {ad.terms}
                              </p>
                            </div>
                          )}

                          {/* Action Button - Mobile */}
                          <PrimaryButton size="sm" className="w-full">
                            Trade Now
                          </PrimaryButton>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:block">
                          <Flex justify="between" align="start">
                            <Flex gap="md" className="flex-1">
                              {/* Trade Type Badge */}
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

                              {/* Ad Details */}
                              <div className="flex-1 min-w-0">
                                <Flex
                                  justify="between"
                                  align="start"
                                  className="mb-2"
                                >
                                  <div className="flex-1 min-w-0">
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
                                      {ad.user.isOnline && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs border-emerald-400/30 text-emerald-400"
                                        >
                                          Online
                                        </Badge>
                                      )}
                                    </Flex>
                                    <Flex
                                      align="center"
                                      gap="sm"
                                      className="text-sm text-gray-400 flex-wrap"
                                    >
                                      <Users className="h-4 w-4 flex-shrink-0" />
                                      <span className="truncate">
                                        {ad.user.firstName} {ad.user.lastName}
                                      </span>
                                      <span>•</span>
                                      <span>★ {ad.user.rating}</span>
                                      <span>•</span>
                                      <span>
                                        {ad.user.completedTrades} trades
                                      </span>
                                      <span>•</span>
                                      <Clock className="h-4 w-4 flex-shrink-0" />
                                      <span>{formatTimeAgo(ad.createdAt)}</span>
                                    </Flex>
                                  </div>

                                  {/* Price */}
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

                                {/* Payment Method and Limits */}
                                <Flex
                                  justify="between"
                                  align="center"
                                  className="flex-wrap gap-2"
                                >
                                  <div>
                                    <Badge
                                      variant="outline"
                                      className="text-xs border-white/20 text-gray-300 mb-1"
                                    >
                                      {formatPaymentMethod(ad.paymentMethod)}
                                    </Badge>
                                    <div className="text-sm text-gray-400">
                                      Limits:{" "}
                                      {getCurrencyInfo(ad.currency).symbol}
                                      {parseFloat(
                                        ad.minLimit
                                      ).toLocaleString()}{" "}
                                      - {getCurrencyInfo(ad.currency).symbol}
                                      {parseFloat(ad.maxLimit).toLocaleString()}
                                    </div>
                                  </div>
                                  <PrimaryButton
                                    size="sm"
                                    className="flex-shrink-0"
                                  >
                                    Trade Now
                                  </PrimaryButton>
                                </Flex>

                                {/* Terms Preview */}
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No ads found
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <SecondaryButton onClick={clearFilters}>
                    Clear all filters
                  </SecondaryButton>
                </div>
              )}
            </ThemedCardContent>
          </ThemedCard>
        </Section>
      </Container>

      <BottomNavigation />

      {/* Trade Modal */}
      <TradeModal
        isOpen={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        ad={selectedAd}
      />
    </PageLayout>
  );
}
