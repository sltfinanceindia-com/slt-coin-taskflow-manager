/**
 * Currency formatting utilities for INR (Indian Rupees)
 */

export const formatINR = (amount: number, decimals = 2): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

export const formatCoinRate = (rate: number): string => {
  return `₹${rate.toFixed(4)}`;
};

export const formatCoinAmount = (coins: number, rate: number): string => {
  const inrValue = coins * rate;
  return formatINR(inrValue, 2);
};
