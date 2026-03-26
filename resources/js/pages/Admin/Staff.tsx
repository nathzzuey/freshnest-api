import React, { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Table from '../../components/Table'
import { router, useForm } from '@inertiajs/react'
import { Pencil, Trash2, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface StaffMember {
  id: number
  name: string
  role: string
  email: string
  phone: string
  status: string
}

interface StaffPageProps {
  staff: StaffMember[]
}

interface StaffFormData {
  name: string
  email: string
  role: string
  phone: string
  password: string
  password_confirmation: string
  _method?: string
}

interface ToastState {
  show: boolean
  type: 'success' | 'error'
  message: string
}

const initialForm: StaffFormData = {
  name: '',
  email: '',
  role: '',
  phone: '',
  password: '',
  password_confirmation: '',
}

const Staff = ({ staff = [] }: StaffPageProps) => {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: 'success',
    message: '',
  })

  const columns = ['name', 'role', 'email', 'phone', 'status']

  const { data, setData, post, processing, reset, errors, clearErrors } =
    useForm<StaffFormData>(initialForm)

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

  const resetForm = () => {
    reset()
    clearErrors()
    setEditingId(null)
    setSubmitting(false)
  }

  const handleEdit = (row: StaffMember) => {
    clearErrors()
    setData({
      name: row.name,
      email: row.email,
      role: row.role,
      phone: row.phone,
      password: '',
      password_confirmation: '',
    })
    setEditingId(row.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    if (editingId) {
      router.post(
        `/admin/staff/${editingId}`,
        {
          ...data,
          _method: 'PUT',
        },
        {
          preserveScroll: true,
          onSuccess: () => {
            resetForm()
            showToast('success', 'Staff account updated successfully.')
          },
          onError: () => {
            setSubmitting(false)
            showToast('error', 'Failed to update staff account.')
          },
          onFinish: () => {
            setSubmitting(false)
          },
        },
      )
      return
    }

    post('/admin/staff', {
      preserveScroll: true,
      onSuccess: () => {
        resetForm()
        showToast('success', 'Staff account added successfully.')
      },
      onError: () => {
        setSubmitting(false)
        showToast('error', 'Failed to add staff account.')
      },
      onFinish: () => {
        setSubmitting(false)
      },
    })
  }

  const removeStaff = (id: number) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return

    setDeletingId(id)

    router.post(
      `/admin/staff/${id}`,
      {
        _method: 'DELETE',
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          showToast('success', 'Staff account removed successfully.')
        },
        onError: () => {
          showToast('error', 'Failed to remove staff account.')
        },
        onFinish: () => {
          setDeletingId(null)
        },
      },
    )
  }

  const actions = (row: StaffMember) => (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => handleEdit(row)}
        disabled={submitting || deletingId === row.id}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-emerald-600 transition-all hover:bg-emerald-100 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Pencil size={16} />
        Edit
      </button>

      <button
        type="button"
        onClick={() => removeStaff(row.id)}
        disabled={deletingId === row.id || submitting}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {deletingId === row.id ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Removing...
          </>
        ) : (
          <>
            <Trash2 size={16} />
            Remove
          </>
        )}
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      {toast.show && (
        <div className="fixed right-6 top-6 z-50">
          <div
            className={`flex min-w-[320px] items-start gap-3 rounded-2xl border px-4 py-4 shadow-2xl backdrop-blur-md ${
              toast.type === 'success'
                ? 'border-emerald-200 bg-white text-emerald-700'
                : 'border-red-200 bg-white text-red-700'
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
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="ml-64 min-h-screen">
        <header className="border-b border-slate-200 bg-white px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Team Management</h1>
          <p className="mt-1 text-slate-500">
            Create and manage service staff accounts
          </p>
        </header>

        <main className="p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="sticky top-8 rounded-2xl border border-emerald-200/50 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingId ? 'Edit Team Account' : 'Add New Team Account'}
                  </h3>

                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={submitting}
                      className="rounded-lg p-2 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter full name"
                      required
                      disabled={submitting}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter email address"
                      required
                      disabled={submitting}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Role
                      </label>
                      <select
                        value={data.role}
                        onChange={(e) => setData('role', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                        required
                        disabled={submitting}
                      >
                        <option value="">Select Role</option>
                        <option value="Cleaner">Cleaner</option>
                        <option value="Plumber">Plumber</option>
                        <option value="Repairer">Repairer</option>
                        <option value="Painter">Painter</option>
                      </select>
                      {errors.role && (
                        <p className="mt-1 text-sm text-red-500">{errors.role}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                        placeholder="Phone number"
                        required
                        disabled={submitting}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {editingId ? 'New Password (Optional)' : 'Password'}
                    </label>
                    <input
                      type="password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                      placeholder={
                        editingId
                          ? 'Leave blank to keep current password'
                          : 'Enter password'
                      }
                      required={!editingId}
                      disabled={submitting}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {editingId ? 'Confirm New Password' : 'Confirm Password'}
                    </label>
                    <input
                      type="password"
                      value={data.password_confirmation}
                      onChange={(e) =>
                        setData('password_confirmation', e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                      placeholder={
                        editingId ? 'Confirm new password' : 'Confirm password'
                      }
                      required={!editingId && !!data.password}
                      disabled={submitting}
                    />
                    {errors.password_confirmation && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.password_confirmation}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={processing || submitting}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          {editingId ? 'Updating...' : 'Adding...'}
                        </>
                      ) : editingId ? (
                        'Update Staff'
                      ) : (
                        'Add Staff'
                      )}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        disabled={submitting}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900">Team Accounts</h2>
                <p className="mt-1 text-slate-500">Manage your service team</p>
              </div>

              <Table<StaffMember>
                columns={columns}
                data={staff}
                actions={actions}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Staff