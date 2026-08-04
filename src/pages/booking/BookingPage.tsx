import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/common/Footer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * ✅ Toggle payments (set to true when you’re ready to enable Shopify)
 */
const PAYMENTS_ENABLED = true;

/**
 * ✅ Option 1: Send user to Shopify product page (no variant IDs needed).
 * Your Shopify product handle is the part after /products/
 * Example: https://tbff.imaginebeyondtravel.com/products/philippines-deposit
 * Handle = philippines-deposit
 */
const BOOKING_CONFIG: Record<
  string,
  {
    countryName: string;
    productHandle: string;
    variantId?: string;
    requiresPassport: boolean;
    shopifyDomain: string;
  }
> = {
  philippines: {
    countryName: "Philippines",
    productHandle: "philippines-deposit",
    variantId: "45568665518259",
    requiresPassport: false,
    shopifyDomain: "tbff.imaginebeyondtravel.com",
  },
};

function buildShopifyProductUrl(params: {
  shopifyDomain: string;
  productHandle: string;
  attributes: Record<string, string>;
}) {
  const { shopifyDomain, productHandle, attributes } = params;

  const baseUrl = `https://${shopifyDomain}/products/${productHandle}`;

  // Optional: pass info through query string (useful later if you add a Shopify theme snippet)
  const qs = new URLSearchParams();
  Object.entries(attributes).forEach(([key, value]) => {
    qs.append(key, value);
  });

  return `${baseUrl}?${qs.toString()}`;
}

function buildShopifyCheckoutUrl(params: {
  shopifyDomain: string;
  variantId: string;
  quantity: number;
  attributes: Record<string, string>;
}) {
  const { shopifyDomain, variantId, quantity, attributes } = params;
  const baseUrl = `https://${shopifyDomain}/cart/${variantId}:${quantity}`;
  const qs = new URLSearchParams();
  Object.entries(attributes).forEach(([key, value]) => {
    qs.append(`attributes[${key}]`, value);
  });
  return `${baseUrl}?${qs.toString()}`;
}

/**
 * ✅ Base schema
 */
const baseSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  mobile: z.string().trim().min(1, "Mobile number is required").max(30),
  guestCount: z.coerce.number().int().min(1, "Minimum 1 guest").max(10),
  singleRoomSupplement: z.enum(["no", "yes"]).default("no"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

/**
 * Passport schema kept so it can be re-enabled when needed.
 */
const passportSchema = z.object({
  passportFirstNameGivenName: z.string().trim().min(1).max(100),
  passportSurname: z.string().trim().min(1).max(100),
  passportNumber: z.string().trim().min(1).max(30),
  passportNationality: z.string().trim().min(1).max(60),
  passportDateOfBirth: z.string().trim().min(1).max(30),
  passportExpiryDate: z.string().trim().min(1).max(30),
});

type BaseForm = z.infer<typeof baseSchema>;
type PassportForm = z.infer<typeof passportSchema>;

type BookingFormData = BaseForm & Partial<PassportForm>;

function parseYMD(value?: string) {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;

  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
    return undefined;
  }
  return dt;
}

