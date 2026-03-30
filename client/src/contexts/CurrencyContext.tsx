import React, { createContext, useContext, useEffect, useState } from "react";

export type Currency = "USD" | "KES";

interface CurrencyContextType {
  currency: Currency;
  toggleCurrency: () => void;
  convertPrice: (priceUSD: number) => number;
  formatPrice: (price: number | string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rate: 1 USD = 130 KES (approximate, you can update this)
const EXCHANGE_RATE = 130;

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [mounted, setMounted] = useState(false);

  // Load currency preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("currency") as Currency | null;
    if (saved && (saved === "USD" || saved === "KES")) {
      setCurrency(saved);
    }
    setMounted(true);
  }, []);

  // Save currency preference to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("currency", currency);
    }
  }, [currency, mounted]);

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === "USD" ? "KES" : "USD"));
  };

  const convertPrice = (priceUSD: number): number => {
    if (currency === "USD") return priceUSD;
    return Math.round(priceUSD * EXCHANGE_RATE);
  };

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    const convertedPrice = convertPrice(numPrice);

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(convertedPrice);
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, convertPrice, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
