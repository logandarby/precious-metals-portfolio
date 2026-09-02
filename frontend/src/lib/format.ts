import type { Metal, WeightUnit } from "@/api/portfolios";

export const METAL_LABELS: Record<Metal, string> = {
  GOLD: "Gold",
  SILVER: "Silver",
  PLATINUM: "Platinum",
  PALLADIUM: "Palladium",
};

export const METAL_ORDER: Metal[] = [
  "GOLD",
  "SILVER",
  "PLATINUM",
  "PALLADIUM",
];

export const UNIT_LABELS: Record<WeightUnit, string> = {
  TROY_OUNCE: "oz",
  GRAM: "g",
};

export const METAL_CHART_COLORS: Record<Metal, string> = {
  GOLD: "var(--chart-1)",
  SILVER: "var(--chart-2)",
  PLATINUM: "var(--chart-3)",
  PALLADIUM: "var(--chart-4)",
};

export function formatCad(amount: number | string | null | undefined): string {
  const value = Number(amount ?? 0);
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  return `${value < 0 ? "−" : ""}$${formatted} CAD`;
}

export function formatSignedCad(
  amount: number | string | null | undefined,
): string {
  const value = Number(amount ?? 0);
  const formatted = formatCad(Math.abs(value));
  if (value > 0) {
    return `+${formatted}`;
  }
  if (value < 0) {
    return `−${formatted}`;
  }
  return formatted;
}

export function formatPercent(
  amount: number | string | null | undefined,
): string {
  const value = Number(amount ?? 0);
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}%`;
}

export function formatSignedPercent(
  amount: number | string | null | undefined,
): string {
  const value = Number(amount ?? 0);
  const formatted = formatPercent(Math.abs(value));
  if (value > 0) {
    return `+${formatted}`;
  }
  if (value < 0) {
    return `−${formatted}`;
  }
  return formatted;
}

export function formatQuantity(
  quantity: number | string,
  unit: WeightUnit,
): string {
  const value = Number(quantity);
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 8,
  }).format(value);
  return `${formatted} ${UNIT_LABELS[unit]}`;
}
