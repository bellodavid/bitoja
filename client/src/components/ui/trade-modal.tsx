import { useState, useCallback, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ThemedCard, ThemedCardContent } from "@/components/theme/themed-card";
import {
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
} from "@/components/theme/themed-button";
import { Flex } from "@/components/theme/layout";
import {
  X,
  CheckCircle,
  Clock,
  Upload,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Shield,
  MessageSquare,
  Calculator,
  CreditCard,
  Timer,
  Star,
} from "lucide-react";

// Types and Schemas
const tradeSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Amount must be a valid positive number"
    ),
  paymentDetails: z.string().optional(),
});

type TradeForm = z.infer<typeof tradeSchema>;

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ad: any; // Using any for compatibility with existing code
}

type TradeStatus =
  | "INITIAL"
  | "PENDING"
  | "PAYMENT_SENT"
  | "PAYMENT_CONFIRMED"
  | "COMPLETED"
  | "DISPUTED";

interface TradeDetails {
  id: string;
  amount: string;
  assetAmount: string;
  status: TradeStatus;
  paymentProof?: File;
  createdAt: Date;
  estimatedCompletion: Date;
}

const TRADE_STEPS = [
  { status: "INITIAL", label: "Start Trade", icon: Calculator },
  { status: "PENDING", label: "Payment Pending", icon: Clock },
  { status: "PAYMENT_SENT", label: "Payment Sent", icon: CreditCard },
  {
    status: "PAYMENT_CONFIRMED",
    label: "Payment Confirmed",
    icon: CheckCircle,
  },
  { status: "COMPLETED", label: "Trade Complete", icon: Star },
] as const;

