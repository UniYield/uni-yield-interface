import { Link, useLocation } from "react-router-dom";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Vault", path: "/" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "How it works", path: "/how-it-works" },
];

export function Navigation() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            UniYield
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Connect Wallet Button */}
        <Button variant="outline" size="sm" className="gap-2">
          <Wallet className="h-4 w-4" />
          <span>Connect Wallet</span>
        </Button>
      </div>
    </header>
  );
}
