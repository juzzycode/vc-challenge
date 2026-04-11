'use client'

import { useState, useEffect, useCallback } from 'react'

type MaintenanceItem = {
  id: string
  name: string
  lastCompleted: string | null
  frequencyDays: number
  notes: string | null
  nextDue: string | null
  overdue: boolean
  dueWithinWeek: boolean
}

type FormData = {
  name: string
  lastCompleted: string
  frequencyDays: string
  notes: string
}

const emptyForm: FormData = { name: '', lastCompleted: '', frequencyDays: '30', notes: '' }

const formatDate = (d: string | null) => {
  if (!d) return 'Never'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const getDaysUntil = (d: string | null) => {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

const FREQUENCY_PRESETS = [
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
  { label: '3 months', days: 90 },
  { label: '6 months', days: 180 },
  { label: '1 year', days: 365 },
]

export default function MaintenancePage() {
  const [items, setItems] = useState<MaintenanceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<FormData>(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/maintenance?status=${filter === 'all' ? '' : filter}`)
      const data = await res.json()
      setItems(data.items ?? [])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchItems() }, [fetchItems])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const url = editId ? `/api/maintenance/${editId}` : '/api/maintenance'
      const method = editId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          lastCompleted: formData.lastCompleted || null,
          frequencyDays: parseInt(formData.frequencyDays),
          notes: formData.notes || null,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to save')
        return
      }
      cancelForm()
      fetchItems()
    } finally {
      setSaving(false)
    }
  }

  async function markDone(id: string) {
    await fetch(`/api/maintenance/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markDoneNow: true }),
    })
    fetchItems()
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this maintenance item?')) return
    await fetch(`/api/maintenance/${id}`, { method: 'DELETE' })
    fetchItems()
  }

  function startEdit(item: MaintenanceItem) {
    setEditId(item.id)
    setFormData({
      name: item.name,
      lastCompleted: item.lastCompleted ? item.lastCompleted.substring(0, 10) : '',
      frequencyDays: String(item.frequencyDays),
      notes: item.notes ?? '',
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">🔧 Home Maintenance</h1>
        <button className="btn-primary" onClick={() => { cancelForm(); setShowForm(true) }}>
          + New Item
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card">
          <h2 className="font-semibold mb-4">{editId ? 'Edit Item' : 'New Maintenance Item'}</h2>
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Task Name *</label>
              <input
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. Change air filter"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Last Completed</label>
                <input
                  type="date"
                  className="input"
                  value={formData.lastCompleted}
                  onChange={(e) => setFormData({ ...formData, lastCompleted: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Frequency (days) *</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={formData.frequencyDays}
                  onChange={(e) => setFormData({ ...formData, frequencyDays: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {FREQUENCY_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.days}
                  onClick={() => setFormData({ ...formData, frequencyDays: String(p.days) })}
                  className={`btn btn-sm ${
                    formData.frequencyDays === String(p.days)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea
                className="input resize-none"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : editId ? 'Update' : 'Add Item'}
              </button>
              <button type="button" onClick={cancelForm} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1">
        {[
          { value: 'all', label: 'All' },
          { value: 'overdue', label: 'Overdue' },
          { value: 'upcoming', label: 'Due Soon' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`btn btn-sm ${
              filter === f.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Item list */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">🔧</p>
          <p>No maintenance items found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const daysUntil = getDaysUntil(item.nextDue)
            return (
              <div
                key={item.id}
                className={`card border-l-4 ${
                  item.overdue ? 'border-l-red-500' : item.dueWithinWeek ? 'border-l-yellow-400' : 'border-l-green-400'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      {item.overdue && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Overdue</span>
                      )}
                      {!item.overdue && item.dueWithinWeek && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Due Soon</span>
                      )}
                    </div>
                    {item.notes && <p className="text-sm text-gray-500 mt-0.5">{item.notes}</p>}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      <span>Last done: {formatDate(item.lastCompleted)}</span>
                      <span>Every {item.frequencyDays} days</span>
                      {item.nextDue && (
                        <span className={item.overdue ? 'text-red-500' : ''}>
                          Next due: {formatDate(item.nextDue)}
                          {daysUntil !== null && !item.overdue && ` (in ${daysUntil}d)`}
                          {daysUntil !== null && item.overdue && ` (${Math.abs(daysUntil)}d ago)`}
                        </span>
                      )}
                      {!item.nextDue && item.overdue && (
                        <span className="text-red-500">Never completed — needs attention</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => markDone(item.id)} className="btn-success btn-sm" title="Mark done today">
                      ✓ Done
                    </button>
                    <button onClick={() => startEdit(item)} className="btn-secondary btn-sm">✏️</button>
                    <button onClick={() => deleteItem(item.id)} className="btn-danger btn-sm">🗑️</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
