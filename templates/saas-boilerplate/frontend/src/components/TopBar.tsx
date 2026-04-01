"use client";

import { Search } from "lucide-react";

interface TopBarProps {
  sidebarOpen: boolean;
}

export default function TopBar({ sidebarOpen }: TopBarProps) {
  return (
    <div
      className={`fixed top-0 right-0 h-14 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-4 z-40 transition-all duration-300 ${
        sidebarOpen ? "left-64" : "left-16"
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">Ethereum Mainnet</span>
      </div>

      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          Connect Wallet
        </button>
      </div>
    </div>
  );
}
