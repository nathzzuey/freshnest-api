import React from 'react'

interface CardProps {
  title: string
  value: string
  trend: string
  trendIcon: React.ReactNode
  color: string
  icon?: React.ReactNode // 👈 NEW
}

const Card = ({
  title,
  value,
  trend,
  trendIcon,
  color,
  icon,
}: CardProps) => {
  const colorClasses: Record<string, string> = {
    emerald: 'from-emerald-500 to-teal-500',
    teal: 'from-teal-500 to-cyan-500',
    slate: 'from-slate-500 to-slate-700',
    blue: 'from-blue-500 to-indigo-500',
    violet: 'from-violet-500 to-purple-500',
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      
      {/* Background glow */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl bg-gradient-to-r ${
          colorClasses[color] || 'from-slate-500 to-slate-700'
        }`}
      />

      <div className="relative flex items-start justify-between">
        {/* LEFT CONTENT */}
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h3 className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </h3>

          {/* TREND */}
          <div
            className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
              trend === 'up'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            <span className="flex items-center">{trendIcon}</span>
            <span>{trend === 'up' ? 'Increasing' : 'Decreasing'}</span>
          </div>
        </div>

        {/* RIGHT ICON BOX */}
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r text-white shadow-md transition-all duration-300 group-hover:scale-110 ${
            colorClasses[color] || 'from-slate-500 to-slate-700'
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

export default Card