function DatePickerField(props: {
  label: string;
  placeholder: string;
  name: "passportDateOfBirth" | "passportExpiryDate";
  control: Control<BookingFormData>;
  fromYear: number;
  toYear: number;
}) {
  const { label, placeholder, name, control, fromYear, toYear } = props;
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedDate = parseYMD(field.value);

        return (
          <FormItem>
            <FormLabel>{label} *</FormLabel>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <button
                    type="button"
                    className={cn(
                      "flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <span>
                      {selectedDate ? format(selectedDate, "PPP") : placeholder}
                    </span>
                    <CalendarIcon className="h-4 w-4 opacity-60" />
                  </button>
                </FormControl>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (!date) return;

                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, "0");
                    const d = String(date.getDate()).padStart(2, "0");
                    field.onChange(`${y}-${m}-${d}`);
                    setOpen(false);
                  }}
                  captionLayout="dropdown"
                  fromYear={fromYear}
                  toYear={toYear}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export default function BookingPage2() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [acknowledgementOpen, setAcknowledgementOpen] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState<BookingFormData | null>(null);


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Only support this trip slug.
  const config = slug ? BOOKING_CONFIG[slug] : undefined;

  const schema = useMemo(() => {
    if (config?.requiresPassport) return baseSchema.and(passportSchema);
    return baseSchema;
  }, [config?.requiresPassport]);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      guestCount: 1,
      singleRoomSupplement: "no",
      termsAccepted: undefined,

      passportFirstNameGivenName: "",
      passportSurname: "",
      passportNumber: "",
      passportNationality: "",
      passportDateOfBirth: "",
      passportExpiryDate: "",
    },
    mode: "onChange",
  });

  const { isValid } = form.formState;
  if (!config) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-xl mx-auto bg-card border rounded-xl p-6">
            <h1 className="text-xl font-bold text-foreground mb-2">
              Booking link not found
            </h1>
            <p className="text-muted-foreground mb-6">
              This booking page isn’t configured yet.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              Go to homepage
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const continueToShopify = (data: BookingFormData) => {
    if (!PAYMENTS_ENABLED) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const hasSingleRoomSupplement = data.singleRoomSupplement === "yes";

    const attributes: Record<string, string> = {
      Trip: config.countryName,
      "Full Name": data.fullName,
      Email: data.email,
      Mobile: data.mobile,
      "Number of Guests": String(data.guestCount ?? 1),
      "Single Room Supplement": hasSingleRoomSupplement ? "Yes" : "No",
      "Single Room Supplement Amount": hasSingleRoomSupplement
        ? "+ $785"
        : "$0",
      "Terms Accepted": "Yes",
      "Deposit Non-Refundable Acknowledged": "Yes",
    };

    if (config.requiresPassport) {
      attributes["Passport First Name / Given Name"] =
        data.passportFirstNameGivenName || "";
      attributes["Passport Surname"] = data.passportSurname || "";
      attributes["Passport Number"] = data.passportNumber || "";
      attributes["Passport Nationality"] = data.passportNationality || "";
      attributes["Passport Date of Birth"] = data.passportDateOfBirth || "";
      attributes["Passport Expiry Date"] = data.passportExpiryDate || "";
    }

    const quantity = Math.max(1, Number(data.guestCount) || 1);

    const destinationUrl = config.variantId
      ? buildShopifyCheckoutUrl({
          shopifyDomain: config.shopifyDomain,
          variantId: config.variantId,
          quantity,
          attributes,
        })
      : buildShopifyProductUrl({
          shopifyDomain: config.shopifyDomain,
          productHandle: config.productHandle,
          attributes,
        });

    window.location.href = destinationUrl;
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!PAYMENTS_ENABLED) {
      setIsSubmitting(false);
      return;
    }

    setPendingBookingData(data);
    setAcknowledgementOpen(true);
  };

  const handleDepositAcknowledgement = () => {
    if (!pendingBookingData) return;
    setAcknowledgementOpen(false);
    continueToShopify(pendingBookingData);
  };

  const paymentDisabled = !PAYMENTS_ENABLED;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
              Complete Your Booking – {config.countryName}
            </h1>
            <p className="text-muted-foreground">
              Please fill in your details to continue to payment
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Payment Plan
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Secure your spot with a non-refundable $650 USD deposit,
                    then complete your remaining balance in 2 installments: a
                    first balance payment due October 31, 2026, then the final
                    balance payment due January 31, 2027.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 234 567 8900"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guestCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Guests *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          step={1}
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="singleRoomSupplement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Single Room Supplement</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? "no"}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue>
                              {field.value === "yes"
                                ? "Add single room supplement + $785"
                                : "No supplement"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">No supplement</SelectItem>
                            <SelectItem value="yes">
                              Add single room supplement + $785
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                {config.requiresPassport && (
                  <div className="pt-4 border-t border-border">
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      Passport Details
                    </h2>

                    <div className="space-y-5">
                      <FormField
                        control={form.control}
                        name="passportFirstNameGivenName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name / Given Name *</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="passportSurname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Surname *</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="passportNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Passport Number *</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="passportNationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nationality *</FormLabel>
                            <FormControl>
                              <Input {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DatePickerField
                        label="Date of Birth"
                        placeholder="Select date of birth"
                        name="passportDateOfBirth"
                        control={form.control}
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                      />

                      <DatePickerField
                        label="Passport Expiry Date"
                        placeholder="Select expiry date"
                        name="passportExpiryDate"
                        control={form.control}
                        fromYear={new Date().getFullYear()}
                        toYear={new Date().getFullYear() + 20}
                      />
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          I confirm that I have read and agree to the{" "}
                          <a
                            href="/#/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium"
                          >
                            Terms and Conditions
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold mt-6"
                  disabled={!isValid || isSubmitting || paymentDisabled}
                >
                  {paymentDisabled
                    ? "Payments Opening Soon"
                    : isSubmitting
                    ? "Redirecting..."
                    : "Pay $650 Deposit"}
                </Button>

                {!paymentDisabled ? (
                  <p className="text-xs text-muted-foreground text-center">
                    Deposit is non-refundable.
                  </p>
                ) : null}

                {submitError ? (
                  <p className="text-sm text-destructive text-center pt-3">
                    {submitError}
                  </p>
                ) : null}



                {paymentDisabled ? (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Payments are not enabled yet — check back soon.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    You will be redirected to Shopify to checkout.
                  </p>
                )}
              </form>
            </Form>
          </div>
        </div>
      </main>

      <Dialog open={acknowledgementOpen} onOpenChange={setAcknowledgementOpen}>
        <DialogContent className="w-[calc(100vw-3rem)] max-w-xs overflow-hidden border-primary/20 p-0 sm:max-w-sm">
          <div className="border-b border-primary/15 bg-primary/10 px-4 py-3 sm:px-5 sm:py-4">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-base font-semibold text-foreground sm:text-lg">
                Deposit Confirmation
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground sm:text-sm">
                Before continuing to payment, please confirm the following:
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-3 px-4 py-3 sm:px-5 sm:py-4">
            <p className="text-xs leading-relaxed text-foreground sm:text-sm">
              Your $650 USD deposit reserves your place on the trip and will be
              applied toward your total trip balance.
            </p>
            <p className="text-xs leading-relaxed text-foreground sm:text-sm">
              I understand that deposits are non-refundable once paid.
            </p>
          </div>

          <DialogFooter className="gap-2 border-t bg-muted/20 px-4 py-3 sm:gap-2 sm:px-5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAcknowledgementOpen(false)}
              disabled={isSubmitting}
            >
              Go Back
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDepositAcknowledgement}
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Confirm & Continue to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}













