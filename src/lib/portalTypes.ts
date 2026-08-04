import type { PaymentStatus, PaymentType } from "@/data/portalPaymentTemplates";
import { PORTAL_CURRENCY } from "@/lib/supabase";

export type GuestBooking = {
  id: string;
  guest_name: string | null;
  guest_email: string;
  trip_slug: string;
  trip_name: string | null;
  package_type: string | null;
  package_name: string | null;
  itinerary_pdf_url: string | null;
  total_trip_price: number | null;
  deposit_amount: number | null;
  balance_remaining: number | null;
  room_upgrade_enabled: boolean | null;
  room_upgrade_name: string | null;
  room_upgrade_total: number | null;
  guest_count: number | null;
  booking_status: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentInstallment = {
  id: string;
  guest_booking_id: string;
  payment_label: string | null;
  payment_type: PaymentType | null;
  base_amount: number | null;
  upgrade_portion: number | null;
  discount_amount: number | null;
  total_amount: number | null;
  currency: string | null;
  due_date: string | null;
  status: PaymentStatus | null;
  shopify_payment_link: string | null;
  paid_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type BookingWithInstallments = GuestBooking & {
  payment_installments: PaymentInstallment[];
};

export const formatMoney = (value?: number | null, currency = PORTAL_CURRENCY) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

export const calculateRemainingBalance = (installments: PaymentInstallment[]) =>
  installments
    .filter((installment) => installment.payment_type !== "deposit")
    .filter((installment) => installment.status !== "paid")
    .reduce((total, installment) => total + Number(installment.total_amount ?? 0), 0);
