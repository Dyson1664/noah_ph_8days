import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import {
  getPortalPackageTemplate,
  type PaymentStatus,
  type PaymentType,
} from "@/data/portalPaymentTemplates";
import {
  BookingWithInstallments,
  formatMoney,
  PaymentInstallment,
} from "@/lib/portalTypes";
import {
  isSupabaseConfigured,
  PORTAL_CURRENCY,
  PORTAL_TRIP_NAME,
  PORTAL_TRIP_SLUG,
  supabase,
} from "@/lib/supabase";

const paymentNotice =
  "Payments are processed securely through Shopify. After payment, your portal balance will be updated by our team within 48 hours.";

const statusLabels: Record<PaymentStatus, string> = {
  paid: "Paid",
  upcoming: "Upcoming",
  due_now: "Due now",
  pending_confirmation: "Pending confirmation",
  overdue: "Overdue",
};

const paymentTypeOrder: Record<PaymentType, number> = {
  deposit: 0,
  balance_1: 1,
  balance_2: 2,
  balance_3: 3,
  balance_4: 4,
  other: 5,
};

function packagePaymentsForBooking(booking: BookingWithInstallments) {
  const template = getPortalPackageTemplate(booking.package_type ?? "");
  const existingPayments = booking.payment_installments ?? [];

  if (existingPayments.length > 0 || !template) return existingPayments;

  const normalizedPayments: PaymentInstallment[] = template.installments.map((templatePayment, index) => {
    return {
      id: `template-${index}-${templatePayment.payment_type}`,
      guest_booking_id: booking.id,
      payment_label: templatePayment.payment_label,
      payment_type: templatePayment.payment_type,
      base_amount: templatePayment.base_amount,
      upgrade_portion: templatePayment.upgrade_portion,
      discount_amount: templatePayment.discount_amount,
      total_amount: templatePayment.total_amount,
      currency: templatePayment.currency,
      due_date: templatePayment.due_date,
      status: templatePayment.status,
      shopify_payment_link: null,
      paid_at: templatePayment.status === "paid" ? booking.created_at : null,
      admin_notes: null,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
    };
  });

  return normalizedPayments;
}

