import React, { useEffect, useMemo, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { router, useForm } from '@inertiajs/react'
import {
  Pencil,
  Trash2,
  Plus,
  X,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface ServiceItem {
  id: number
  title: string
  category: string
  description: string
  price: string | number
  image?: string | null
  image_url?: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

interface PageProps {
  services: ServiceItem[]
}

interface ServiceFormData {
  title: string
  category: string
  description: string
  price: string
  image: File | null
  _method?: string
}

const defaultForm: ServiceFormData = {
  title: '',
  category: '',
  description: '',
  price: '',
  image: null,
}

const ITEMS_PER_PAGE = 5

const Services = ({ services = [] }: PageProps) => {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const { data, setData, post, processing, errors, reset, clearErrors } =
    useForm<ServiceFormData>(defaultForm)

  const isEditing = useMemo(() => editingId !== null, [editingId])

  useEffect(() => {
    if (!data.image) {
      setPreviewUrl('')
      return
    }

    const objectUrl = URL.createObjectURL(data.image)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [data.image])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(services.length / ITEMS_PER_PAGE))
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [services, currentPage])

  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return services.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [services, currentPage])

  const totalPages = Math.max(1, Math.ceil(services.length / ITEMS_PER_PAGE))
  const startEntry = services.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endEntry = Math.min(currentPage * ITEMS_PER_PAGE, services.length)

  const openAddModal = () => {
    setEditingId(null)
    setCurrentImageUrl('')
    setPreviewUrl('')
    clearErrors()
    reset()
    setModalOpen(true)
  }

  const openEditModal = (service: ServiceItem) => {
    setEditingId(service.id)
    setCurrentImageUrl(service.image_url || service.image || '')
    setPreviewUrl('')
    clearErrors()
    setData({
      title: service.title ?? '',
      category: service.category ?? '',
      description: service.description ?? '',
      price: String(service.price ?? ''),
      image: null,
      _method: 'PUT',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setCurrentImageUrl('')
    setPreviewUrl('')
    clearErrors()
    reset()
  }

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isEditing && editingId !== null) {
      router.post(
        `/admin/services/${editingId}`,
        {
          ...data,
          _method: 'PUT',
        },
        {
          preserveScroll: true,
          forceFormData: true,
          onSuccess: () => closeModal(),
        }
      )
      return
    }

    post('/admin/services', {
      preserveScroll: true,
      forceFormData: true,
      onSuccess: () => closeModal(),
    })
  }

  const handleDelete = (service: ServiceItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${service.title}"?`
    )

    if (!confirmed) return

    router.post(
      `/admin/services/${service.id}`,
      {
        _method: 'DELETE',
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          if (editingId === service.id) {
            closeModal()
          }
        },
        onError: (deleteErrors) => {
          console.error('Delete failed:', deleteErrors)
        },
      }
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-64 min-h-screen">
        <header className="border-b border-slate-200 bg-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Services</h1>
              <p className="mt-1 text-slate-500">Manage cleaning services</p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-emerald-700"
            >
              <Plus size={18} />
              Add Service
            </button>
          </div>
        </header>

        <main className="p-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            {services.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                          Image
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                          Title
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                          Description
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                          Price
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedServices.map((service) => (
                        <tr
                          key={service.id}
                          className="border-t border-slate-200 align-top"
                        >
                          <td className="px-6 py-4">
                            {service.image_url ? (
                              <img
                                src={service.image_url}
                                alt={service.title}
                                className="h-14 w-14 rounded-lg border border-slate-200 object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-400">
                                <ImageIcon size={18} />
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4 font-medium text-slate-900">
                            {service.title}
                          </td>

                          <td className="px-6 py-4 text-slate-700">
                            {service.category}
                          </td>

                          <td className="max-w-xs px-6 py-4 text-slate-700">
                            <p className="line-clamp-2">{service.description}</p>
                          </td>

                          <td className="px-6 py-4 font-semibold text-emerald-600">
                            ₱{Number(service.price || 0).toFixed(2)}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                service.is_active
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {service.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(service)}
                                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-100 hover:text-emerald-800"
                              >
                                <Pencil size={16} />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(service)}
                                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 hover:text-red-800"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-slate-500">
                    Showing <span className="font-semibold">{startEntry}</span> to{' '}
                    <span className="font-semibold">{endEntry}</span> of{' '}
                    <span className="font-semibold">{services.length}</span> services
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
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
                      type="button"
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
              </>
            ) : (
              <div className="py-10 text-center">
                <p className="text-slate-500">No services found yet.</p>
              </div>
            )}
          </div>
        </main>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-white px-6 py-4">
                <h3 className="text-xl font-bold text-slate-900">
                  {isEditing ? 'Edit Service' : 'Add New Service'}
                </h3>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={submit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Service Title
                    </label>
                    <input
                      type="text"
                      value={data.title}
                      onChange={(e) => setData('title', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                      placeholder="Deep Clean"
                      required
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Category
                    </label>
                    <select
                      value={data.category}
                      onChange={(e) => setData('category', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Painting">Painting</option>
                      <option value="Repairing">Repairing</option>
                      <option value="Plumbing">Plumbing</option>
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Description
                    </label>
                    <textarea
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter service description"
                      rows={4}
                      required
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={data.price}
                      onChange={(e) => setData('price', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                      placeholder="89.00"
                      required
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Service Image
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setData('image', e.target.files?.[0] ?? null)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                    />

                    {(previewUrl || (isEditing && currentImageUrl)) && (
                      <div className="mt-3">
                        <p className="mb-2 text-xs text-slate-500">
                          {previewUrl ? 'Selected image preview' : 'Current image'}
                        </p>
                        <img
                          src={previewUrl || currentImageUrl}
                          alt="Service preview"
                          className="h-24 w-24 rounded-xl border border-slate-200 object-cover"
                        />
                      </div>
                    )}

                    {data.image && (
                      <p className="mt-2 text-xs text-slate-500">
                        Selected: {data.image.name}
                      </p>
                    )}

                    {errors.image && (
                      <p className="mt-1 text-sm text-red-500">{errors.image}</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={processing}
                      className="flex-1 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {processing
                        ? isEditing
                          ? 'Updating...'
                          : 'Adding...'
                        : isEditing
                          ? 'Update Service'
                          : 'Add Service'}
                    </button>

                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 rounded-xl bg-slate-200 px-6 py-3 font-semibold text-slate-800 transition-all hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Services