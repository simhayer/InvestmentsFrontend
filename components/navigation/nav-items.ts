import { BarChart2, BarChart3, Home, Link2 } from "lucide-react";

export type NavItem = {
  name: string;
  href: string;
  icon?: typeof Home;
  exact?: boolean;
};

export const NAV_ITEMS_AUTHED: NavItem[] = [
  { name: "Market Overview", href: "/dashboard/market", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: Home, exact: true },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Holdings", href: "/holdings", icon: BarChart2 },
  { name: "Connections", href: "/connections", icon: Link2 },
];

export const NAV_ITEMS_PUBLIC: NavItem[] = [
  { name: "Market Overview", href: "/market", icon: Home },
  { name: "Pricing", href: "/pricing", icon: BarChart3 },
];
