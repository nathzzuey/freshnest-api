import React from 'react'

interface TableProps<T extends { id?: number | string }> {
  columns: string[]
  data: T[]
  actions?: (row: T) => React.ReactNode
}

const Table = <T extends { id?: number | string }>({
  columns,
  data,
  actions,
}: TableProps<T>) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-200/50 bg-white/80 shadow-xl backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-emerald-200">
          <thead className="bg-emerald-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-emerald-900"
                >
                  {column.replace(/_/g, ' ')}
                </th>
              ))}

              {actions && (
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-emerald-100 bg-white">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id ?? rowIndex}
                  className="transition-colors hover:bg-emerald-50/50"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 align-middle text-sm font-medium text-slate-900"
                    >
                      {row[column as keyof T] !== undefined &&
                      row[column as keyof T] !== null
                        ? (row[column as keyof T] as React.ReactNode)
                        : '-'}
                    </td>
                  ))}

                  {actions && (
                    <td className="px-6 py-4 text-right align-middle text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-12 text-center"
                >
                  <div className="mb-2 text-lg text-slate-400">📭</div>
                  <p className="text-slate-500">No data available</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Table