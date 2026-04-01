interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon?: React.ReactNode;
}

export default function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{title}</p>
        {icon && <div className="text-gray-500">{icon}</div>}
      </div>
      <p className="text-2xl font-semibold text-white mt-1">{value}</p>
      {change && (
        <p
          className={`text-xs mt-1 ${
            change.startsWith("+") ? "text-green-500" : change.startsWith("-") ? "text-red-500" : "text-gray-500"
          }`}
        >
          {change}
        </p>
      )}
    </div>
  );
}