export default function TradeModal({ isOpen, onClose, ad }: TradeModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentTrade, setCurrentTrade] = useState<TradeDetails | null>(null);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TradeForm>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      amount: "",
      paymentDetails: "",
    },
  });

  // Computed values
  const watchedAmount = form.watch("amount");
  const calculatedAssetAmount = useMemo(() => {
    if (!ad || !watchedAmount) return "0";
    const amount = parseFloat(watchedAmount);
    const rate = parseFloat(ad.rate);
    if (isNaN(amount) || isNaN(rate) || rate === 0) return "0";
    return (amount / rate).toFixed(ad.asset === "BTC" ? 8 : 2);
  }, [watchedAmount, ad]);

  const isAmountValid = useMemo(() => {
    if (!ad || !watchedAmount) return false;
    const amount = parseFloat(watchedAmount);
    const minLimit = parseFloat(ad.minLimit);
    const maxLimit = parseFloat(ad.maxLimit);
    return !isNaN(amount) && amount >= minLimit && amount <= maxLimit;
  }, [watchedAmount, ad]);

  // Utility functions
  const getCurrencySymbol = useCallback((currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      NGN: "₦",
      GHS: "₵",
    };
    return symbols[currency] || "";
  }, []);

  const formatPaymentMethod = useCallback((method: string) => {
    return method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }, []);

  const getStatusColor = useCallback((status: TradeStatus) => {
    switch (status) {
      case "COMPLETED":
        return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
      case "DISPUTED":
        return "text-red-400 border-red-400/30 bg-red-400/10";
      case "PENDING":
      case "PAYMENT_SENT":
        return "text-amber-400 border-amber-400/30 bg-amber-400/10";
      case "PAYMENT_CONFIRMED":
        return "text-blue-400 border-blue-400/30 bg-blue-400/10";
      default:
        return "text-gray-400 border-white/20 bg-white/5";
    }
  }, []);

  // Handlers
  const handleInitiateTrade = useCallback(
    async (data: TradeForm) => {
      if (!ad || !isAmountValid) {
        toast({
          title: "Invalid Amount",
          description:
            "Please enter a valid amount within the specified limits",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const newTrade: TradeDetails = {
          id: `trade_${Date.now()}`,
          amount: data.amount,
          assetAmount: calculatedAssetAmount,
          status: "PENDING",
          createdAt: new Date(),
          estimatedCompletion: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        };

        setCurrentTrade(newTrade);

        toast({
          title: "Trade Initiated",
          description:
            "Your trade has been started. Please complete payment within 30 minutes.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to initiate trade. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [ad, isAmountValid, calculatedAssetAmount, toast]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPEG, PNG, or PDF file",
          variant: "destructive",
        });
        return;
      }

      setPaymentProofFile(file);

      toast({
        title: "File Uploaded",
        description: "Payment proof has been attached successfully",
      });
    },
    [toast]
  );

  const handleConfirmPayment = useCallback(async () => {
    if (!currentTrade || !paymentProofFile) {
      toast({
        title: "Missing Information",
        description: "Please upload payment proof before confirming",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setCurrentTrade((prev) =>
        prev
          ? {
              ...prev,
              status: "PAYMENT_SENT",
              paymentProof: paymentProofFile,
            }
          : null
      );

      toast({
        title: "Payment Confirmed",
        description:
          "Your payment proof has been submitted. Waiting for seller confirmation.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [currentTrade, paymentProofFile, toast]);

  const handleClose = useCallback(() => {
    form.reset();
    setCurrentTrade(null);
    setPaymentProofFile(null);
    onClose();
  }, [form, onClose]);

  const renderTradeInitiation = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Ad Summary */}
      <ThemedCard variant="accent">
        <ThemedCardContent className="p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-0">
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
                  <h3 className="font-semibold text-white text-base">
                    {ad.tradeType} {ad.asset}
                  </h3>
                  <Flex
                    align="center"
                    gap="sm"
                    className="text-sm text-gray-400 flex-wrap"
                  >
                    <Users className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">
                      {ad.user.firstName} {ad.user.lastName}
                    </span>
                    <span>•</span>
                    <Star className="h-3 w-3 fill-current text-amber-400 flex-shrink-0" />
                    <span>{ad.user.rating}</span>
                  </Flex>
                </div>
              </Flex>
              <div className="text-center p-3 bg-white/[0.02] rounded-lg">
                <div className="text-lg font-bold text-white">
                  {getCurrencySymbol(ad.currency)}
                  {parseFloat(ad.rate).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">per {ad.asset}</div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:block">
              <Flex justify="between" align="start">
                <Flex gap="md">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
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
                  <div>
                    <h3 className="font-semibold text-white text-lg">
                      {ad.tradeType} {ad.asset}
                    </h3>
                    <Flex
                      align="center"
                      gap="sm"
                      className="text-sm text-gray-400"
                    >
                      <Users className="h-4 w-4" />
                      <span>
                        {ad.user.firstName} {ad.user.lastName}
                      </span>
                      <span>•</span>
                      <Star className="h-4 w-4 fill-current text-amber-400" />
                      <span>{ad.user.rating}</span>
                    </Flex>
                  </div>
                </Flex>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">
                    {getCurrencySymbol(ad.currency)}
                    {parseFloat(ad.rate).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">per {ad.asset}</div>
                </div>
              </Flex>
            </div>
          </div>
        </ThemedCardContent>
      </ThemedCard>

      {/* Trade Form */}
      <form
        onSubmit={form.handleSubmit(handleInitiateTrade)}
        className="space-y-4"
      >
        <div>
          <Label
            htmlFor="amount"
            className="text-sm font-medium text-gray-300 mb-2 block"
          >
            Amount ({ad.currency})
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder={`${getCurrencySymbol(ad.currency)}${
              ad.minLimit
            } - ${getCurrencySymbol(ad.currency)}${ad.maxLimit}`}
            {...form.register("amount")}
            className="bg-white/[0.02] border-white/10 text-gray-100 placeholder:text-gray-500 focus:border-lime-400"
          />
          {form.formState.errors.amount && (
            <p className="text-red-400 text-sm mt-1">
              {form.formState.errors.amount.message}
            </p>
          )}
          <div className="mt-2 text-xs sm:text-sm text-gray-400">
            Limits: {getCurrencySymbol(ad.currency)}
            {parseFloat(ad.minLimit).toLocaleString()} -{" "}
            {getCurrencySymbol(ad.currency)}
            {parseFloat(ad.maxLimit).toLocaleString()}
          </div>
        </div>

        {/* Calculation Display */}
        {watchedAmount && (
          <ThemedCard variant="accent">
            <ThemedCardContent className="p-3 sm:p-4">
              <div className="space-y-2 sm:space-y-0">
                {/* Mobile Layout */}
                <div className="sm:hidden space-y-2">
                  <div className="text-center">
                    <p className="text-sm text-gray-400">You will receive</p>
                    <p className="text-lg font-bold text-white">
                      {calculatedAssetAmount} {ad.asset}
                    </p>
                  </div>
                  <div className="text-center border-t border-white/10 pt-2">
                    <p className="text-sm text-gray-400">You will pay</p>
                    <p className="text-lg font-bold text-white">
                      {getCurrencySymbol(ad.currency)}
                      {parseFloat(watchedAmount || "0").toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:block">
                  <Flex justify="between" align="center">
                    <div>
                      <p className="text-sm text-gray-400">You will receive</p>
                      <p className="text-xl font-bold text-white">
                        {calculatedAssetAmount} {ad.asset}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">You will pay</p>
                      <p className="text-xl font-bold text-white">
                        {getCurrencySymbol(ad.currency)}
                        {parseFloat(watchedAmount || "0").toLocaleString()}
                      </p>
                    </div>
                  </Flex>
                </div>
              </div>
            </ThemedCardContent>
          </ThemedCard>
        )}

        {/* Payment Method */}
        <div>
          <Label className="text-sm font-medium text-gray-300 mb-2 block">
            Payment Method
          </Label>
          <Badge variant="outline" className="text-gray-300 border-white/20">
            {formatPaymentMethod(ad.paymentMethod)}
          </Badge>
        </div>

        {/* Terms */}
        {ad.terms && (
          <div>
            <Label className="text-sm font-medium text-gray-300 mb-2 block">
              Trade Terms
            </Label>
            <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
              <p className="text-sm text-gray-400 break-words">{ad.terms}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <SecondaryButton
            onClick={handleClose}
            className="flex-1 order-2 sm:order-1"
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            disabled={!isAmountValid || isSubmitting}
            className="flex-1 order-1 sm:order-2"
          >
            {isSubmitting ? "Starting Trade..." : "Start Trade"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );

  const renderTradeProgress = () => {
    if (!currentTrade) return null;

    return (
      <div className="space-y-6">
        {/* Trade Status */}
        <ThemedCard variant="accent">
          <ThemedCardContent className="p-4">
            <Flex justify="between" align="center">
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Trade #{currentTrade.id.slice(-6)}
                </h3>
                <Badge
                  variant="outline"
                  className={getStatusColor(currentTrade.status)}
                >
                  {
                    TRADE_STEPS.find(
                      (step) => step.status === currentTrade.status
                    )?.label
                  }
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Amount</p>
                <p className="font-semibold text-white">
                  {getCurrencySymbol(ad.currency)}
                  {parseFloat(currentTrade.amount).toLocaleString()}
                </p>
              </div>
            </Flex>
          </ThemedCardContent>
        </ThemedCard>

        {/* Progress Steps */}
        <div className="space-y-3">
          {TRADE_STEPS.map((step, index) => {
            const isCompleted =
              TRADE_STEPS.findIndex((s) => s.status === currentTrade.status) >=
              index;
            const isCurrent = step.status === currentTrade.status;

            return (
              <Flex key={step.status} gap="md" align="center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? "bg-lime-400 text-black"
                      : isCurrent
                      ? "bg-lime-400/20 text-lime-400 border border-lime-400"
                      : "bg-white/10 text-gray-500"
                  }`}
                >
                  <step.icon className="h-4 w-4" />
                </div>
                <span
                  className={`font-medium ${
                    isCompleted
                      ? "text-white"
                      : isCurrent
                      ? "text-lime-400"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </Flex>
            );
          })}
        </div>

        {/* Payment Instructions */}
        {currentTrade.status === "PENDING" && (
          <ThemedCard variant="accent">
            <ThemedCardContent className="p-4">
              <h4 className="font-semibold text-white mb-3">
                Payment Instructions
              </h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>
                  • Send {getCurrencySymbol(ad.currency)}
                  {parseFloat(currentTrade.amount).toLocaleString()} via{" "}
                  {formatPaymentMethod(ad.paymentMethod)}
                </p>
                <p>• Upload payment proof below</p>
                <p>• Complete payment within 30 minutes</p>
              </div>
            </ThemedCardContent>
          </ThemedCard>
        )}

        {/* File Upload */}
        {currentTrade.status === "PENDING" && (
          <div>
            <Label className="text-sm font-medium text-gray-300 mb-2">
              Payment Proof
            </Label>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="payment-proof"
              />
              <label htmlFor="payment-proof" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                {paymentProofFile ? (
                  <p className="text-sm text-green-400">
                    {paymentProofFile.name}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">
                    Click to upload payment proof
                  </p>
                )}
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {currentTrade.status === "PENDING" && (
            <>
              <SecondaryButton onClick={handleClose} className="flex-1">
                Cancel Trade
              </SecondaryButton>
              <PrimaryButton
                onClick={handleConfirmPayment}
                disabled={!paymentProofFile || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Confirming..." : "Confirm Payment"}
              </PrimaryButton>
            </>
          )}
          {currentTrade.status === "PAYMENT_SENT" && (
            <div className="w-full text-center">
              <div className="p-4 bg-amber-400/10 border border-amber-400/30 rounded-lg">
                <p className="text-amber-400 font-medium">
                  Waiting for seller confirmation...
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  This usually takes 5-15 minutes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!ad) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0b0f13] border border-white/10 text-gray-200 max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            {currentTrade ? (
              <>
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">Trade in Progress</span>
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">New Trade</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {currentTrade ? renderTradeProgress() : renderTradeInitiation()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
