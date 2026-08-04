import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/data/portalPaymentTemplates";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: "Paid",
  upcoming: "Upcoming",
  due_now: "Due now",
  pending_confirmation: "Pending confirmation",
  overdue: "Overdue",
};

const PAYMENT_STATUS_CLASSES: Record<PaymentStatus, string> = {
  paid: "border-green-200 bg-green-50 text-green-700",
  upcoming: "border-border bg-muted text-muted-foreground",
  due_now: "border-primary/25 bg-primary/10 text-primary",
  pending_confirmation: "border-amber-200 bg-amber-50 text-amber-700",
  overdue: "border-red-200 bg-red-50 text-red-700",
};

export const paymentStatusLabel = (status?: PaymentStatus | null) =>
  status ? PAYMENT_STATUS_LABELS[status] ?? status : "Upcoming";

export const paymentStatusClass = (status?: PaymentStatus | null) =>
  status ? PAYMENT_STATUS_CLASSES[status] ?? PAYMENT_STATUS_CLASSES.upcoming : PAYMENT_STATUS_CLASSES.upcoming;

export function PaymentStatusBadge({
  status,
  className,
}: {
  status?: PaymentStatus | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        paymentStatusClass(status),
        className
      )}
    >
      {paymentStatusLabel(status)}
    </span>
  );
}
