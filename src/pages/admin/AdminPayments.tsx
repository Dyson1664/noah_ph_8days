import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/common/Footer";
import { PAYMENT_STATUS_LABELS, paymentStatusLabel } from "@/components/portal/PaymentStatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getPortalPackageTemplate,
  PaymentStatus,
  PaymentType,
  PaymentInstallmentTemplate,
  PORTAL_PACKAGE_TEMPLATES,
} from "@/data/portalPaymentTemplates";
import {
  BookingWithInstallments,
  calculateRemainingBalance,
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
import { cn } from "@/lib/utils";

const statusOptions: PaymentStatus[] = [
  "paid",
  "upcoming",
  "due_now",
  "pending_confirmation",
  "overdue",
];

const summaryStatuses: PaymentStatus[] = [
  "upcoming",
  "due_now",
  "pending_confirmation",
  "overdue",
];

const paymentTypeOptions: PaymentType[] = [
  "deposit",
  "balance_1",
  "balance_2",
  "balance_3",
  "balance_4",
  "other",
];

const paymentTypeLabels: Record<PaymentType, string> = {
  deposit: "Deposit",
  balance_1: "Balance Payment 1",
  balance_2: "Balance Payment 2",
  balance_3: "Balance Payment 3",
  balance_4: "Balance Payment 4",
  other: "Other",
};

const paymentTypeOrder: Record<PaymentType, number> = {
  deposit: 0,
  balance_1: 1,
  balance_2: 2,
  balance_3: 3,
  balance_4: 4,
  other: 5,
};

type BookingFormState = {
  id?: string;
  guest_name: string;
  guest_email: string;
  trip_name: string;
  package_type: string;
  package_name: string;
  itinerary_pdf_url: string;
  total_trip_price: string;
  deposit_amount: string;
  balance_remaining: string;
  room_upgrade_enabled: boolean;
  room_upgrade_name: string;
  room_upgrade_total: string;
  guest_count: string;
  booking_status: string;
};

const initialPackageTemplate = PORTAL_PACKAGE_TEMPLATES[0];

const emptyBookingForm: BookingFormState = {
  guest_name: "",
  guest_email: "",
  trip_name: PORTAL_TRIP_NAME,
  package_type: initialPackageTemplate.package_type,
  package_name: initialPackageTemplate.package_name,
  itinerary_pdf_url: "",
  total_trip_price: String(initialPackageTemplate.total_trip_price),
  deposit_amount: String(initialPackageTemplate.deposit_amount),
  balance_remaining: String(initialPackageTemplate.balance_remaining),
  room_upgrade_enabled: false,
  room_upgrade_name: "",
  room_upgrade_total: "0",
  guest_count: "1",
  booking_status: "active",
};

const toMoneyString = (value?: number | null) => String(Number(value ?? 0));

const formatDueDate = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const sortInstallments = (installments: PaymentInstallment[]) =>
  [...installments].sort(
    (a, b) =>
      (paymentTypeOrder[a.payment_type ?? "other"] ?? 5) -
      (paymentTypeOrder[b.payment_type ?? "other"] ?? 5)
  );

const createInstallmentFromTemplate = (
  installment: PaymentInstallmentTemplate,
  index: number,
  bookingId = "",
  existing?: PaymentInstallment
): PaymentInstallment => ({
  id: existing?.id ?? `new-${index}-${installment.payment_type}`,
  guest_booking_id: bookingId || existing?.guest_booking_id || "",
  payment_label: installment.payment_label,
  payment_type: installment.payment_type,
  base_amount: installment.base_amount,
  upgrade_portion: installment.upgrade_portion,
  discount_amount: installment.discount_amount,
  total_amount: installment.total_amount,
  currency: installment.currency,
  due_date: installment.due_date,
  status: installment.status,
  shopify_payment_link: existing?.shopify_payment_link ?? "",
  paid_at: installment.status === "paid" ? existing?.paid_at ?? new Date().toISOString() : null,
  admin_notes: existing?.admin_notes ?? "",
  created_at: existing?.created_at ?? "",
  updated_at: existing?.updated_at ?? "",
});

const createInstallmentsFromPackage = (
  packageType: string,
  currentInstallments: PaymentInstallment[],
  bookingId = ""
) => {
  if (currentInstallments.length > 0) {
    return currentInstallments.map((installment) => ({
      ...installment,
      guest_booking_id: bookingId || installment.guest_booking_id,
    }));
  }

  const template = getPortalPackageTemplate(packageType);
  if (!template) return currentInstallments;

  return template.installments.map((installment, index) =>
    createInstallmentFromTemplate(installment, index, bookingId)
  );
};

export default function AdminPayments() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingWithInstallments[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingFormState>(emptyBookingForm);
  const [installments, setInstallments] = useState<PaymentInstallment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<PaymentType | "all">("all");
  const [roomUpgradeFilter, setRoomUpgradeFilter] = useState<"all" | "upgraded" | "standard">("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [installmentIdsPendingDeletion, setInstallmentIdsPendingDeletion] = useState<string[]>([]);
  const [isDeletingBooking, setIsDeletingBooking] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const selectedBooking = bookings.find((booking) => booking.id === selectedBookingId) ?? null;
  const selectedInstallment =
    installments.find((installment) => installment.id === selectedInstallmentId) ??
    installments[0] ??
    null;

  const loadBookings = async () => {
    if (!supabase) return;

    const { data, error: queryError } = await supabase
      .from("guest_bookings")
      .select("*, payment_installments(*)")
      .eq("trip_slug", PORTAL_TRIP_SLUG)
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      return;
    }

    setBookings((data ?? []) as BookingWithInstallments[]);
  };

  useEffect(() => {
    const checkAdmin = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setError("Supabase is not configured yet.");
        setIsLoading(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const { data: hasAdminAccess } = await supabase.rpc("is_portal_admin_for_trip", {
        input_trip_slug: PORTAL_TRIP_SLUG,
      });

      if (hasAdminAccess !== true) {
        setError("You do not have admin access.");
        setIsLoading(false);
        return;
      }

      setIsAdmin(true);
      await loadBookings();
      setIsLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    if (!selectedBooking) return;

    const sorted = sortInstallments(
      createInstallmentsFromPackage(
        selectedBooking.package_type ?? "",
        selectedBooking.payment_installments ?? [],
        selectedBooking.id
      )
    );
    setBookingForm({
      id: selectedBooking.id,
      guest_name: selectedBooking.guest_name ?? "",
      guest_email: selectedBooking.guest_email ?? "",
      trip_name: selectedBooking.trip_name ?? PORTAL_TRIP_NAME,
      package_type: selectedBooking.package_type ?? "early_bird",
      package_name: selectedBooking.package_name ?? "",
      itinerary_pdf_url: selectedBooking.itinerary_pdf_url ?? "",
      total_trip_price: toMoneyString(selectedBooking.total_trip_price),
      deposit_amount: toMoneyString(selectedBooking.deposit_amount),
      balance_remaining: toMoneyString(selectedBooking.balance_remaining),
      room_upgrade_enabled: Boolean(selectedBooking.room_upgrade_enabled),
      room_upgrade_name: selectedBooking.room_upgrade_name ?? "",
      room_upgrade_total: toMoneyString(selectedBooking.room_upgrade_total),
      guest_count: String(Number(selectedBooking.guest_count ?? 1)),
      booking_status: selectedBooking.booking_status ?? "active",
    });
    setInstallments(sorted);
    setSelectedInstallmentId(sorted[0]?.id ?? null);
    setInstallmentIdsPendingDeletion([]);
  }, [selectedBooking]);

  const filteredBookings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      const bookingInstallments = createInstallmentsFromPackage(
        booking.package_type ?? "",
        booking.payment_installments ?? [],
        booking.id
      );
      const matchesSearch =
        !normalizedSearch ||
        [booking.guest_name, booking.guest_email, booking.trip_name, booking.package_name, booking.booking_status]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch));

      const matchesPaymentFilters =
        statusFilter === "all" && paymentTypeFilter === "all"
          ? true
          : bookingInstallments.some((installment) => {
              const matchesStatus = statusFilter === "all" || installment.status === statusFilter;
              const matchesPaymentType =
                paymentTypeFilter === "all" || installment.payment_type === paymentTypeFilter;
              return matchesStatus && matchesPaymentType;
            });

      const matchesRoomUpgrade =
        roomUpgradeFilter === "all" ||
        (roomUpgradeFilter === "upgraded" && booking.room_upgrade_enabled) ||
        (roomUpgradeFilter === "standard" && !booking.room_upgrade_enabled);

      return matchesSearch && matchesPaymentFilters && matchesRoomUpgrade;
    });
  }, [bookings, paymentTypeFilter, roomUpgradeFilter, search, statusFilter]);

  const activeSummaryStatuses = paymentTypeFilter === "all" ? summaryStatuses : statusOptions;

  const summaryCounts = useMemo(() => {
    const counts = Object.fromEntries(activeSummaryStatuses.map((status) => [status, 0])) as Record<
      PaymentStatus,
      number
    >;
    filteredBookings.forEach((booking) => {
      createInstallmentsFromPackage(
        booking.package_type ?? "",
        booking.payment_installments ?? [],
        booking.id
      ).forEach((installment) => {
        const matchesPaymentType = paymentTypeFilter === "all" || installment.payment_type === paymentTypeFilter;
        if (matchesPaymentType && installment.status && installment.status in counts) counts[installment.status] += 1;
      });
    });
    return counts;
  }, [activeSummaryStatuses, filteredBookings, paymentTypeFilter]);

  const totalGuestCount = useMemo(
    () =>
      filteredBookings.reduce(
        (total, booking) => total + Math.max(1, Number(booking.guest_count ?? 1)),
        0
      ),
    [filteredBookings]
  );

  const applyTemplate = (packageType: string) => {
    if (packageType === bookingForm.package_type) return;

    const template = getPortalPackageTemplate(packageType);
    if (!template) return;

    setBookingForm((current) => ({
      ...current,
      package_type: template.package_type,
      package_name: template.package_name,
      total_trip_price: String(template.total_trip_price),
      deposit_amount: String(template.deposit_amount),
      balance_remaining: String(template.balance_remaining),
      room_upgrade_enabled: Boolean(template.room_upgrade_enabled),
      room_upgrade_name: template.room_upgrade_name ?? "",
      room_upgrade_total: String(template.room_upgrade_total ?? 0),
    }));

    const freshInstallments = createInstallmentsFromPackage(
      template.package_type,
      [],
      bookingForm.id ?? ""
    );
    const reusedInstallmentIds = new Set<string>();
    const nextInstallments = freshInstallments.map((freshInstallment) => {
      const existingInstallment = installments.find(
        (installment) =>
          !installment.id.startsWith("new-") &&
          !reusedInstallmentIds.has(installment.id) &&
          installment.payment_type === freshInstallment.payment_type
      );

      if (!existingInstallment) return freshInstallment;

      reusedInstallmentIds.add(existingInstallment.id);
      return {
        ...freshInstallment,
        id: existingInstallment.id,
        paid_at:
          freshInstallment.status === "paid"
            ? existingInstallment.paid_at ?? freshInstallment.paid_at
            : null,
        admin_notes: existingInstallment.admin_notes ?? "",
        created_at: existingInstallment.created_at,
        updated_at: existingInstallment.updated_at,
      };
    });
    const obsoleteInstallmentIds = installments
      .filter(
        (installment) =>
          !installment.id.startsWith("new-") && !reusedInstallmentIds.has(installment.id)
      )
      .map((installment) => installment.id);

    if (obsoleteInstallmentIds.length > 0) {
      setInstallmentIdsPendingDeletion((current) => [
        ...new Set([...current, ...obsoleteInstallmentIds]),
      ]);
    }

    setInstallments(nextInstallments);
    setSelectedInstallmentId(nextInstallments[0]?.id ?? null);
  };

  const startNewBooking = () => {
    const template = getPortalPackageTemplate(initialPackageTemplate.package_type);
    const nextInstallments =
      template?.installments.map((installment, index) =>
        createInstallmentFromTemplate(installment, index)
      ) ?? [];

    setSelectedBookingId(null);
    setSelectedInstallmentId(nextInstallments[0]?.id ?? null);
    setBookingForm(emptyBookingForm);
    setInstallments(nextInstallments);
    setInstallmentIdsPendingDeletion([]);
    setMessage("");
    setError("");
  };

  const updateInstallment = (id: string, key: keyof PaymentInstallment, value: string) => {
    setInstallments((current) =>
      current.map((installment) =>
        installment.id === id
          ? {
              ...installment,
              [key]:
                key === "base_amount" ||
                key === "upgrade_portion" ||
                key === "discount_amount" ||
                key === "total_amount"
                  ? Number(value)
                  : value,
              paid_at:
                key === "status"
                  ? value === "paid"
                    ? installment.paid_at ?? new Date().toISOString()
                    : null
                  : installment.paid_at,
            }
          : installment
      )
    );
  };

  const addInstallment = () => {
    const newInstallment: PaymentInstallment = {
      id: `new-${Date.now()}`,
      guest_booking_id: bookingForm.id ?? "",
      payment_label: "Additional Payment",
      payment_type: "other",
      base_amount: 0,
      upgrade_portion: 0,
      discount_amount: 0,
      total_amount: 0,
      currency: PORTAL_CURRENCY,
      due_date: null,
      status: "upcoming",
      shopify_payment_link: "",
      paid_at: null,
      admin_notes: "",
      created_at: "",
      updated_at: "",
    };
    setInstallments((current) => [...current, newInstallment]);
    setSelectedInstallmentId(newInstallment.id);
  };

  const removeInstallment = (installment: PaymentInstallment) => {
    if (!installment.id.startsWith("new-")) {
      setInstallmentIdsPendingDeletion((current) => [
        ...new Set([...current, installment.id]),
      ]);
    }
    const nextInstallments = installments.filter((item) => item.id !== installment.id);
    setInstallments(nextInstallments);
    setSelectedInstallmentId(nextInstallments[0]?.id ?? null);
  };

  const verifySelectedBookingIsCurrent = async () => {
    if (!supabase || !bookingForm.id || !selectedBooking) return true;

    const { data: currentBooking, error: versionError } = await supabase
      .from("guest_bookings")
      .select("updated_at, payment_installments(id, updated_at)")
      .eq("id", bookingForm.id)
      .eq("trip_slug", PORTAL_TRIP_SLUG)
      .single();

    if (versionError || !currentBooking) {
      setError(versionError?.message ?? "Could not verify the current booking version.");
      return false;
    }

    if (currentBooking.updated_at !== selectedBooking.updated_at) {
      setError("This booking changed in another admin session. Reload before saving so no updates are overwritten.");
      return false;
    }

    const currentInstallments = new Map(
      (currentBooking.payment_installments ?? []).map((installment) => [
        installment.id,
        installment.updated_at,
      ])
    );
    const trackedInstallments = [
      ...installments.filter((installment) => !installment.id.startsWith("new-")),
      ...(selectedBooking.payment_installments ?? []).filter((installment) =>
        installmentIdsPendingDeletion.includes(installment.id)
      ),
    ];

    const hasStaleInstallment = trackedInstallments.some(
      (installment) => currentInstallments.get(installment.id) !== installment.updated_at
    );
    if (hasStaleInstallment) {
      setError("A payment changed in another admin session. Reload before saving so no updates are overwritten.");
      return false;
    }

    return true;
  };

  const saveBooking = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;

    setIsSaving(true);
    setMessage("");
    setError("");

    const normalizedEmail = bookingForm.guest_email.trim().toLowerCase();
    const duplicateBooking = bookings.find(
      (booking) =>
        booking.id !== bookingForm.id &&
        booking.guest_email.trim().toLowerCase() === normalizedEmail
    );
    if (duplicateBooking) {
      setError(`A ${PORTAL_TRIP_NAME} booking already exists for this email. Open the existing booking instead of adding another one.`);
      setIsSaving(false);
      return;
    }

    if (!(await verifySelectedBookingIsCurrent())) {
      setIsSaving(false);
      return;
    }

    const bookingPayload = {
      trip_slug: PORTAL_TRIP_SLUG,
      guest_name: bookingForm.guest_name.trim(),
      guest_email: normalizedEmail,
      trip_name: bookingForm.trip_name.trim(),
      package_type: bookingForm.package_type,
      package_name: bookingForm.package_name.trim(),
      itinerary_pdf_url: bookingForm.itinerary_pdf_url.trim() || null,
      total_trip_price: Number(bookingForm.total_trip_price || 0),
      deposit_amount: Number(bookingForm.deposit_amount || 0),
      balance_remaining: Number(bookingForm.balance_remaining || 0),
      room_upgrade_enabled: bookingForm.room_upgrade_enabled,
      room_upgrade_name: bookingForm.room_upgrade_name.trim() || null,
      room_upgrade_total: Number(bookingForm.room_upgrade_total || 0),
      guest_count: Math.max(1, Number(bookingForm.guest_count || 1)),
      booking_status: bookingForm.booking_status.trim() || "active",
    };

    const bookingResult = bookingForm.id
      ? await supabase
          .from("guest_bookings")
          .update(bookingPayload)
          .eq("id", bookingForm.id)
          .eq("trip_slug", PORTAL_TRIP_SLUG)
          .eq("updated_at", selectedBooking?.updated_at ?? "")
          .select("id, updated_at")
          .maybeSingle()
      : await supabase.from("guest_bookings").insert(bookingPayload).select("id").single();

    if (bookingResult.error || !bookingResult.data) {
      setError(
        bookingResult.error?.code === "23505"
          ? `A ${PORTAL_TRIP_NAME} booking already exists for this email. Open the existing booking instead.`
          : bookingResult.error?.message ??
              "This booking changed in another admin session. Reload before saving."
      );
      setIsSaving(false);
      return;
    }

    const bookingId = bookingResult.data.id;

    const installmentsToSave = createInstallmentsFromPackage(
      bookingForm.package_type,
      installments,
      bookingId
    );

    for (const installment of installmentsToSave) {
      const installmentPayload = {
        guest_booking_id: bookingId,
        payment_label: installment.payment_label,
        payment_type: installment.payment_type,
        base_amount: Number(installment.base_amount ?? 0),
        upgrade_portion: Number(installment.upgrade_portion ?? 0),
        discount_amount: Number(installment.discount_amount ?? 0),
        total_amount: Number(installment.total_amount ?? 0),
        currency: installment.currency || PORTAL_CURRENCY,
        due_date: installment.due_date || null,
        status: installment.status || "upcoming",
        shopify_payment_link: installment.shopify_payment_link?.trim() || null,
        paid_at: installment.status === "paid" ? installment.paid_at ?? new Date().toISOString() : null,
        admin_notes: installment.admin_notes?.trim() || null,
      };

      const isNewInstallment = installment.id.startsWith("new-");
      const result = isNewInstallment
        ? await supabase.from("payment_installments").insert(installmentPayload)
        : await supabase
            .from("payment_installments")
            .update(installmentPayload)
            .eq("id", installment.id)
            .eq("guest_booking_id", bookingId)
            .eq("updated_at", installment.updated_at)
            .select("id")
            .maybeSingle();

      if (result.error || (!isNewInstallment && !result.data)) {
        setError(
          result.error?.code === "23505"
            ? "This payment schedule would create a duplicate deposit or balance payment. Reload and try again."
            : result.error?.message ??
                "A payment changed in another admin session. Reload before saving."
        );
        setIsSaving(false);
        return;
      }
    }

    if (installmentIdsPendingDeletion.length > 0) {
      const { error: deleteError } = await supabase
        .from("payment_installments")
        .delete()
        .eq("guest_booking_id", bookingId)
        .in("id", installmentIdsPendingDeletion);

      if (deleteError) {
        setError(deleteError.message);
        setIsSaving(false);
        return;
      }
    }

    setInstallmentIdsPendingDeletion([]);
    await loadBookings();
    setSelectedBookingId(bookingId);
    setMessage("Booking and payment installments saved.");
    setIsSaving(false);
  };

  const deleteBooking = async () => {
    if (!supabase || !bookingForm.id) return;

    setIsDeletingBooking(true);
    setMessage("");
    setError("");
    const { error: deleteError } = await supabase
      .from("guest_bookings")
      .delete()
      .eq("id", bookingForm.id)
      .eq("trip_slug", PORTAL_TRIP_SLUG);
    if (deleteError) {
      setError(deleteError.message);
      setIsDeletingBooking(false);
      return;
    }

    startNewBooking();
    await loadBookings();
    setMessage("Booking deleted.");
    setIsDeletingBooking(false);
    setIsDeleteDialogOpen(false);
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-16">
        <section>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">{PORTAL_TRIP_NAME} admin payments</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Manually manage guest bookings, Shopify links, amounts, statuses, and notes.
              </p>
            </div>
            <Button variant="outline" onClick={startNewBooking}>
              New booking
            </Button>
          </div>

          {isLoading && <p className="text-sm text-muted-foreground">Checking admin access...</p>}
          {message ? <div className="mb-4 rounded-lg border bg-card px-4 py-3 text-sm">{message}</div> : null}
          {error ? (
            <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {isAdmin && (
            <>
              <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Total guests</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{totalGuestCount}</p>
                </div>
                {activeSummaryStatuses.map((status) => (
                  <div key={status} className="rounded-xl border bg-card p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {PAYMENT_STATUS_LABELS[status]}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-foreground">{summaryCounts[status] ?? 0}</p>
                  </div>
                ))}
              </section>

              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <section className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="grid gap-3 md:grid-cols-3">
                    <Input
                      className="md:col-span-3"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search guest, email, trip"
                    />
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => setStatusFilter(value as PaymentStatus | "all")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {PAYMENT_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={paymentTypeFilter}
                      onValueChange={(value) => setPaymentTypeFilter(value as PaymentType | "all")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All payments</SelectItem>
                        {paymentTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {paymentTypeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={roomUpgradeFilter}
                      onValueChange={(value) => setRoomUpgradeFilter(value as "all" | "upgraded" | "standard")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All rooms</SelectItem>
                        <SelectItem value="upgraded">Room upgrade</SelectItem>
                        <SelectItem value="standard">No room upgrade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-4 max-h-[680px] space-y-2 overflow-auto">
                    {filteredBookings.map((booking) => {
                      const bookingInstallments = sortInstallments(
                        createInstallmentsFromPackage(
                          booking.package_type ?? "",
                          booking.payment_installments ?? [],
                          booking.id
                        )
                      );
                      const isSelected = selectedBookingId === booking.id;
                      return (
                        <button
                          key={booking.id}
                          type="button"
                          onClick={() => setSelectedBookingId(booking.id)}
                          className={cn(
                            "w-full rounded-lg border p-4 text-left transition hover:border-primary/40",
                            isSelected ? "border-primary bg-primary/5" : "bg-background"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">{booking.guest_name || "Unnamed guest"}</p>
                              <p className="truncate text-xs text-muted-foreground">{booking.guest_email}</p>
                              <p className="mt-1 truncate text-sm font-medium text-primary">{booking.trip_name}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {Number(booking.guest_count ?? 1)} {Number(booking.guest_count ?? 1) === 1 ? "guest" : "guests"}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold text-foreground">
                                {formatMoney(calculateRemainingBalance(bookingInstallments))}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {bookingInstallments.map((installment) => {
                              const dueDate = formatDueDate(installment.due_date);
                              const hasStatusFilter = statusFilter !== "all";
                              const hasPaymentTypeFilter = paymentTypeFilter !== "all";
                              const isMatch =
                                (hasStatusFilter || hasPaymentTypeFilter) &&
                                (!hasStatusFilter || installment.status === statusFilter) &&
                                (!hasPaymentTypeFilter || installment.payment_type === paymentTypeFilter);

                              return (
                                <span
                                  key={installment.id}
                                  className={cn(
                                    "rounded-full px-2 py-1 text-[11px]",
                                    isMatch
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {installment.payment_label ||
                                    paymentTypeLabels[installment.payment_type ?? "other"]}
                                  : {paymentStatusLabel(installment.status)}
                                  {dueDate ? ` - Due ${dueDate}` : ""}
                                </span>
                              );
                            })}
                          </div>
                        </button>
                      );
                    })}
                    {filteredBookings.length === 0 && (
                      <p className="p-4 text-sm text-muted-foreground">No bookings found.</p>
                    )}
                  </div>
                </section>

                <div className="space-y-6">
                  <form onSubmit={saveBooking} className="space-y-6">
                    <section className="rounded-xl border bg-card p-5 shadow-sm">
                      <h2 className="text-lg font-semibold text-foreground">Booking record</h2>

                    <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <label className="mb-2 block text-sm font-medium text-foreground">
                        Package type
                      </label>
                      <Select value={bookingForm.package_type} onValueChange={applyTemplate}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select a package to auto-fill pricing" />
                        </SelectTrigger>
                        <SelectContent>
                          {PORTAL_PACKAGE_TEMPLATES.map((template) => (
                            <SelectItem key={template.package_type} value={template.package_type}>
                              {template.package_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {getPortalPackageTemplate(bookingForm.package_type) ? (
                        <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                          {getPortalPackageTemplate(bookingForm.package_type)!.installments.map((payment) => (
                            <div key={payment.payment_type} className="rounded-md bg-background px-3 py-2">
                              <p className="font-semibold text-foreground">{payment.payment_label}</p>
                              <p>{formatMoney(payment.total_amount)}</p>
                              <p>
                                {payment.status === "paid"
                                  ? "Paid"
                                  : payment.due_date
                                    ? `Due ${payment.due_date}`
                                    : "Due date not set"}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <p className="mt-3 text-xs text-muted-foreground">
                        Selecting a package resets the booking totals and payment schedule to that package.
                        You can then edit installments, due dates, room upgrades, and Shopify links before saving.
                      </p>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Field label="Guest name">
                        <Input value={bookingForm.guest_name} onChange={(e) => setBookingForm({ ...bookingForm, guest_name: e.target.value })} required />
                      </Field>
                      <Field label="Guest email">
                        <Input type="email" value={bookingForm.guest_email} onChange={(e) => setBookingForm({ ...bookingForm, guest_email: e.target.value })} required />
                      </Field>
                      <Field label="Trip name">
                        <Input value={bookingForm.trip_name} onChange={(e) => setBookingForm({ ...bookingForm, trip_name: e.target.value })} />
                      </Field>
                      <Field label="Package / room summary">
                        <Input value={bookingForm.package_name} onChange={(e) => setBookingForm({ ...bookingForm, package_name: e.target.value })} />
                      </Field>
                      <Field label="Itinerary PDF URL">
                        <Input value={bookingForm.itinerary_pdf_url} onChange={(e) => setBookingForm({ ...bookingForm, itinerary_pdf_url: e.target.value })} placeholder="Paste PDF URL" />
                      </Field>
                      <Field label="Total trip price">
                        <Input type="number" value={bookingForm.total_trip_price} onChange={(e) => setBookingForm({ ...bookingForm, total_trip_price: e.target.value })} />
                      </Field>
                      <Field label="Deposit paid">
                        <Input type="number" value={bookingForm.deposit_amount} onChange={(e) => setBookingForm({ ...bookingForm, deposit_amount: e.target.value })} />
                      </Field>
                      <Field label="Balance remaining">
                        <Input type="number" value={bookingForm.balance_remaining} onChange={(e) => setBookingForm({ ...bookingForm, balance_remaining: e.target.value })} />
                      </Field>
                      <Field label="Number of guests">
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={bookingForm.guest_count}
                          onChange={(e) => setBookingForm({ ...bookingForm, guest_count: e.target.value })}
                        />
                      </Field>
                      <Field label="Booking status">
                        <Input value={bookingForm.booking_status} onChange={(e) => setBookingForm({ ...bookingForm, booking_status: e.target.value })} />
                      </Field>
                    </div>

                    <div className="mt-4 rounded-lg border p-4">
                      <label className="flex items-center gap-3 text-sm font-medium">
                        <Checkbox
                          checked={bookingForm.room_upgrade_enabled}
                          onCheckedChange={(checked) =>
                            setBookingForm({ ...bookingForm, room_upgrade_enabled: checked === true })
                          }
                        />
                        Room upgrade enabled
                      </label>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Field label="Room upgrade name">
                          <Input value={bookingForm.room_upgrade_name} onChange={(e) => setBookingForm({ ...bookingForm, room_upgrade_name: e.target.value })} />
                        </Field>
                        <Field label="Room upgrade total">
                          <Input type="number" value={bookingForm.room_upgrade_total} onChange={(e) => setBookingForm({ ...bookingForm, room_upgrade_total: e.target.value })} />
                        </Field>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Saving booking..." : "Save booking"}
                      </Button>
                      {bookingForm.id ? (
                        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                          <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive" disabled={isDeletingBooking}>
                              Delete booking
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this booking?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the booking for{" "}
                                {bookingForm.guest_name || "this guest"} and remove their payment installments.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isDeletingBooking}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={isDeletingBooking}
                                onClick={deleteBooking}
                              >
                                {isDeletingBooking ? "Deleting..." : "Yes, delete booking"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : null}
                      <Button type="button" variant="outline" onClick={signOut}>
                        Sign out
                      </Button>
                    </div>
                    </section>

                    <section className="rounded-xl border bg-card p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="text-lg font-semibold text-foreground">Payment instalments</h2>
                      <Button type="button" variant="outline" onClick={addInstallment}>
                        New instalment
                      </Button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {installments.map((installment) => (
                        <button
                          key={installment.id}
                          type="button"
                          onClick={() => setSelectedInstallmentId(installment.id)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs",
                            selectedInstallment?.id === installment.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "text-muted-foreground"
                          )}
                        >
                          {installment.payment_label || "Payment"}
                        </button>
                      ))}
                    </div>

                    {selectedInstallment ? (
                      <div className="mt-5 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Payment label">
                            <Input value={selectedInstallment.payment_label ?? ""} onChange={(e) => updateInstallment(selectedInstallment.id, "payment_label", e.target.value)} />
                          </Field>
                          <Field label="Payment type">
                            <Select value={selectedInstallment.payment_type ?? "other"} onValueChange={(value) => updateInstallment(selectedInstallment.id, "payment_type", value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {paymentTypeOptions.map((option) => (
                                  <SelectItem key={option} value={option}>{paymentTypeLabels[option]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="Base amount">
                            <Input type="number" value={toMoneyString(selectedInstallment.base_amount)} onChange={(e) => updateInstallment(selectedInstallment.id, "base_amount", e.target.value)} />
                          </Field>
                          <Field label="Upgrade portion">
                            <Input type="number" value={toMoneyString(selectedInstallment.upgrade_portion)} onChange={(e) => updateInstallment(selectedInstallment.id, "upgrade_portion", e.target.value)} />
                          </Field>
                          <Field label="Discount amount">
                            <Input type="number" value={toMoneyString(selectedInstallment.discount_amount)} onChange={(e) => updateInstallment(selectedInstallment.id, "discount_amount", e.target.value)} />
                          </Field>
                          <Field label="Total due">
                            <Input type="number" value={toMoneyString(selectedInstallment.total_amount)} onChange={(e) => updateInstallment(selectedInstallment.id, "total_amount", e.target.value)} />
                          </Field>
                          <Field label="Currency">
                            <Input value={selectedInstallment.currency ?? PORTAL_CURRENCY} onChange={(e) => updateInstallment(selectedInstallment.id, "currency", e.target.value)} />
                          </Field>
                          <Field label="Due date">
                            <Input type="date" value={selectedInstallment.due_date ?? ""} onChange={(e) => updateInstallment(selectedInstallment.id, "due_date", e.target.value)} />
                          </Field>
                          <Field label="Status">
                            <Select value={selectedInstallment.status ?? "upcoming"} onValueChange={(value) => updateInstallment(selectedInstallment.id, "status", value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {PAYMENT_STATUS_LABELS[status]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="Manual Shopify payment link">
                            <Input value={selectedInstallment.shopify_payment_link ?? ""} onChange={(e) => updateInstallment(selectedInstallment.id, "shopify_payment_link", e.target.value)} />
                          </Field>
                        </div>

                        <Field label="Admin notes">
                          <Textarea
                            value={selectedInstallment.admin_notes ?? ""}
                            onChange={(e) => updateInstallment(selectedInstallment.id, "admin_notes", e.target.value)}
                          />
                        </Field>

                        <div className="flex flex-wrap gap-3">
                          <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Saving instalment..." : "Save instalment"}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => removeInstallment(selectedInstallment)}>
                            Remove instalment
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No installment selected.</p>
                    )}
                    </section>
                  </form>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
