import Sidebar from '../../components/Sidebar'
import { usePage } from '@inertiajs/react'
import { TrendingUp, BarChart3 } from 'lucide-react'

type MonthlyRevenueItem = {
  month: string
  amount: number
  width: string
}

type TopServiceItem = {
  name: string
  bookings: number
  revenue: number
  percent: string
}

type AnalyticsPageProps = {
  monthlyRevenue?: MonthlyRevenueItem[]
  topServices?: TopServiceItem[]
}

const Analytics = () => {
  const page = usePage()
  const props = (page.props ?? {}) as AnalyticsPageProps

  const monthlyRevenue: MonthlyRevenueItem[] = Array.isArray(props.monthlyRevenue)
    ? props.monthlyRevenue
    : []

  const topServices: TopServiceItem[] = Array.isArray(props.topServices)
    ? props.topServices
    : []

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-64 min-h-screen">
        <header className="border-b bg-white px-8 py-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-emerald-600" size={28} />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
              <p className="text-sm text-slate-500">
                Revenue and Top Services Overview
              </p>
            </div>
          </div>
        </header>

        <main className="space-y-8 p-8">
          <div className="rounded-2xl border bg-white p-6 shadow">
            <div className="mb-6 flex items-center gap-2">
              <TrendingUp className="text-emerald-600" size={22} />
              <h2 className="text-2xl font-bold text-slate-900">
                Monthly Revenue
              </h2>
            </div>

            {monthlyRevenue.length > 0 ? (
              <div className="space-y-5">
                {monthlyRevenue.map((item, index) => (
                  <div key={index}>
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        {item.month}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {Number(item.amount ?? 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        style={{ width: item.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-500">
                No revenue data available.
              </div>
            )}
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow">
            <div className="mb-6 flex items-center gap-2">
              <BarChart3 className="text-violet-600" size={22} />
              <h2 className="text-2xl font-bold text-slate-900">
                Top Services
              </h2>
            </div>

            {topServices.length > 0 ? (
              <div className="overflow-hidden rounded-xl border">
                <table className="w-full">
                  <thead className="bg-emerald-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Service
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Bookings
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Revenue
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Performance
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {topServices.map((service, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {service.name}
                        </td>

                        <td className="px-6 py-4 text-slate-700">
                          {service.bookings}
                        </td>

                        <td className="px-6 py-4 font-semibold text-emerald-600">
                          {Number(service.revenue ?? 0).toLocaleString()}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-32 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                style={{ width: service.percent }}
                              />
                            </div>

                            <span className="text-sm font-semibold text-slate-700">
                              {service.percent}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-500">
                No top services data available.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Analytics