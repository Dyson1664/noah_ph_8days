export type PaymentStatus =
  | "paid"
  | "upcoming"
  | "due_now"
  | "pending_confirmation"
  | "overdue";

export type PaymentType =
  | "deposit"
  | "balance_1"
  | "balance_2"
  | "balance_3"
  | "balance_4"
  | "other";

export type PaymentCurrency = "USD" | "EUR";

export type PaymentInstallmentTemplate = {
  payment_label: string;
  payment_type: PaymentType;
  base_amount: number;
  upgrade_portion: number;
  discount_amount: number;
  total_amount: number;
  currency: PaymentCurrency;
  due_date: string | null;
  status: PaymentStatus;
};

export type PortalPackageTemplate = {
  package_type: string;
  package_name: string;
  total_trip_price: number;
  deposit_amount: number;
  balance_remaining: number;
  room_upgrade_enabled?: boolean;
  room_upgrade_name?: string;
  room_upgrade_total?: number;
  installments: PaymentInstallmentTemplate[];
};

const depositInstallment: PaymentInstallmentTemplate = {
  payment_label: "Deposit",
  payment_type: "deposit",
  base_amount: 650,
  upgrade_portion: 0,
  discount_amount: 0,
  total_amount: 650,
  currency: "USD",
  due_date: null,
  status: "paid",
};

const balanceDueDates = ["2026-10-31", "2027-01-31"] as const;

const balances = (
  amounts: number[],
  firstUpgradePortion = 0,
): PaymentInstallmentTemplate[] =>
  amounts.map((amount, index) => ({
    payment_label: `Balance Payment ${index + 1}`,
    payment_type: `balance_${index + 1}` as PaymentType,
    base_amount: amount,
    upgrade_portion: index === 0 ? firstUpgradePortion : 0,
    discount_amount: 0,
    total_amount: amount + (index === 0 ? firstUpgradePortion : 0),
    currency: "USD",
    due_date: balanceDueDates[index] ?? null,
    status: "upcoming",
  }));

export const PORTAL_PACKAGE_TEMPLATES: PortalPackageTemplate[] = [
  {
    package_type: "early_bird",
    package_name: "Philippines with Noah – Early Bird",
    total_trip_price: 2259,
    deposit_amount: 650,
    balance_remaining: 1609,
    installments: [depositInstallment, ...balances([805, 804])],
  },
  {
    package_type: "early_bird_single_room",
    package_name: "Philippines with Noah – Early Bird + Single Room",
    total_trip_price: 3044,
    deposit_amount: 650,
    balance_remaining: 2394,
    room_upgrade_enabled: true,
    room_upgrade_name: "Single Room Supplement",
    room_upgrade_total: 785,
    installments: [depositInstallment, ...balances([805, 804], 785)],
  },
  {
    package_type: "standard",
    package_name: "Philippines with Noah – Standard",
    total_trip_price: 2459,
    deposit_amount: 650,
    balance_remaining: 1809,
    installments: [depositInstallment, ...balances([905, 904])],
  },
  {
    package_type: "standard_single_room",
    package_name: "Philippines with Noah – Standard + Single Room",
    total_trip_price: 3244,
    deposit_amount: 650,
    balance_remaining: 2594,
    room_upgrade_enabled: true,
    room_upgrade_name: "Single Room Supplement",
    room_upgrade_total: 785,
    installments: [depositInstallment, ...balances([905, 904], 785)],
  },
];

export const getPortalPackageTemplate = (packageType: string) =>
  PORTAL_PACKAGE_TEMPLATES.find((template) => template.package_type === packageType);
