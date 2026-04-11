'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

type Bill = {
  id: string
  name: string
  amount: number
  dueDate: string
  recurring: boolean
  paid: boolean
  paidAt: string | null
}

type BillFormData = {
  name: string
  amount: string
  dueDate: string
  recurring: boolean
}

const emptyForm: BillFormData = { name: '', amount: '', dueDate: '', recurring: false }

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const isOverdue = (d: string) => new Date(d) < new Date()

function BillsContent() {
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('filter') ?? 'all'

  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(filterParam)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<BillFormData>(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchBills = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/bills?status=${filter === 'all' ? '' : filter}`)
      const data = await res.json()
      setBills(data.bills ?? [])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchBills() }, [fetchBills])
  useEffect(() => { setFilter(filterParam) }, [filterParam])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const url = editId ? `/api/bills/${editId}` : '/api/bills'
      const method = editId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          amount: parseFloat(formData.amount),
          dueDate: formData.dueDate,
          recurring: formData.recurring,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to save')
        return
      }
      cancelForm()
      fetchBills()
    } finally {
      setSaving(false)
    }
  }

  async function togglePaid(bill: Bill) {
    await fetch(`/api/bills/${bill.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paid: !bill.paid }),
    })
    fetchBills()
  }

  async function deleteBill(id: string) {
    if (!confirm('Delete this bill?')) return
    await fetch(`/api/bills/${id}`, { method: 'DELETE' })
    fetchBills()
  }

  function startEdit(bill: Bill) {
    setEditId(bill.id)
    setFormData({
      name: bill.name,
      amount: String(bill.amount),
      dueDate: bill.dueDate.substring(0, 10),
      recurring: bill.recurring,
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() {
    setShowForm(false)
    setEditId(null)
    setFormData(emptyForm)
    setError('')
  }

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'upcoming', label: 'Next 7 Days' },
    { value: 'paid', label: 'Paid' },
  ]

  const totalUnpaid = bills.filter((b) => !b.paid).reduce((sum, b) => sum + b.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">💳 Bills</h1>
        <button className="btn-primary" onClick={() => { cancelForm(); setShowForm(true) }}>
          + New Bill
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card">
          <h2 className="font-semibold mb-4">{editId ? 'Edit Bill' : 'New Bill'}</h2>
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">Bill Name *</label>
                <input
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Electric Bill"
                />
              </div>
              <div>
                <label className="label">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="label">Due Date *</label>
                <input
                  type="date"
                  className="input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.recurring}
                onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Recurring monthly (auto-creates next month when paid)</span>
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : editId ? 'Update' : 'Add Bill'}
              </button>
              <button type="button" onClick={cancelForm} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Summary */}
      {totalUnpaid > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800">
            Total unpaid: <span className="font-bold text-lg">{formatCurrency(totalUnpaid)}</span>
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`btn btn-sm whitespace-nowrap ${
              filter === f.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bill list */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : bills.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">💳</p>
          <p>No bills found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bills.map((bill) => (
            <div key={bill.id} className={`card flex items-center gap-4 ${bill.paid ? 'opacity-60' : ''}`}>
              <button
                onClick={() => togglePaid(bill)}
                className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  bill.paid
                    ? 'bg-green-500 border-green-500 text-white'
                    : isOverdue(bill.dueDate) && !bill.paid
                    ? 'border-red-400 hover:border-red-600'
                    : 'border-gray-300 hover:border-green-500'
                }`}
                title={bill.paid ? 'Mark unpaid' : 'Mark paid'}
              >
                {bill.paid && <span className="text-xs">✓</span>}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`font-medium text-gray-800 ${bill.paid ? 'line-through' : ''}`}>
                    {bill.name}
                  </p>
                  {bill.recurring && (
                    <span className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">🔄 recurring</span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 ${
                  bill.paid ? 'text-gray-400' : !bill.paid && isOverdue(bill.dueDate) ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {bill.paid
                    ? `Paid ${bill.paidAt ? formatDate(bill.paidAt) : ''}`
                    : `Due ${formatDate(bill.dueDate)}${isOverdue(bill.dueDate) ? ' — OVERDUE' : ''}`}
                </p>
              </div>

              <span className={`font-bold text-lg flex-shrink-0 ${
                bill.paid ? 'text-gray-400' : !bill.paid && isOverdue(bill.dueDate) ? 'text-red-600' : 'text-gray-800'
              }`}>
                {formatCurrency(bill.amount)}
              </span>

              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(bill)} className="btn-secondary btn-sm">✏️</button>
                <button onClick={() => deleteBill(bill.id)} className="btn-danger btn-sm">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BillsPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-gray-500">Loading...</div>}>
      <BillsContent />
    </Suspense>
  )
}
