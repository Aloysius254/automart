import { Car, Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Car className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">
                Auto<span className="text-primary">Mart</span>
              </span>
            </div>
            <p className="text-sm text-background/60 leading-relaxed mb-5">
              Your trusted destination for premium vehicles and genuine spare parts. Quality you can rely on.
            </p>
            <div className="flex items-center gap-3">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-background/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-background/50 mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/cars", label: "Browse Cars" },
                { href: "/parts", label: "Spare Parts" },
                { href: "/cars?condition=new", label: "New Arrivals" },
                { href: "/cars?featured=true", label: "Featured Vehicles" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-background/70 hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-background/50 mb-4">Account</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/orders", label: "My Orders" },
                { href: "/cart", label: "Shopping Cart" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-background/70 hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-background/50 mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-background/70">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                123 Auto Drive, Motor City, MC 45678
              </li>
              <li className="flex items-center gap-2.5 text-sm text-background/70">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2.5 text-sm text-background/70">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                info@automart.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-background/40">© {new Date().getFullYear()} AutoMart. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-background/40 hover:text-background/70 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-background/40 hover:text-background/70 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
