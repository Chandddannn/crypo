export const formatCurrency = (value?: string | number | null, digits = 2) => {
  if (value == null) return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
  });
};

export const formatNumber = (value?: string | number | null, digits = 2) => {
  if (value == null) return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString("en-US", {
    maximumFractionDigits: digits,
  });
};

export const formatPct = (value?: string | number | null) => {
  if (value == null) return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(num)) return "-";
  return `${num.toFixed(2)}%`;
};
