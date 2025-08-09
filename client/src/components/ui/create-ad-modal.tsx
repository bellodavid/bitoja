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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

const createAdSchema = z.object({
  asset: z.enum(["BTC", "USDT"]),
  tradeType: z.enum(["BUY", "SELL"]),
  currency: z.enum(["NGN", "GHS", "USD", "EUR"]),
  paymentMethod: z.enum([
    "BANK_TRANSFER",
    "MOBILE_MONEY",
    "WIRE_TRANSFER",
    "CASH",
  ]),
  rate: z.string().min(1, "Rate is required"),
  minLimit: z.string().min(1, "Minimum limit is required"),
  maxLimit: z.string().min(1, "Maximum limit is required"),
});

type CreateAdForm = z.infer<typeof createAdSchema>;

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CreateAdForm) => void;
}

export default function CreateAdModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateAdModalProps) {
  const { toast } = useToast();
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");

  const form = useForm<CreateAdForm>({
    resolver: zodResolver(createAdSchema),
    defaultValues: {
      asset: "BTC",
      tradeType: "BUY",
      currency: "NGN",
      paymentMethod: "BANK_TRANSFER",
      rate: "",
      minLimit: "",
      maxLimit: "",
    },
  });

  const handleSubmit = (data: CreateAdForm) => {
    // Validate that min < max
    const minLimit = parseFloat(data.minLimit);
    const maxLimit = parseFloat(data.maxLimit);

    if (minLimit >= maxLimit) {
      toast({
        title: "Error",
        description: "Maximum limit must be greater than minimum limit",
        variant: "destructive",
      });
      return;
    }

    // Validate rate is positive
    const rate = parseFloat(data.rate);
    if (rate <= 0) {
      toast({
        title: "Error",
        description: "Rate must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    // Call the onSubmit callback if provided
    if (onSubmit) {
      onSubmit(data);
    } else {
      toast({
        title: "Success",
        description: "Advertisement created successfully",
      });
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Advertisement</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="asset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="USDT">Tether (USDT)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tradeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trade Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setTradeType(value as "BUY" | "SELL");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trade type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BUY">Buy</SelectItem>
                      <SelectItem value="SELL">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="NGN">NGN</SelectItem>
                      <SelectItem value="GHS">GHS</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BANK_TRANSFER">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                      <SelectItem value="WIRE_TRANSFER">
                        Wire Transfer
                      </SelectItem>
                      <SelectItem value="CASH">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate ({form.watch("currency")})</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Limit ({form.watch("currency")})</FormLabel>
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

              <FormField
                control={form.control}
                name="maxLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Limit ({form.watch("currency")})</FormLabel>
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
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-bitoja-green hover:bg-bitoja-green-dark text-white"
              >
                Create Advertisement
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
