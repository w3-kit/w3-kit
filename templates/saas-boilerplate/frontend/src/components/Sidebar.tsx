"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Coins,
  ArrowLeftRight,
  Image,
  TrendingUp,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Rocket,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tokens", href: "/dashboard/tokens", icon: Coins },
  { name: "Trading", href: "/dashboard/trading", icon: ArrowLeftRight },
  { name: "NFTs", href: "/dashboard/nfts", icon: Image },
  { name: "DeFi", href: "/dashboard/defi", icon: TrendingUp },
  { name: "Account", href: "/dashboard/account", icon: UserCircle },
];

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={`flex flex-col h-screen fixed left-0 top-0 bg-gray-950 border-r border-gray-800 transition-all duration-300 z-50 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 bg-gray-800 border border-gray-700 text-gray-400 p-1 rounded-full hover:text-white transition-colors"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <div className="p-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <Rocket className="h-6 w-6 text-blue-500" />
          {isOpen && (
            <span className="text-lg font-semibold text-white">Launchpad</span>
          )}
        </Link>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-blue-600/10 text-blue-500"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <item.icon size={18} />
                  {isOpen && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
