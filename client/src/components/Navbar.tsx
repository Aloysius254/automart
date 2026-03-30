import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Car,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { currency, toggleCurrency } = useCurrency();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartQuery = trpc.cart.get.useQuery(undefined, { enabled: isAuthenticated });
  const cartCount = cartQuery.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const navLinks = [
    { href: "/cars", label: "Cars", icon: Car },
    { href: "/parts", label: "Spare Parts", icon: Package },
  ];

  const isActive = (href: string) => location.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-xl font-bold text-foreground tracking-tight">Auto</span>
              <span className="font-display text-xl font-bold text-primary tracking-tight">Mart</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Currency Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCurrency}
              className="hidden md:flex text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted"
            >
              {currency}
            </Button>
            {/* Cart */}
            {isAuthenticated && (
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {/* Auth */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex items-center gap-2 px-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium max-w-24 truncate">{user?.name ?? "Account"}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center gap-2 cursor-pointer">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2 cursor-pointer text-primary">
                          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                className="hidden md:flex items-center gap-2"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            )}

            {/* Currency Toggle Mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCurrency}
              className="md:hidden text-xs font-medium px-2 py-1 rounded-lg border border-border hover:bg-muted"
            >
              {currency}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-3 flex flex-col gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border mt-1">
              {isAuthenticated ? (
                <>
                  <Link href="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
                    <Package className="w-4 h-4" /> My Orders
                  </Link>
                  {user?.role === "admin" && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-primary hover:bg-primary/10">
                      <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  )}
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Button className="w-full" onClick={() => (window.location.href = getLoginUrl())}>
                  <LogIn className="w-4 h-4 mr-2" /> Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
