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
import {
  CheckCircle,
  Clock,
  ArrowUpDown,
  AlertTriangle,
  Bitcoin,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Activity,
  RefreshCw,
  History,
  Eye,
  ExternalLink,
  Users,
  CreditCard,
  ArrowLeftRight,
  Download,
} from "lucide-react";

// Enhanced types
interface Trade {
  id: string;
  type: "BUY" | "SELL";
  asset: "BTC" | "USDT";
  amount: string;
  currency: string;
  rate: string;
  status: "COMPLETED" | "PENDING" | "PAID" | "DISPUTED" | "CANCELLED";
  createdAt: string;
  completedAt?: string;
  counterparty: string;
  paymentMethod: string;
  tradeValue: string;
  fee: string;
}

interface Swap {
  id: string;
  type: "SWAP";
  fromAsset: "BTC" | "USDT";
  fromAmount: string;
  toAsset: "BTC" | "USDT";
  toAmount: string;
  rate: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
  createdAt: string;
  completedAt?: string;
  fee: string;
}

type Transaction = Trade | Swap;

interface FilterState {
  search: string;
  type: string;
  status: string;
  asset: string;
  timeRange: string;
}

// Enhanced mock data
const mockTrades: Trade[] = [
  {
    id: "trade_001",
    type: "BUY",
    asset: "BTC",
    amount: "0.00125",
    currency: "USD",
    rate: "45000",
    status: "COMPLETED",
    createdAt: "2024-01-15T10:30:00Z",
    completedAt: "2024-01-15T10:45:00Z",
    counterparty: "John Doe",
    paymentMethod: "BANK_TRANSFER",
    tradeValue: "56.25",
    fee: "0.56",
  },
  {
    id: "trade_002",
    type: "SELL",
    asset: "USDT",
    amount: "150",
    currency: "USD",
    rate: "1.00",
    status: "PENDING",
    createdAt: "2024-01-14T15:45:00Z",
    counterparty: "Jane Smith",
    paymentMethod: "MOBILE_MONEY",
    tradeValue: "150.00",
    fee: "1.50",
  },
  {
    id: "trade_003",
    type: "BUY",
    asset: "BTC",
    amount: "0.002",
    currency: "EUR",
    rate: "42000",
    status: "COMPLETED",
    createdAt: "2024-01-13T09:20:00Z",
    completedAt: "2024-01-13T09:35:00Z",
    counterparty: "Mike Johnson",
    paymentMethod: "WIRE_TRANSFER",
    tradeValue: "84.00",
    fee: "0.84",
  },
  {
    id: "trade_004",
    type: "SELL",
    asset: "BTC",
    amount: "0.0015",
    currency: "NGN",
    rate: "68500000",
    status: "DISPUTED",
    createdAt: "2024-01-12T14:10:00Z",
    counterparty: "Adaora Okafor",
    paymentMethod: "BANK_TRANSFER",
    tradeValue: "102750.00",
    fee: "1027.50",
  },
];

const mockSwaps: Swap[] = [
  {
    id: "swap_001",
    type: "SWAP",
    fromAsset: "BTC",
    fromAmount: "0.001",
    toAsset: "USDT",
    toAmount: "44.50",
    rate: "44500",
    status: "COMPLETED",
    createdAt: "2024-01-13T12:00:00Z",
    completedAt: "2024-01-13T12:02:00Z",
    fee: "0.45",
  },
  {
    id: "swap_002",
    type: "SWAP",
    fromAsset: "USDT",
    fromAmount: "100",
    toAsset: "BTC",
    toAmount: "0.00225",
    rate: "44444",
    status: "COMPLETED",
    createdAt: "2024-01-11T16:30:00Z",
    completedAt: "2024-01-11T16:32:00Z",
    fee: "1.00",
  },
];

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi" },
];

const statusConfig = {
  COMPLETED: {
    color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    label: "Completed",
    icon: CheckCircle,
  },
  PENDING: {
    color: "text-amber-400 border-amber-400/30 bg-amber-400/10",
    label: "Pending",
    icon: Clock,
  },
  PAID: {
    color: "text-blue-400 border-blue-400/30 bg-blue-400/10",
    label: "Paid",
    icon: CreditCard,
  },
  DISPUTED: {
    color: "text-red-400 border-red-400/30 bg-red-400/10",
    label: "Disputed",
    icon: AlertTriangle,
  },
  CANCELLED: {
    color: "text-gray-400 border-gray-400/30 bg-gray-400/10",
    label: "Cancelled",
    icon: Clock,
  },
  FAILED: {
    color: "text-red-400 border-red-400/30 bg-red-400/10",
    label: "Failed",
    icon: AlertTriangle,
  },
};

