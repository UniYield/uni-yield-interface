import { Link, useLocation } from "react-router-dom";
import { ChevronDown, LogOut, Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Vault", path: "/" },
  { label: "Stats", path: "/uniyield" },
  { label: "How it works", path: "/how-it-works" },
];

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function Navigation() {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const injected = connectors.find((c) => c.type === "injected");

  const handleConnect = () => {
    if (injected) connect({ connector: injected });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/90">
      <div className="container flex h-14 items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="group flex min-w-0 shrink-0 items-center gap-3 transition-all duration-200 hover:opacity-85"
        >
          <span
            className="flex h-9 shrink-0 items-center rounded-lg px-1.5 py-1 ring-1 ring-border/40 transition-colors group-hover:ring-primary/20 group-hover:bg-primary/5"
            aria-hidden
          >
            <img
              src="/assets/images/uniyield.svg"
              alt="UniYield"
              className="h-7 w-auto max-h-7 object-contain object-left"
              height={28}
              fetchPriority="high"
            />
          </span>
          <span className="hidden truncate text-base font-semibold tracking-tight text-foreground sm:inline">
            UniYield
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 rounded-lg bg-muted/40 p-1 ring-1 ring-border/40">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center">
          {isConnected && address ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 rounded-lg border-border/50 bg-muted/30 px-3.5 font-medium shadow-none ring-1 ring-border/30 transition-all hover:border-primary/30 hover:bg-muted/50 hover:ring-primary/20"
                >
                  <span className="relative flex h-4 w-4 items-center justify-center">
                    <Wallet className="h-3.5 w-3.5 text-primary" />
                    <span
                      className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-success ring-2 ring-background"
                      aria-hidden
                    />
                  </span>
                  <span className="tabular-nums text-foreground">
                    {truncateAddress(address)}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-xl border-border/60 shadow-xl shadow-black/5"
              >
                <DropdownMenuItem
                  className="cursor-default gap-2 font-mono text-xs text-muted-foreground"
                  disabled
                >
                  {address}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 focus:bg-destructive/10 focus:text-destructive"
                  onClick={() => disconnect()}
                >
                  <LogOut className="h-4 w-4" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              className="h-9 gap-2 rounded-lg px-4 font-medium shadow-sm transition-all hover:shadow-md hover:shadow-primary/10"
              disabled={!injected || isPending}
              onClick={handleConnect}
            >
              <Wallet className="h-4 w-4" />
              <span>{isPending ? "Connecting…" : "Connect Wallet"}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
