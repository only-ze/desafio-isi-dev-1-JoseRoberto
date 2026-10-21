const BRASILIA = "America/Sao_Paulo";

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: BRASILIA,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatMoney(value: number): string {
  return moneyFormatter.format(value);
}

export function formatSignedMoney(value: number): string {
  const sign = value < 0 ? "-" : "+";
  return `${sign}${formatMoney(Math.abs(value))}`;
}

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso)).replace(", ", " ");
}

export function toApiDateTime(localValue: string): string {
  return `${localValue.slice(0, 16)}-03:00`;
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}