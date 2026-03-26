import Sidebar from '../../components/Sidebar'
import Card from '../../components/Card'
import { usePage, router } from '@inertiajs/react'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Wrench,
  CalendarDays,
  Clock,
  CheckCircle2,
  UserCheck,
  ArrowRight,
  Wallet,
} from 'lucide-react'

interface Stats {
  totalBookings: number
  pendingAppointments: number
  completedServices: number
  activeStaff: number
}

interface RecentAppointment {
  id: number
  customer_name?: string | null
  service_title?: string | null
  booking_date?: string | null
  booking_time?: string | null
  price?: number | string | null
  status?: string | null
}

const Dashboard = () => {
  const { auth, stats, recentAppointments } = usePage().props as any

  const statsData = [
    {
      title: 'Total Bookings',
      value: String((stats as Stats)?.totalBookings ?? 0),
      trend: 'up',
      color: 'emerald',
      icon: <CalendarDays size={20} />,
    },
    {
      title: 'Pending Appointments',
      value: String((stats as Stats)?.pendingAppointments ?? 0),
      trend: 'down',
      color: 'teal',
      icon: <Clock size={20} />,
    },
    {
      title: 'Completed Services',
      value: String((stats as Stats)?.completedServices ?? 0),
      trend: 'up',
      color: 'blue',
      icon: <CheckCircle2 size={20} />,
    },
    {
      title: 'Active Staff',
      value: String((stats as Stats)?.activeStaff ?? 0),
      trend: 'up',
      color: 'slate',
      icon: <UserCheck size={20} />,
    },
  ]

  const formatPrice = (price: number | string | null | undefined) => {
    const parsed = Number(price ?? 0)
    if (Number.isNaN(parsed)) return '0'
    return `₱${parsed}`
  }

  const formatSchedule = (
    bookingDate?: string | null,
    bookingTime?: string | null
  ) => {
    const date = bookingDate ?? 'No date'
    const time = bookingTime ?? 'No time'
    return `${date} ${time}`
  }

  const getStatusStyles = (status?: string | null) => {
    const normalized = String(status ?? 'pending').toLowerCase()

    if (normalized === 'completed') {
      return 'bg-emerald-100 text-emerald-700'
    }

    if (normalized === 'cancelled') {
      return 'bg-red-100 text-red-700'
    }

    return 'bg-amber-100 text-amber-700'
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-64 flex-1 p-8">
        <div className="mb-10 flex items-center gap-3">
          <CalendarDays className="text-emerald-600" size={30} />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500">
              Welcome back, {auth?.user?.name ?? 'Admin'}
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, index) => (
            <Card
              key={index}
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              trendIcon={
                stat.trend === 'up' ? (
                  <TrendingUp size={18} />
                ) : (
                  <TrendingDown size={18} />
                )
              }
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* RECENT APPOINTMENTS */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="text-blue-600" size={22} />
                <h2 className="text-2xl font-bold text-slate-900">
                  Recent Appointments
                </h2>
              </div>

              <button
                onClick={() => router.visit('/admin/appointments')}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-white transition hover:bg-emerald-700"
              >
                View All
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {recentAppointments && recentAppointments.length > 0 ? (
                (recentAppointments as RecentAppointment[]).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-900">
                          <Users size={16} className="text-emerald-600" />
                          {(appointment.customer_name ?? 'Customer') +
                            ' - ' +
                            (appointment.service_title ?? 'Service')}
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <CalendarDays size={14} />
                          {formatSchedule(
                            appointment.booking_date,
                            appointment.booking_time
                          )}
                        </div>

                        <div
                          className={`mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyles(
                            appointment.status
                          )}`}
                        >
                          {String(appointment.status ?? 'pending').toLowerCase() ===
                          'completed' ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <Clock size={12} />
                          )}
                          {appointment.status ?? 'pending'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-bold text-emerald-600">
                        <Wallet size={16} />
                        {formatPrice(appointment.price)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                  No recent appointments found.
                </div>
              )}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-slate-900">
              Quick Actions
            </h2>

            <div className="space-y-3">
              <button
                onClick={() => router.visit('/admin/staff')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 p-4 text-white transition hover:bg-teal-700"
              >
                <Users size={18} />
                Manage Staff
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => router.visit('/admin/services')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 p-4 text-white transition hover:bg-blue-700"
              >
                <Wrench size={18} />
                Add Service
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard