// Formatting utilities

import { format, formatDistanceToNow } from "date-fns";

/**
 * Format a date string to a readable format
 */
export function formatDate(dateISO: string): string {
  return format(new Date(dateISO), "MMM d, yyyy");
}

/**
 * Format a date string to show relative time (e.g., "in 5 days")
 */
export function formatDateRelative(dateISO: string): string {
  return formatDistanceToNow(new Date(dateISO), { addSuffix: true });
}

/**
 * Format currency amount (EUR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/**
 * Format grams to readable format (e.g., "1.5kg" or "250g")
 */
export function formatGrams(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return kg % 1 === 0 ? `${kg}kg` : `${kg.toFixed(1)}kg`;
  }
  return `${grams}g`;
}
