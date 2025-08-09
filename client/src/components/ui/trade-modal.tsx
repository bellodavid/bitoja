import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { X, CheckCircle, Clock, Upload, AlertTriangle } from "lucide-react";

const tradeSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
});

type TradeForm = z.infer<typeof tradeSchema>;

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ad: any;
}

export default function TradeModal({ isOpen, onClose, ad }: TradeModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tradeStatus, setTradeStatus] = useState<
    "PENDING" | "PAID" | "COMPLETED"
  >("PENDING");
  const [assetAmount, setAssetAmount] = useState("");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);

  const form = useForm<TradeForm>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      amount: "",
    },
  });

  const handleSubmit = (data: TradeForm) => {
    if (!ad) {
      toast({
        title: "Error",
        description: "Advertisement not found",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    // Calculate asset amount based on rate
    const rate = parseFloat(ad.rate);
    const calculatedAssetAmount = (amount / rate).toFixed(8);
    setAssetAmount(calculatedAssetAmount);

    toast({
      title: "Success",
      description: "Trade initiated successfully",
    });

    form.reset();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setPaymentProofFile(file);
    }
  };

  const handleUploadProof = () => {
    if (!paymentProofFile) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }

    setTradeStatus("PAID");
    toast({
      title: "Success",
      description: "Payment proof uploaded successfully",
    });
  };

  const handleReleaseTokens = () => {
    setTradeStatus("COMPLETED");
    toast({
      title: "Success",
      description: "Tokens released successfully",
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

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "COMPLETED":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "PAID":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "PENDING":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getProgressSteps = () => {
    const steps = [
      { key: "PENDING", label: "Trade Initiated", icon: Clock },
      { key: "PAID", label: "Payment Confirmed", icon: CheckCircle },
      { key: "COMPLETED", label: "Tokens Released", icon: CheckCircle },
    ];

    return steps.map((step, index) => {
      const Icon = step.icon;
      const isActive = step.key === tradeStatus;
      const isCompleted =
        steps.findIndex((s) => s.key === tradeStatus) >= index;

      return (
        <div key={step.key} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isCompleted
                ? "bg-bitoja-green text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <span
            className={`ml-2 text-sm ${
              isActive ? "font-medium text-bitoja-green" : "text-gray-500"
            }`}
          >
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-px mx-4 ${
                isCompleted ? "bg-bitoja-green" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      );
    });
  };

  const handleClose = () => {
    setTradeStatus("PENDING");
    setAssetAmount("");
    setPaymentProofFile(null);
    form.reset();
    onClose();
  };

  if (!ad) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Trade Details
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Advertisement Details */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {ad.asset} {ad.tradeType}
                    </span>
                    <Badge variant="outline">{ad.currency}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Rate: {getCurrencySymbol(ad.currency)}
                    {parseFloat(ad.rate).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {getCurrencySymbol(ad.currency)}
                    {parseFloat(ad.minLimit).toLocaleString()} -{" "}
                    {getCurrencySymbol(ad.currency)}
                    {parseFloat(ad.maxLimit).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trade Form */}
          {!assetAmount && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ({ad.currency})</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-bitoja-green hover:bg-bitoja-green-dark text-white"
                >
                  Initiate Trade
                </Button>
              </form>
            </Form>
          )}

          {/* Trade Progress */}
          {assetAmount && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Trade Progress
                </h3>
                <div className="flex items-center space-x-4">
                  {getProgressSteps()}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Trade Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">
                      {getCurrencySymbol(ad.currency)}
                      {form.watch("amount")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{ad.asset} Amount:</span>
                    <span className="font-medium">
                      {assetAmount} {ad.asset}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className={getStatusBadge(tradeStatus)}>
                      {tradeStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Payment Proof Upload */}
              {tradeStatus === "PENDING" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="payment-proof">Payment Proof</Label>
                    <Input
                      id="payment-proof"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={handleUploadProof}
                    disabled={!paymentProofFile}
                    className="w-full bg-bitoja-green hover:bg-bitoja-green-dark text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Payment Proof
                  </Button>
                </div>
              )}

              {/* Release Tokens */}
              {tradeStatus === "PAID" && (
                <Button
                  onClick={handleReleaseTokens}
                  className="w-full bg-bitoja-green hover:bg-bitoja-green-dark text-white"
                >
                  Release Tokens
                </Button>
              )}

              {/* Trade Completed */}
              {tradeStatus === "COMPLETED" && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium text-green-900">
                    Trade Completed
                  </h3>
                  <p className="text-sm text-green-600">
                    Tokens have been released successfully
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
