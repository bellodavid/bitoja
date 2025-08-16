import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ThemedCard, ThemedCardContent } from "@/components/theme/themed-card";
import {
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
} from "@/components/theme/themed-button";
import { Flex } from "@/components/theme/layout";
import {
  Plus,
  Bitcoin,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Info,
  Calculator,
  CreditCard,
  Smartphone,
  Building,
  Banknote,
} from "lucide-react";

// Enhanced schema with better validation
const createAdSchema = z
  .object({
    asset: z.enum(["BTC", "USDT"], {
      required_error: "Please select an asset",
    }),
    tradeType: z.enum(["BUY", "SELL"], {
      required_error: "Please select trade type",
    }),
    currency: z.enum(["USD", "EUR", "NGN", "GHS"], {
      required_error: "Please select a currency",
    }),
    paymentMethod: z.enum(
      [
        "BANK_TRANSFER",
        "MOBILE_MONEY",
        "WIRE_TRANSFER",
        "PAYPAL",
        "CASH_DEPOSIT",
      ],
      {
        required_error: "Please select a payment method",
      }
    ),
    rate: z
      .string()
      .min(1, "Rate is required")
      .refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        "Rate must be a positive number"
      ),
    minLimit: z
      .string()
      .min(1, "Minimum limit is required")
      .refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        "Minimum limit must be a positive number"
      ),
    maxLimit: z
      .string()
      .min(1, "Maximum limit is required")
      .refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        "Maximum limit must be a positive number"
      ),
    terms: z.string().optional(),
  })
  .refine(
    (data) => {
      const minLimit = parseFloat(data.minLimit);
      const maxLimit = parseFloat(data.maxLimit);
      return maxLimit > minLimit;
    },
    {
      message: "Maximum limit must be greater than minimum limit",
      path: ["maxLimit"],
    }
  );

type CreateAdForm = z.infer<typeof createAdSchema>;

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CreateAdForm) => void;
}

// Configuration data
const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "GHS", symbol: "₵", name: "Ghanaian Cedi" },
];

const paymentMethods = [
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: Building },
  { value: "MOBILE_MONEY", label: "Mobile Money", icon: Smartphone },
  { value: "WIRE_TRANSFER", label: "Wire Transfer", icon: CreditCard },
  { value: "PAYPAL", label: "PayPal", icon: DollarSign },
  { value: "CASH_DEPOSIT", label: "Cash Deposit", icon: Banknote },
];