export default function TransactionHistory() {
  const { isAuthenticated, isLoading } = useAuth();
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "",
    status: "",
    asset: "",
    timeRange: "",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Combine all transactions
  const allTransactions: Transaction[] = useMemo(() => {
    return [...mockTrades, ...mockSwaps].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, []);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((transaction) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        let searchableText = [transaction.id, transaction.type];

        if (transaction.type === "SWAP") {
          const swap = transaction as Swap;
          searchableText.push(swap.fromAsset, swap.toAsset);
        } else {
          const trade = transaction as Trade;
          searchableText.push(trade.asset, trade.counterparty);
        }

        if (!searchableText.join(" ").toLowerCase().includes(searchTerm))
          return false;
      }

      // Type filter
      if (filters.type) {
        if (filters.type === "TRADE" && transaction.type === "SWAP")
          return false;
        if (filters.type === "SWAP" && transaction.type !== "SWAP")
          return false;
        if (filters.type === "BUY" && transaction.type !== "BUY") return false;
        if (filters.type === "SELL" && transaction.type !== "SELL")
          return false;
      }

      // Status filter
      if (filters.status && transaction.status !== filters.status) return false;

      // Asset filter
      if (filters.asset) {
        if (transaction.type === "SWAP") {
          const swap = transaction as Swap;
          if (
            swap.fromAsset !== filters.asset &&
            swap.toAsset !== filters.asset
          )
            return false;
        } else {
          const trade = transaction as Trade;
          if (trade.asset !== filters.asset) return false;
        }
      }

      // Time range filter
      if (filters.timeRange) {
        const now = new Date();
        const transactionDate = new Date(transaction.createdAt);
        const diffDays = Math.floor(
          (now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (filters.timeRange) {
          case "7d":
            if (diffDays > 7) return false;
            break;
          case "30d":
            if (diffDays > 30) return false;
            break;
          case "90d":
            if (diffDays > 90) return false;
            break;
        }
      }

      return true;
    });
  }, [allTransactions, filters]);

  // Calculate stats
  const stats = useMemo(() => {
    const completedTrades = allTransactions.filter(
      (t) => t.status === "COMPLETED"
    ).length;
    const totalVolume = allTransactions
      .filter((t) => t.status === "COMPLETED")
      .reduce((sum, t) => {
        if (t.type === "SWAP") return sum;
        const trade = t as Trade;
        return sum + parseFloat(trade.tradeValue);
      }, 0);
    const totalFees = allTransactions
      .filter((t) => t.status === "COMPLETED")
      .reduce((sum, t) => sum + parseFloat(t.fee), 0);
    const averageValue =
      completedTrades > 0 ? totalVolume / completedTrades : 0;

    return [
      {
        label: "Total Trades",
        value: allTransactions.length.toString(),
        icon: Activity,
        color: "text-blue-400",
      },
      {
        label: "Completed",
        value: completedTrades.toString(),
        icon: CheckCircle,
        color: "text-emerald-400",
      },
      {
        label: "Total Volume",
        value: `$${totalVolume.toFixed(2)}`,
        icon: DollarSign,
        color: "text-lime-400",
      },
      {
        label: "Total Fees",
        value: `$${totalFees.toFixed(2)}`,
        icon: CreditCard,
        color: "text-purple-400",
      },
    ];
  }, [allTransactions]);

  // Utility functions
  const getCurrencyInfo = useCallback((currencyCode: string) => {
    return (
      currencies.find((c) => c.code === currencyCode) || {
        symbol: "",
        name: currencyCode,
      }
    );
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      type: "",
      status: "",
      asset: "",
      timeRange: "",
    });
  }, []);

  const getTransactionIcon = useCallback((transaction: Transaction) => {
    if (transaction.type === "SWAP") {
      return <ArrowLeftRight className="h-5 w-5" />;
    }
    if (transaction.type === "BUY") {
      return <TrendingUp className="h-5 w-5" />;
    }
    return <TrendingDown className="h-5 w-5" />;
  }, []);

  const getTransactionColor = useCallback((transaction: Transaction) => {
    if (transaction.type === "SWAP") return "bg-blue-500/20 text-blue-400";
    if (transaction.type === "BUY") return "bg-emerald-500/20 text-emerald-400";
    return "bg-red-500/20 text-red-400";
  }, []);

  if (isLoading || !isAuthenticated) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-lime-400 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <History className="text-black h-6 w-6" />
            </div>
            <p className="text-gray-400 text-lg">
              Loading transaction history...
            </p>
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
                Transaction History
              </h1>
              <p className="text-gray-400">
                Your complete trading and swap history •{" "}
                {filteredTransactions.length} of {allTransactions.length}{" "}
                transactions
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
              <OutlineButton
                icon={<Download className="h-4 w-4" />}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                Export
              </OutlineButton>
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
              title="Filter Transactions"
              description="Find specific transactions in your history"
              icon={<Filter className="h-6 w-6 text-black" />}
            />
            <ThemedCardContent className="p-4 sm:p-6 pt-0">
              {/* Search */}
              <div className="mb-4">
                <Label
                  htmlFor="search"
                  className="text-sm font-medium text-gray-300 mb-2 block"
                >
                  Search transactions
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by ID, counterparty, or asset..."
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
                className="mb-4 sm:grid-cols-2 lg:grid-cols-5"
              >
                <div>
                  <Label className="text-sm font-medium text-gray-300 mb-2 block">
                    Type
                  </Label>
                  <Flex gap="sm" className="flex-wrap">
                    {["TRADE", "BUY", "SELL", "SWAP"].map((type) => (
                      <OutlineButton
                        key={type}
                        onClick={() => handleFilterChange("type", type)}
                        className={
                          filters.type === type
                            ? "bg-lime-400/10 border-lime-400 text-lime-400"
                            : ""
                        }
                        size="sm"
                      >
                        {type === "TRADE" && (
                          <Activity className="h-3 w-3 mr-1" />
                        )}
                        {type === "BUY" && (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        )}
                        {type === "SELL" && (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {type === "SWAP" && (
                          <ArrowLeftRight className="h-3 w-3 mr-1" />
                        )}
                        {type}
                      </OutlineButton>
                    ))}
                  </Flex>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-300 mb-2 block">
                    Status
                  </Label>
                  <Flex gap="sm" className="flex-wrap">
                    {Object.entries(statusConfig)
                      .slice(0, 3)
                      .map(([status, config]) => (
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
                    Time Range
                  </Label>
                  <Flex gap="sm" className="flex-wrap">
                    {[
                      { value: "7d", label: "7 Days" },
                      { value: "30d", label: "30 Days" },
                      { value: "90d", label: "90 Days" },
                    ].map((range) => (
                      <OutlineButton
                        key={range.value}
                        onClick={() =>
                          handleFilterChange("timeRange", range.value)
                        }
                        className={
                          filters.timeRange === range.value
                            ? "bg-lime-400/10 border-lime-400 text-lime-400"
                            : ""
                        }
                        size="sm"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        {range.label}
                      </OutlineButton>
                    ))}
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

          {/* Transaction List */}
          {filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <ThemedCard key={transaction.id} hover>
                  <ThemedCardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {/* Mobile Layout */}
                      <div className="sm:hidden">
                        <Flex justify="between" align="start" className="mb-3">
                          <Flex gap="sm">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getTransactionColor(
                                transaction
                              )}`}
                            >
                              {getTransactionIcon(transaction)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Flex
                                align="center"
                                gap="sm"
                                className="mb-1 flex-wrap"
                              >
                                <span className="font-semibold text-white text-base">
                                  {transaction.type === "SWAP"
                                    ? `${(transaction as Swap).fromAsset} → ${
                                        (transaction as Swap).toAsset
                                      }`
                                    : `${transaction.type} ${
                                        (transaction as Trade).asset
                                      }`}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={
                                    statusConfig[transaction.status].color
                                  }
                                >
                                  {statusConfig[transaction.status].label}
                                </Badge>
                              </Flex>
                              <p className="text-sm text-gray-400 truncate">
                                ID: {transaction.id}
                              </p>
                            </div>
                          </Flex>
                          <OutlineButton size="sm" className="flex-shrink-0">
                            <ExternalLink className="h-4 w-4" />
                          </OutlineButton>
                        </Flex>

                        {/* Details - Mobile */}
                        <div className="space-y-3">
                          {transaction.type === "SWAP" ? (
                            <div className="p-3 bg-white/[0.02] rounded-lg">
                              <p className="text-sm text-gray-400 mb-1">
                                Swap Details
                              </p>
                              <p className="text-white font-medium">
                                {(transaction as Swap).fromAmount}{" "}
                                {(transaction as Swap).fromAsset} →{" "}
                                {(transaction as Swap).toAmount}{" "}
                                {(transaction as Swap).toAsset}
                              </p>
                              <p className="text-xs text-gray-400">
                                Rate: $
                                {parseFloat(
                                  (transaction as Swap).rate
                                ).toLocaleString()}
                              </p>
                            </div>
                          ) : (
                            <div className="p-3 bg-white/[0.02] rounded-lg">
                              <p className="text-sm text-gray-400 mb-1">
                                Trade Details
                              </p>
                              <p className="text-white font-medium">
                                {(transaction as Trade).amount}{" "}
                                {(transaction as Trade).asset}
                              </p>
                              <p className="text-xs text-gray-400">
                                Value:{" "}
                                {
                                  getCurrencyInfo(
                                    (transaction as Trade).currency
                                  ).symbol
                                }
                                {parseFloat(
                                  (transaction as Trade).tradeValue
                                ).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-400">
                                With: {(transaction as Trade).counterparty}
                              </p>
                            </div>
                          )}

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {formatTimeAgo(transaction.createdAt)}
                            </span>
                            <span className="text-gray-400">
                              Fee: ${parseFloat(transaction.fee).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:block">
                        <Flex justify="between" align="start">
                          <Flex gap="md" className="flex-1">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getTransactionColor(
                                transaction
                              )}`}
                            >
                              {getTransactionIcon(transaction)}
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
                                      {transaction.type === "SWAP"
                                        ? `${
                                            (transaction as Swap).fromAsset
                                          } → ${(transaction as Swap).toAsset}`
                                        : `${transaction.type} ${
                                            (transaction as Trade).asset
                                          }`}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={
                                        statusConfig[transaction.status].color
                                      }
                                    >
                                      {statusConfig[transaction.status].label}
                                    </Badge>
                                  </Flex>
                                  <Flex
                                    align="center"
                                    gap="sm"
                                    className="text-sm text-gray-400 flex-wrap"
                                  >
                                    <span>ID: {transaction.id}</span>
                                    <span>•</span>
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {formatDate(transaction.createdAt)}
                                    </span>
                                    {transaction.type !== "SWAP" && (
                                      <>
                                        <span>•</span>
                                        <Users className="h-4 w-4" />
                                        <span>
                                          {(transaction as Trade).counterparty}
                                        </span>
                                      </>
                                    )}
                                  </Flex>
                                </div>

                                <div className="text-right flex-shrink-0 ml-4">
                                  {transaction.type === "SWAP" ? (
                                    <div>
                                      <div className="text-lg font-bold text-white">
                                        {(transaction as Swap).fromAmount}{" "}
                                        {(transaction as Swap).fromAsset}
                                      </div>
                                      <div className="text-sm text-gray-400">
                                        → {(transaction as Swap).toAmount}{" "}
                                        {(transaction as Swap).toAsset}
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="text-lg font-bold text-white">
                                        {(transaction as Trade).amount}{" "}
                                        {(transaction as Trade).asset}
                                      </div>
                                      <div className="text-sm text-gray-400">
                                        {
                                          getCurrencyInfo(
                                            (transaction as Trade).currency
                                          ).symbol
                                        }
                                        {parseFloat(
                                          (transaction as Trade).tradeValue
                                        ).toLocaleString()}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </Flex>

                              <Flex
                                justify="between"
                                align="center"
                                className="flex-wrap gap-2"
                              >
                                <div className="text-sm text-gray-400">
                                  {transaction.type === "SWAP" ? (
                                    <span>
                                      Rate: $
                                      {parseFloat(
                                        (transaction as Swap).rate
                                      ).toLocaleString()}
                                    </span>
                                  ) : (
                                    <span>
                                      Rate:{" "}
                                      {
                                        getCurrencyInfo(
                                          (transaction as Trade).currency
                                        ).symbol
                                      }
                                      {parseFloat(
                                        (transaction as Trade).rate
                                      ).toLocaleString()}
                                    </span>
                                  )}
                                  <span className="ml-4">
                                    Fee: $
                                    {parseFloat(transaction.fee).toFixed(2)}
                                  </span>
                                </div>
                                <OutlineButton size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </OutlineButton>
                              </Flex>
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
                  {allTransactions.length === 0 ? (
                    <History className="h-8 w-8 text-gray-500" />
                  ) : (
                    <Search className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {allTransactions.length === 0
                    ? "No transactions yet"
                    : "No matching transactions"}
                </h3>
                <p className="text-gray-400 mb-6">
                  {allTransactions.length === 0
                    ? "Your trading and swap history will appear here"
                    : "Try adjusting your filters to find what you're looking for"}
                </p>
                {allTransactions.length > 0 && (
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
    </PageLayout>
  );
}