function statusClass(status?: PaymentStatus | null) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "due_now":
      return "bg-primary/10 text-primary border-primary/20";
    case "pending_confirmation":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "overdue":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function formatDueDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PaymentCard({ installment }: { installment: PaymentInstallment }) {
  const upgradePortion = Number(installment.upgrade_portion || 0);
  const discountAmount = Number(installment.discount_amount || 0);
  const isDeposit = installment.payment_type === "deposit";
  const isBalancePayment = installment.payment_type?.startsWith("balance_") ?? false;
  const status = installment.status ?? "upcoming";

  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{installment.payment_label}</h3>
          {installment.due_date ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Due {formatDueDate(installment.due_date)}
            </p>
          ) : null}
        </div>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(status)}`}>
          {statusLabels[status]}
        </span>
      </div>

      <dl className="mt-5 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">
            {isDeposit ? "Deposit amount" : "Base trip balance"}
          </dt>
          <dd className="font-medium">{formatMoney(installment.base_amount, installment.currency ?? PORTAL_CURRENCY)}</dd>
        </div>
        {upgradePortion > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Room upgrade portion</dt>
            <dd className="font-medium">{formatMoney(upgradePortion, installment.currency ?? PORTAL_CURRENCY)}</dd>
          </div>
        ) : null}
        {discountAmount > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Discount</dt>
            <dd className="font-medium">-{formatMoney(discountAmount, installment.currency ?? PORTAL_CURRENCY)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4 border-t pt-3 text-base">
          <dt className="font-semibold text-foreground">Total due</dt>
          <dd className="font-bold text-foreground">{formatMoney(installment.total_amount, installment.currency ?? PORTAL_CURRENCY)}</dd>
        </div>
      </dl>

      {!isDeposit && status !== "paid" ? (
        <div className="mt-5">
          {installment.shopify_payment_link ? (
            <a href={installment.shopify_payment_link} target="_blank" rel="noreferrer">
              <Button className="w-full sm:w-auto">Pay securely via Shopify</Button>
            </a>
          ) : (
            <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
              Payment link coming soon.
            </p>
          )}
          {isBalancePayment ? (
            <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-6 text-foreground">
              After you pay this instalment through Shopify, please allow up to 48 hours for
              our team to update this payment to paid.
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default function GuestDashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [booking, setBooking] = useState<BookingWithInstallments | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBooking = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setError("Supabase is not configured yet.");
        setIsLoading(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate("/guest-login", { replace: true });
        return;
      }

      setSession(sessionData.session);
      const email = sessionData.session.user.email?.trim().toLowerCase();
      const { data, error: queryError } = await supabase
        .from("guest_bookings")
        .select("*, payment_installments(*)")
        .eq("guest_email", email)
        .eq("trip_slug", PORTAL_TRIP_SLUG)
        .order("created_at", { ascending: false })
        .order("created_at", { referencedTable: "payment_installments", ascending: true })
        .limit(1)
        .maybeSingle();

      if (queryError) {
        setError(queryError.message);
      } else {
        setBooking(data as BookingWithInstallments | null);
      }
      setIsLoading(false);
    };

    loadBooking();
  }, [navigate]);

  const sortedPayments = useMemo(() => {
    if (!booking) return [];

    const packagePayments = packagePaymentsForBooking(booking);
    const hasDeposit = packagePayments.some((item) => item.payment_type === "deposit");
    const payments = hasDeposit || Number(booking.deposit_amount ?? 0) <= 0
      ? packagePayments
      : [
          {
            id: "deposit-paid",
            guest_booking_id: booking.id,
            payment_label: "Deposit",
            payment_type: "deposit" as const,
            base_amount: booking.deposit_amount,
            upgrade_portion: 0,
            discount_amount: 0,
            total_amount: booking.deposit_amount,
            currency: PORTAL_CURRENCY,
            due_date: null,
            status: "paid" as const,
            shopify_payment_link: null,
            paid_at: null,
            admin_notes: null,
            created_at: booking.created_at,
            updated_at: booking.updated_at,
          },
          ...packagePayments,
        ];

    return [...payments].sort(
      (a, b) =>
        (paymentTypeOrder[a.payment_type ?? "other"] ?? 5) -
        (paymentTypeOrder[b.payment_type ?? "other"] ?? 5)
    );
  }, [booking]);

  const remainingBalance = useMemo(
    () =>
      sortedPayments
        .filter((installment) => installment.payment_type !== "deposit")
        .filter((installment) => installment.status !== "paid")
        .reduce((total, installment) => total + Number(installment.total_amount || 0), 0),
    [sortedPayments]
  );

  const hasSingleRoomUpgrade = useMemo(() => {
    if (!booking) return false;
    return (
      Boolean(booking.room_upgrade_enabled) ||
      Boolean(booking.package_name?.toLowerCase().includes("single room")) ||
      Boolean(booking.room_upgrade_name)
    );
  }, [booking]);

  const signOut = async () => {
    await supabase?.auth.signOut();
    navigate("/guest-login");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">{PORTAL_TRIP_NAME} payment dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Signed in as {session?.user.email || "your booking email"}
            </p>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign out
          </Button>
        </div>

        {isLoading ? (
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            Loading your booking...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
            {error}
          </div>
        ) : !booking ? (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">No booking found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We could not find a booking for this email address. Please check that you used
              the email address from your booking.
            </p>
            <Link to="/contact" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
              Contact us
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
                <div>
                  <p className="text-sm text-muted-foreground">Guest</p>
                  <h2 className="mt-1 text-2xl font-bold text-foreground">{booking.guest_name}</h2>
                  <p className="mt-3 text-lg font-semibold text-primary">{booking.trip_name}</p>
                  {booking.package_name ? (
                    <p className="mt-1 text-sm font-medium text-foreground">{booking.package_name}</p>
                  ) : null}
                  <div className="mt-4">
                    {booking.itinerary_pdf_url ? (
                      <a
                        href={booking.itinerary_pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="inline-flex"
                      >
                        <Button type="button" variant="outline">
                          Download itinerary PDF
                        </Button>
                      </a>
                    ) : (
                      <Button type="button" variant="outline" disabled>
                        Download itinerary coming soon
                      </Button>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border bg-background px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Package
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {booking.package_name || "Package details"}
                      </p>
                    </div>
                    <div
                      className={`rounded-lg border px-4 py-3 ${
                        hasSingleRoomUpgrade ? "border-primary/30 bg-primary/10" : "bg-background"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Room type
                      </p>
                      <p
                        className={`mt-1 text-sm font-bold ${
                          hasSingleRoomUpgrade ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {hasSingleRoomUpgrade ? "Single room upgrade included" : "Shared room"}
                      </p>
                    </div>
                  </div>

                  {hasSingleRoomUpgrade ? (
                    <p className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-6 text-foreground">
                      Your booking includes a <span className="font-semibold">single room upgrade</span>
                      {booking.room_upgrade_name ? `: ${booking.room_upgrade_name}` : ""}.
                      {Number(booking.room_upgrade_total || 0) > 0
                        ? ` The upgrade total is ${formatMoney(booking.room_upgrade_total)}.`
                        : ""}{" "}
                      This is included in the payment schedule shown below.
                    </p>
                  ) : null}
                </div>

                <dl className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total trip price</dt>
                    <dd className="font-semibold">{formatMoney(booking.total_trip_price)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Deposit paid</dt>
                    <dd className="font-semibold">{formatMoney(booking.deposit_amount)}</dd>
                  </div>
                  <div className="flex justify-between border-t pt-3 text-base">
                    <dt className="font-semibold text-foreground">Balance remaining</dt>
                    <dd className="font-bold text-foreground">{formatMoney(remainingBalance)}</dd>
                  </div>
                </dl>
              </div>
            </section>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-foreground">
              {paymentNotice}
            </div>

            <section>
              <h2 className="mb-4 text-xl font-bold text-primary">Payment schedule</h2>
              <div className="grid gap-4">
                {sortedPayments.map((installment) => (
                  <PaymentCard key={installment.id} installment={installment} />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
