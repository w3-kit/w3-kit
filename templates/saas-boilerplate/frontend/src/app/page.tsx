import Link from "next/link";
import { Rocket, Shield, CreditCard, Users, FileText, Zap } from "lucide-react";

const features = [
  { title: "Subscriptions", description: "On-chain subscription management with flexible plans", icon: CreditCard },
  { title: "Access Control", description: "Role-based permissions with subscriber and user roles", icon: Shield },
  { title: "Token Payments", description: "ERC20 & NFT payment integration for flexible billing", icon: Zap },
  { title: "Referral System", description: "Built-in referral tracking and reward distribution", icon: Users },
  { title: "Billing", description: "Automated invoice management and payment processing", icon: FileText },
  { title: "Gasless Transactions", description: "Meta-transaction support with relayer pattern", icon: Rocket },
];

const techStack = ["Next.js 15", "Solidity", "shadcn/ui", "w3-kit", "Hardhat", "Tailwind CSS"];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-6">
          <Rocket size={14} />
          Built with w3-kit — 27 Web3 components
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
          Token Launchpad
          <span className="block text-blue-500 mt-2">Starter Kit</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Launch and manage tokens with vesting, airdrops, staking, and DeFi tools.
          6 smart contracts. 27 UI components. Production-ready.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Launch App
          </Link>
          <a
            href="https://github.com/AnonimRosul/w3-kit"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            View on GitHub
          </a>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold text-center mb-10">6 Smart Contracts, Ready to Deploy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5"
            >
              <feature.icon className="h-8 w-8 text-blue-500 mb-3" />
              <h3 className="text-lg font-medium text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-8">Built With</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="bg-gray-900 border border-gray-800 rounded-full px-4 py-2 text-sm text-gray-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Get Started in 5 Minutes</h2>
        <pre className="bg-gray-900 border border-gray-800 rounded-lg p-4 inline-block text-left mb-6">
          <code className="text-gray-300 text-sm">npx shadcn@latest add @w3-kit/token-card</code>
        </pre>
        <div className="block">
          <Link
            href="/dashboard"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Explore the Demo
          </Link>
        </div>
      </div>
    </div>
  );
}
