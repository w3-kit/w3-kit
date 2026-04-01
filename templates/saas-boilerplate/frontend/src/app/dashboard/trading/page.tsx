"use client";

import { TokenSwapWidget } from "@/components/w3-kit/token-swap";
import { LimitOrderManager } from "@/components/w3-kit/limit-order-manager";
import { BridgeWidget } from "@/components/w3-kit/bridge";
import { GasCalculator } from "@/components/w3-kit/gas-calculator";

export default function TradingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Trading</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-lg font-medium text-gray-300 mb-4">Swap</h2>
            <TokenSwapWidget onSwap={async () => {}} />
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-300 mb-4">Limit Orders</h2>
            <LimitOrderManager orders={[] as any} />
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-medium text-gray-300 mb-4">Bridge</h2>
            <BridgeWidget />
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-300 mb-4">Gas Estimator</h2>
            <GasCalculator />
          </section>
        </div>
      </div>
    </div>
  );
}
