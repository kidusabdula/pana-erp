// components/Layout/Layout.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  AlertCircle,
  Lock,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText as FileTextIcon,
  Receipt,
  BookOpen,
  UtensilsCrossed,
  Package,
  Box,
  ShoppingCart,
  Truck,
  Settings,
  LogOut,
  CreditCard,
  TrendingUp,
  Store,
  FileBarChart,
  BarChart3,
  PieChart,
  Home,
  DollarSign,
  ShoppingCart as ShoppingCartIcon,
  PackageOpen,
  ClipboardCheck,
  Factory,
  Archive,
  Wrench,
  HelpCircle,
  Building,
  FileSearch,
  FileText,
  Calculator,
  MapPin,                // “Locations”
  ArrowLeftRight,        // “Movements”
  TrendingUpDown,        // “Value Adjustments”
  Settings2,             // “Maintenance”
  PanelLeftOpen,         // *** NEW: Icon for an open/collapsible sidebar ***
  PanelLeftClose,        // *** NEW: Icon for a closed/expanded sidebar ***
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isAccountingOpen, setIsAccountingOpen] = useState(false);
  const [isManufacturingOpen, setIsManufacturingOpen] = useState(false);
  const [isCRMOpen, setIsCRMOpen] = useState(false);
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    // Close all dropdowns when collapsing
    if (!isCollapsed) {
      setIsAccountingOpen(false);
      setIsAssetsOpen(false);      // <-- close assets when collapsing
      setIsManufacturingOpen(false);
      setIsCRMOpen(false);
      setIsStockOpen(false);
      setIsSettingsOpen(false);
    }
  };

  // Check if a link is active
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)] dark overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-[var(--sidebar-foreground)] transition-all duration-300 h-full",
          isCollapsed ? "w-22" : "w-64"
        )}
      >
        {/* Fixed header section */}
        <div className="p-4 border-b border-[var(--sidebar-border)] flex items-center justify-between flex-shrink-0">
          {!isCollapsed ? (
            <h2 className="text-lg font-extrabold flex items-center">
              <img src="/pana-logo.png" alt="VersaForge ERP Logo" className="mr-2 h-15 w-50" />
             
            </h2>
          ) : (
            <div className="flex justify-center w-full">
              <img src="/logo.png" alt="VersaForge ERP Logo" className="w-6 h-6 scale-150" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-3 w-3 flex-shrink-0"
          >
            {/* *** UPDATED: Use new, aesthetic sidebar toggle icons *** */}
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Scrollable navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-6">

            {/* Inventory Section */}
            <div>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                  Inventory
                </h3>
              )}
              <div className="space-y-1">
                {/* Stock Dropdown */}
                <div className="space-y-1">
                  {isCollapsed ? (
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-center px-2 text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
                        isActive("/stock") ? "bg-[var(--sidebar-accent)]" : ""
                      )}
                      title="Stock Management"
                      onClick={() => setIsStockOpen(!isStockOpen)}
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between px-2 text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
                        isActive("/stock") ? "bg-[var(--sidebar-accent)]" : ""
                      )}
                      onClick={() => setIsStockOpen(!isStockOpen)}
                    >
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Stock Management
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isStockOpen ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  )}
                  {isStockOpen && (
                    <div className={`space-y-1 ${isCollapsed ? "" : "pl-8"}`}>
                      <Link href="/stock/dashboard">
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-2 px-2 text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
                            isCollapsed ? "justify-center" : "",
                            isActive("/stock/dashboard")
                              ? "bg-[var(--sidebar-accent)]"
                              : ""
                          )}
                          title="Stock Dashboard"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          {!isCollapsed && "Dashboard"}
                        </Button>
                      </Link>
                      <Link href="/stock/delivery-notes">
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-2 px-2 text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
                            isCollapsed ? "justify-center" : "",
                            isActive("/stock/delivery-notes")
                              ? "bg-[var(--sidebar-accent)]"
                              : ""
                          )}
                          title="Delivery Notes"
                        >
                          <Truck className="h-4 w-4" />
                          {!isCollapsed && "Delivery Notes"}
                        </Button>
                      </Link>
                      <Link href="/stock/item">
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-2 px-2 text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
                            isCollapsed ? "justify-center" : "",
                            isActive("/stock/item")
                              ? "bg-[var(--sidebar-accent)]"
                              : ""
                          )}
                          title="Items"
                        >
                          <Box className="h-4 w-4" />
                          {!isCollapsed && "Items"}
                        </Button>
                      </Link>
                      <Link href="/stock/stock-entries">
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-2 px-2 text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
                            isCollapsed ? "justify-center" : "",
                            isActive("/stock/stock-entries")
                              ? "bg-[var(--sidebar-accent)]"
                              : ""
                          )}
                          title="Stock Entries"
                        >
                          <PackageOpen className="h-4 w-4" />
                          {!isCollapsed && "Stock Entries"}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Settings and Help section are currently commented out */}
          </nav>
        </div>

        {/* Fixed footer section */}
        <div className="p-4 border-t border-[var(--sidebar-border)] flex-shrink-0">
          {isCollapsed ? (
            <div className="flex justify-center">
              <div className="rounded-full bg-[var(--sidebar-primary)] p-1">
                <User className="h-4 w-4 text-[var(--sidebar-primary-foreground)]" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 py-2 rounded-lg hover:bg-[var(--sidebar-accent)] transition-colors cursor-pointer">
              <div className="rounded-full bg-[var(--sidebar-primary)] p-1">
                <User className="h-5 w-5 text-[var(--sidebar-primary-foreground)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Kidus Abdula</p>
                <p className="text-xs text-muted-foreground truncate">
                  kidus489@gmail.com
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}