export default function CreateAdModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateAdModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateAdForm>({
    resolver: zodResolver(createAdSchema),
    defaultValues: {
      asset: "BTC",
      tradeType: "BUY",
      currency: "USD",
      paymentMethod: "BANK_TRANSFER",
      rate: "",
      minLimit: "",
      maxLimit: "",
      terms: "",
    },
  });

  // Watch form values for real-time calculations
  const watchedValues = form.watch();
  const { asset, tradeType, currency, rate, minLimit, maxLimit } =
    watchedValues;

  // Get currency info
  const currencyInfo = useMemo(() => {
    return currencies.find((c) => c.code === currency) || currencies[0];
  }, [currency]);

  // Calculate estimated values
  const estimatedValues = useMemo(() => {
    if (!rate || !minLimit || !maxLimit) return null;

    const rateNum = parseFloat(rate);
    const minNum = parseFloat(minLimit);
    const maxNum = parseFloat(maxLimit);

    if (isNaN(rateNum) || isNaN(minNum) || isNaN(maxNum)) return null;

    const minAsset = (minNum / rateNum).toFixed(asset === "BTC" ? 8 : 2);
    const maxAsset = (maxNum / rateNum).toFixed(asset === "BTC" ? 8 : 2);

    return { minAsset, maxAsset };
  }, [rate, minLimit, maxLimit, asset]);

  // Handlers
  const handleSubmit = useCallback(
    async (data: CreateAdForm) => {
      setIsSubmitting(true);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (onSubmit) {
          onSubmit(data);
        } else {
          toast({
            title: "Advertisement Created",
            description: "Your advertisement is now live and ready for trading",
          });
          form.reset();
          onClose();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create advertisement. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, toast, form, onClose]
  );

  const handleClose = useCallback(() => {
    form.reset();
    onClose();
  }, [form, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0b0f13] border border-white/10 text-gray-200 max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="h-5 w-5 text-lime-400" />
            Create Advertisement
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 py-4"
        >
          {/* Asset & Trade Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-300 mb-3 block">
                Asset
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {["BTC", "USDT"].map((assetOption) => (
                  <OutlineButton
                    key={assetOption}
                    type="button"
                    onClick={() =>
                      form.setValue("asset", assetOption as "BTC" | "USDT")
                    }
                    className={`p-4 h-auto flex-col ${
                      asset === assetOption
                        ? "bg-lime-400/10 border-lime-400 text-lime-400"
                        : ""
                    }`}
                  >
                    {assetOption === "BTC" ? (
                      <Bitcoin className="h-6 w-6 mb-2" />
                    ) : (
                      <span className="text-2xl mb-2">₮</span>
                    )}
                    <span className="font-medium">{assetOption}</span>
                    <span className="text-xs opacity-75">
                      {assetOption === "BTC" ? "Bitcoin" : "Tether"}
                    </span>
                  </OutlineButton>
                ))}
              </div>
              {form.formState.errors.asset && (
                <p className="text-red-400 text-sm mt-1">
                  {form.formState.errors.asset.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300 mb-3 block">
                Trade Type
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    value: "BUY",
                    label: "Buy",
                    icon: TrendingUp,
                    color: "emerald",
                  },
                  {
                    value: "SELL",
                    label: "Sell",
                    icon: TrendingDown,
                    color: "red",
                  },
                ].map((option) => (
                  <OutlineButton
                    key={option.value}
                    type="button"
                    onClick={() =>
                      form.setValue("tradeType", option.value as "BUY" | "SELL")
                    }
                    className={`p-4 h-auto flex-col ${
                      tradeType === option.value
                        ? option.color === "emerald"
                          ? "bg-emerald-400/10 border-emerald-400 text-emerald-400"
                          : "bg-red-400/10 border-red-400 text-red-400"
                        : ""
                    }`}
                  >
                    <option.icon className="h-6 w-6 mb-2" />
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs opacity-75">
                      {option.value === "BUY" ? "Purchase" : "Sell"}
                    </span>
                  </OutlineButton>
                ))}
              </div>
              {form.formState.errors.tradeType && (
                <p className="text-red-400 text-sm mt-1">
                  {form.formState.errors.tradeType.message}
                </p>
              )}
            </div>
          </div>

          {/* Currency & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="currency"
                className="text-sm font-medium text-gray-300 mb-2 block"
              >
                Currency
              </Label>
              <Select
                value={currency}
                onValueChange={(value) =>
                  form.setValue("currency", value as any)
                }
              >
                <SelectTrigger className="bg-white/[0.02] border-white/10 text-gray-100 focus:border-lime-400">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-[#0b0f13] border border-white/10">
                  {currencies.map((curr) => (
                    <SelectItem
                      key={curr.code}
                      value={curr.code}
                      className="text-gray-200 hover:bg-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <span>{curr.symbol}</span>
                        <span>{curr.code}</span>
                        <span className="text-gray-400">- {curr.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.currency && (
                <p className="text-red-400 text-sm mt-1">
                  {form.formState.errors.currency.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="paymentMethod"
                className="text-sm font-medium text-gray-300 mb-2 block"
              >
                Payment Method
              </Label>
              <Select
                value={watchedValues.paymentMethod}
                onValueChange={(value) =>
                  form.setValue("paymentMethod", value as any)
                }
              >
                <SelectTrigger className="bg-white/[0.02] border-white/10 text-gray-100 focus:border-lime-400">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="bg-[#0b0f13] border border-white/10">
                  {paymentMethods.map((method) => (
                    <SelectItem
                      key={method.value}
                      value={method.value}
                      className="text-gray-200 hover:bg-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <method.icon className="h-4 w-4" />
                        <span>{method.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.paymentMethod && (
                <p className="text-red-400 text-sm mt-1">
                  {form.formState.errors.paymentMethod.message}
                </p>
              )}
            </div>
          </div>

          {/* Rate */}
          <div>
            <Label
              htmlFor="rate"
              className="text-sm font-medium text-gray-300 mb-2 block"
            >
              Exchange Rate ({currencyInfo.symbol} per {asset})
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {currencyInfo.symbol}
              </span>
              <Input
                id="rate"
                type="number"
                step="any"
                placeholder="0.00"
                {...form.register("rate")}
                className="pl-8 bg-white/[0.02] border-white/10 text-gray-100 placeholder:text-gray-500 focus:border-lime-400"
              />
            </div>
            {form.formState.errors.rate && (
              <p className="text-red-400 text-sm mt-1">
                {form.formState.errors.rate.message}
              </p>
            )}
          </div>

          {/* Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="minLimit"
                className="text-sm font-medium text-gray-300 mb-2 block"
              >
                Minimum Limit ({currencyInfo.code})
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {currencyInfo.symbol}
                </span>
                <Input
                  id="minLimit"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  {...form.register("minLimit")}
                  className="pl-8 bg-white/[0.02] border-white/10 text-gray-100 placeholder:text-gray-500 focus:border-lime-400"
                />
              </div>
              {form.formState.errors.minLimit && (
                <p className="text-red-400 text-sm mt-1">
                  {form.formState.errors.minLimit.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="maxLimit"
                className="text-sm font-medium text-gray-300 mb-2 block"
              >
                Maximum Limit ({currencyInfo.code})
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {currencyInfo.symbol}
                </span>
                <Input
                  id="maxLimit"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  {...form.register("maxLimit")}
                  className="pl-8 bg-white/[0.02] border-white/10 text-gray-100 placeholder:text-gray-500 focus:border-lime-400"
                />
              </div>
              {form.formState.errors.maxLimit && (
                <p className="text-red-400 text-sm mt-1">
                  {form.formState.errors.maxLimit.message}
                </p>
              )}
            </div>
          </div>

          {/* Calculation Preview */}
          {estimatedValues && (
            <ThemedCard variant="accent">
              <ThemedCardContent className="p-4">
                <Flex align="center" gap="sm" className="mb-3">
                  <Calculator className="h-5 w-5 text-lime-400" />
                  <span className="font-medium text-white">
                    Trade Range Preview
                  </span>
                </Flex>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Minimum Trade</p>
                    <p className="text-white font-medium">
                      {estimatedValues.minAsset} {asset} ≈ {currencyInfo.symbol}
                      {parseFloat(minLimit).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Maximum Trade</p>
                    <p className="text-white font-medium">
                      {estimatedValues.maxAsset} {asset} ≈ {currencyInfo.symbol}
                      {parseFloat(maxLimit).toLocaleString()}
                    </p>
                  </div>
                </div>
              </ThemedCardContent>
            </ThemedCard>
          )}

          {/* Terms (Optional) */}
          <div>
            <Label
              htmlFor="terms"
              className="text-sm font-medium text-gray-300 mb-2 block"
            >
              Trading Terms <span className="text-gray-500">(Optional)</span>
            </Label>
            <Textarea
              id="terms"
              placeholder="Enter any specific terms or conditions for this trade..."
              {...form.register("terms")}
              className="bg-white/[0.02] border-white/10 text-gray-100 placeholder:text-gray-500 focus:border-lime-400 min-h-[80px]"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can specify payment timeframes, verification requirements, or
              other conditions.
            </p>
          </div>

          {/* Summary */}
          <ThemedCard variant="feature">
            <ThemedCardContent className="p-4">
              <Flex align="center" gap="sm" className="mb-3">
                <Info className="h-5 w-5 text-blue-400" />
                <span className="font-medium text-white">
                  Advertisement Summary
                </span>
              </Flex>
              <div className="space-y-2 text-sm">
                <Flex justify="between">
                  <span className="text-gray-400">Type:</span>
                  <Badge
                    variant="outline"
                    className={
                      tradeType === "BUY"
                        ? "text-emerald-400 border-emerald-400/30"
                        : "text-red-400 border-red-400/30"
                    }
                  >
                    {tradeType} {asset}
                  </Badge>
                </Flex>
                <Flex justify="between">
                  <span className="text-gray-400">Currency:</span>
                  <span className="text-white">
                    {currencyInfo.symbol} {currency}
                  </span>
                </Flex>
                <Flex justify="between">
                  <span className="text-gray-400">Payment:</span>
                  <span className="text-white">
                    {
                      paymentMethods.find(
                        (p) => p.value === watchedValues.paymentMethod
                      )?.label
                    }
                  </span>
                </Flex>
                {rate && (
                  <Flex justify="between">
                    <span className="text-gray-400">Rate:</span>
                    <span className="text-white font-medium">
                      {currencyInfo.symbol}
                      {parseFloat(rate).toLocaleString()} per {asset}
                    </span>
                  </Flex>
                )}
              </div>
            </ThemedCardContent>
          </ThemedCard>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <SecondaryButton
              type="button"
              onClick={handleClose}
              className="flex-1 order-2 sm:order-1"
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={isSubmitting}
              className="flex-1 order-1 sm:order-2"
            >
              {isSubmitting ? "Creating..." : "Create Advertisement"}
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
