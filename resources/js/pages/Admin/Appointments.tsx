import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import {
  Pencil,
  Trash2,
  CalendarDays,
  User,
  Wrench,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock3,
  MapPin,
  Users,
  Send,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface AppointmentStaff {
  id: number
  name?: string
  email?: string
}

interface Appointment {
  id: number
  user_id: number | null
  customer_name?: string | null
  service_id: number
  service_title: string
  booking_date: string
  booking_time: string
  address: string
  notes?: string | null
  status: string
  staff_id?: number | null
  staff_name?: string | null
  staff_names?: string[]
  staffs?: AppointmentStaff[]
  created_at?: string
  updated_at?: string
  user?: {
    id?: number
    name?: string
    email?: string
  } | null
  service?: {
    id?: number
    title?: string
    category?: string
    price?: number | string
  } | null
  staff?: {
    id?: number
    name?: string
    email?: string
  } | null
}

interface Staff {
  id: number
  name: string
  email?: string
  job_type?: string
}

interface ToastState {
  show: boolean
  type: 'success' | 'error'
  message: string
}

const ITEMS_PER_PAGE = 5

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [staffs, setStaffs] = useState<Staff[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [assigningId, setAssigningId] = useState<number | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Record<number, string[]>>(
    {}
  )
  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: 'success',
    message: '',
  })

  const [currentPage, setCurrentPage] = useState(1)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({
      show: true,
      type,
      message,
    })
  }

  useEffect(() => {
    if (!toast.show) return

    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }))
    }, 3000)

    return () => clearTimeout(timer)
  }, [toast.show])

  const normalizeAppointments = (data: any): Appointment[] => {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.bookings)) return data.bookings
    if (Array.isArray(data?.data)) return data.data
    return []
  }

  const normalizeStaffs = (data: any): Staff[] => {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.staffs)) return data.staffs
    if (Array.isArray(data?.data)) return data.data
    return []
  }

  const fetchAppointments = React.useCallback(async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/bookings', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch appointments.')
      }

      const rows = normalizeAppointments(data)
      setAppointments(rows)

      const initialSelected: Record<number, string[]> = {}

      rows.forEach((appointment: Appointment) => {
        if (Array.isArray(appointment.staffs) && appointment.staffs.length > 0) {
          initialSelected[appointment.id] = appointment.staffs.map((staff) =>
            String(staff.id)
          )
        } else if (appointment.staff_id) {
          initialSelected[appointment.id] = [String(appointment.staff_id)]
        }
      })

      setSelectedStaff(initialSelected)
      setCurrentPage(1)
    } catch (error) {
      console.error('Fetch appointments error:', error)
      setAppointments([])
      showToast('error', 'Failed to load appointments.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStaffs = async () => {
    try {
      const response = await fetch('/api/staffs', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch staffs.')
      }

      setStaffs(normalizeStaffs(data))
    } catch (error) {
      console.error('Fetch staffs error:', error)
      setStaffs([])
      showToast('error', 'Failed to load staff list.')
    }
  }

  useEffect(() => {
    fetchAppointments()
    fetchStaffs()
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchAppointments()
    }, 10000) // auto-refresh every 10 seconds

    return () => clearInterval(intervalId)
  }, [fetchAppointments])

  const getStatusColor = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return 'bg-amber-100 text-amber-700'
      case 'assigned':
        return 'bg-sky-100 text-sky-700'
      case 'scheduled':
      case 'approved':
        return 'bg-blue-100 text-blue-700'
      case 'in_progress':
      case 'in progress':
        return 'bg-violet-100 text-violet-700'
      case 'completed':
        return 'bg-emerald-100 text-emerald-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'completed':
        return <CheckCircle2 size={12} />
      case 'cancelled':
        return <AlertCircle size={12} />
      case 'assigned':
      case 'scheduled':
      case 'approved':
        return <CalendarDays size={12} />
      case 'in_progress':
      case 'in progress':
        return <Clock3 size={12} />
      default:
        return <Clock3 size={12} />
    }
  }

  const formatDateTime = (date?: string, time?: string) => {
    if (!date && !time) return '-'
    return `${date || ''} ${time || ''}`.trim()
  }

  const getCustomerDisplay = (appointment: Appointment) => {
    if (appointment.customer_name) return appointment.customer_name
    if (appointment.user?.name) return appointment.user.name
    return 'Guest User'
  }

  const getAssignedStaffName = (appointment: Appointment) => {
    if (appointment.staff_names && appointment.staff_names.length > 0) {
      return appointment.staff_names.join(', ')
    }

    if (appointment.staffs && appointment.staffs.length > 0) {
      return appointment.staffs
        .map((staff) => staff.name)
        .filter(Boolean)
        .join(', ')
    }

    return appointment.staff_name || appointment.staff?.name || null
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      setUpdatingId(id)

      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update appointment.')
      }

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === id
            ? {
                ...appointment,
                status: data?.booking?.status ?? data?.status ?? status,
                staff_names:
                  data?.booking?.staff_names ?? appointment.staff_names,
              }
            : appointment
        )
      )

      showToast('success', 'Appointment status updated successfully.')
    } catch (error) {
      console.error('Update status error:', error)
      showToast('error', 'Failed to update appointment status.')
    } finally {
      setUpdatingId(null)
    }
  }

  const assignTeam = async (appointmentId: number) => {
    const staffIds = selectedStaff[appointmentId] || []

    if (!staffIds.length) {
      showToast('error', 'Please select at least one team member.')
      return
    }

    try {
      setAssigningId(appointmentId)

      const response = await fetch(`/api/bookings/${appointmentId}/assign-staff`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_ids: staffIds.map((id) => Number(id)),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to assign team.')
      }

      const assignedStaffs = staffs.filter((staff) =>
        staffIds.map(Number).includes(Number(staff.id))
      )

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                staff_id: assignedStaffs[0]?.id ?? appointment.staff_id,
                staff_name: assignedStaffs[0]?.name ?? appointment.staff_name,
                staff_names:
                  data?.booking?.staff_names ||
                  assignedStaffs.map((staff) => staff.name),
                staffs: assignedStaffs.map((staff) => ({
                  id: staff.id,
                  name: staff.name,
                  email: staff.email,
                })),
                status:
                  data?.booking?.status ||
                  data?.status ||
                  (appointment.status === 'pending'
                    ? 'assigned'
                    : appointment.status),
              }
            : appointment
        )
      )

      showToast('success', 'Team assigned successfully.')
    } catch (error) {
      console.error('Assign team error:', error)
      showToast('error', 'Failed to assign team.')
    } finally {
      setAssigningId(null)
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this appointment?'
    )

    if (!confirmed) return

    try {
      setDeletingId(id)

      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to delete appointment.')
      }

      setAppointments((prev) => {
        const updated = prev.filter((appointment) => appointment.id !== id)
        const newTotalPages = Math.max(1, Math.ceil(updated.length / ITEMS_PER_PAGE))
        if (currentPage > newTotalPages) {
          setCurrentPage(newTotalPages)
        }
        return updated
      })

      showToast('success', 'Appointment deleted successfully.')
    } catch (error) {
      console.error('Delete appointment error:', error)
      showToast('error', 'Failed to delete appointment.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (appointment: Appointment) => {
    const current = (appointment.status || '').toLowerCase()

    let nextStatus = 'pending'

    if (current === 'pending') nextStatus = 'assigned'
    else if (current === 'assigned') nextStatus = 'in_progress'
    else if (current === 'in_progress') nextStatus = 'completed'
    else nextStatus = 'pending'

    updateStatus(appointment.id, nextStatus)
  }

  const totalPages = Math.max(1, Math.ceil(appointments.length / ITEMS_PER_PAGE))

  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return appointments.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [appointments, currentPage])

  const startEntry =
    appointments.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endEntry = Math.min(currentPage * ITEMS_PER_PAGE, appointments.length)

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      {toast.show && (
        <div className="fixed right-6 top-6 z-50">
          <div
            className={`flex min-w-[320px] items-start gap-3 rounded-2xl border bg-white px-4 py-4 shadow-2xl ${
              toast.type === 'success'
                ? 'border-emerald-200 text-emerald-700'
                : 'border-red-200 text-red-700'
            }`}
          >
            <div className="mt-0.5">
              {toast.type === 'success' ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold">
                {toast.type === 'success' ? 'Success' : 'Error'}
              </p>
              <p className="mt-1 text-sm">{toast.message}</p>
            </div>

            <button
              type="button"
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen md:ml-64">
        <header className="border-b border-slate-200 bg-white px-4 py-6 md:px-8">
          <div className="flex items-center gap-3">
            <CalendarDays className="text-emerald-600" size={26} />
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Appointments
            </h1>
          </div>
        </header>

        <main className="p-4 md:p-8">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Appointments
              </h2>
              <p className="text-slate-500">
                Manage customer appointments, schedules, and assign teams
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1450px]">
                  <thead className="bg-emerald-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          Full Name
                        </div>
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <Wrench size={16} />
                          Service
                        </div>
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={16} />
                          Date
                        </div>
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          Address
                        </div>
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <FileText size={16} />
                          Notes
                        </div>
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          Assigned Team
                        </div>
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Assign Team
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-10 text-center text-slate-500"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 size={18} className="animate-spin" />
                            Loading appointments...
                          </div>
                        </td>
                      </tr>
                    ) : appointments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-10 text-center text-slate-500"
                        >
                          No appointments found.
                        </td>
                      </tr>
                    ) : (
                      paginatedAppointments.map((appointment) => (
                        <tr
                          key={appointment.id}
                          className="border-t border-slate-200 transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {getCustomerDisplay(appointment)}
                          </td>

                          <td className="px-6 py-4 text-slate-700">
                            {appointment.service_title ||
                              appointment.service?.title ||
                              'N/A'}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-slate-700">
                            {formatDateTime(
                              appointment.booking_date,
                              appointment.booking_time
                            )}
                          </td>

                          <td className="max-w-[220px] px-6 py-4 text-slate-700">
                            <p
                              className="truncate"
                              title={appointment.address || ''}
                            >
                              {appointment.address || 'N/A'}
                            </p>
                          </td>

                          <td className="max-w-[260px] px-6 py-4 text-slate-700">
                            <p
                              className="truncate"
                              title={appointment.notes || ''}
                            >
                              {appointment.notes || 'No notes'}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                                appointment.status
                              )}`}
                            >
                              {getStatusIcon(appointment.status)}
                              {appointment.status || 'Unknown'}
                            </span>
                          </td>

                          <td className="max-w-[260px] px-6 py-4 text-slate-700">
                            {getAssignedStaffName(appointment) ? (
                              <span
                                className="inline-block rounded-xl bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700"
                                title={getAssignedStaffName(appointment) || ''}
                              >
                                {getAssignedStaffName(appointment)}
                              </span>
                            ) : (
                              <span className="text-sm text-slate-400">
                                Not assigned
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex min-w-[280px] flex-col gap-2">
                              <select
                                multiple
                                value={selectedStaff[appointment.id] ?? []}
                                onChange={(e) => {
                                  const values = Array.from(
                                    e.target.selectedOptions,
                                    (option) => option.value
                                  )
                                  setSelectedStaff((prev) => ({
                                    ...prev,
                                    [appointment.id]: values,
                                  }))
                                }}
                                disabled={
                                  assigningId === appointment.id ||
                                  updatingId === appointment.id ||
                                  deletingId === appointment.id
                                }
                                className="min-h-[110px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                              >
                                {staffs.map((staff) => (
                                  <option key={staff.id} value={staff.id}>
                                    {staff.name}
                                    {staff.job_type
                                      ? ` - ${staff.job_type}`
                                      : ''}
                                  </option>
                                ))}
                              </select>

                              <p className="text-xs text-slate-400">
                                Hold Ctrl or Cmd to select multiple team members.
                              </p>

                              <button
                                onClick={() => assignTeam(appointment.id)}
                                disabled={
                                  assigningId === appointment.id ||
                                  updatingId === appointment.id ||
                                  deletingId === appointment.id
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Assign Team"
                              >
                                {assigningId === appointment.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Send size={16} />
                                )}
                                Assign Team
                              </button>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(appointment)}
                                disabled={
                                  updatingId === appointment.id ||
                                  deletingId === appointment.id ||
                                  assigningId === appointment.id
                                }
                                className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Change Status"
                              >
                                {updatingId === appointment.id ? (
                                  <Loader2 size={18} className="animate-spin" />
                                ) : (
                                  <Pencil size={18} />
                                )}
                              </button>

                              <button
                                onClick={() => handleDelete(appointment.id)}
                                disabled={
                                  updatingId === appointment.id ||
                                  deletingId === appointment.id ||
                                  assigningId === appointment.id
                                }
                                className="rounded-lg p-2 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Delete Appointment"
                              >
                                {deletingId === appointment.id ? (
                                  <Loader2 size={18} className="animate-spin" />
                                ) : (
                                  <Trash2 size={18} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {!loading && appointments.length > 0 && (
                <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-slate-500">
                    Showing <span className="font-semibold">{startEntry}</span> to{' '}
                    <span className="font-semibold">{endEntry}</span> of{' '}
                    <span className="font-semibold">{appointments.length}</span>{' '}
                    appointments
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>

                    <div className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                      Page {currentPage} of {totalPages}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Appointments