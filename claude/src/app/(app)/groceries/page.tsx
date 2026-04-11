'use client'

import { useState, useEffect, useCallback } from 'react'

type GroceryItem = {
  id: string
  name: string
  category: string
  purchased: boolean
}

const CATEGORIES = [
  { value: 'produce', label: '🥦 Produce' },
  { value: 'meat', label: '🥩 Meat' },
  { value: 'dairy', label: '🥛 Dairy' },
  { value: 'bakery', label: '🍞 Bakery' },
  { value: 'frozen', label: '🧊 Frozen' },
  { value: 'pantry', label: '🥫 Pantry' },
  { value: 'beverages', label: '🥤 Beverages' },
  { value: 'snacks', label: '🍿 Snacks' },
  { value: 'household', label: '🧹 Household' },
  { value: 'personal', label: '🧴 Personal' },
  { value: 'other', label: '📦 Other' },
]

const getCategoryLabel = (value: string) =>
  CATEGORIES.find((c) => c.value === value)?.label ?? value

export default function GroceriesPage() {
  const [items, setItems] = useState<GroceryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('other')
  const [filterCategory, setFilterCategory] = useState('')
  const [showPurchased, setShowPurchased] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterCategory) params.set('category', filterCategory)
      if (!showPurchased) params.set('status', 'active')
      const res = await fetch(`/api/groceries?${params}`)
      const data = await res.json()
      setItems(data.items ?? [])
    } finally {
      setLoading(false)
    }
  }, [filterCategory, showPurchased])

  useEffect(() => { fetchItems() }, [fetchItems])

  async function addItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setAdding(true)
    setError('')
    try {
      const res = await fetch('/api/groceries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), category: newCategory }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to add')
        return
      }
      setNewName('')
      fetchItems()
    } finally {
      setAdding(false)
    }
  }

  async function togglePurchased(item: GroceryItem) {
    await fetch(`/api/groceries/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchased: !item.purchased }),
    })
    fetchItems()
  }

  async function deleteItem(id: string) {
    await fetch(`/api/groceries/${id}`, { method: 'DELETE' })
    fetchItems()
  }

  async function clearPurchased() {
    if (!confirm('Remove all purchased items?')) return
    await fetch('/api/groceries?clearPurchased=true', { method: 'DELETE' })
    fetchItems()
  }

  const grouped = items.reduce<Record<string, GroceryItem[]>>((acc, item) => {
    acc[item.category] = acc[item.category] ?? []
    acc[item.category].push(item)
    return acc
  }, {})

  const purchasedCount = items.filter((i) => i.purchased).length
  const totalCount = items.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">🛒 Grocery List</h1>
        <div className="text-sm text-gray-500">{purchasedCount}/{totalCount} purchased</div>
      </div>

      {/* Add item form */}
      <div className="card">
        <form onSubmit={addItem} className="flex gap-2 flex-wrap">
          <input
            className="input flex-1 min-w-40"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Add item..."
            required
          />
          <select
            className="input w-auto"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <button type="submit" disabled={adding} className="btn-primary">
            {adding ? '...' : '+ Add'}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          className="input w-auto text-sm"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showPurchased}
            onChange={(e) => setShowPurchased(e.target.checked)}
            className="rounded"
          />
          Show purchased
        </label>

        {purchasedCount > 0 && (
          <button onClick={clearPurchased} className="btn-danger btn-sm ml-auto">
            Clear purchased ({purchasedCount})
          </button>
        )}
      </div>

      {/* Item list */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">🛒</p>
          <p>Your grocery list is empty.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, categoryItems]) => (
            <div key={category} className="card">
              <h3 className="font-medium text-gray-700 mb-3">
                {getCategoryLabel(category)}
                <span className="ml-2 text-xs text-gray-400">
                  ({categoryItems.filter((i) => !i.purchased).length} remaining)
                </span>
              </h3>
              <ul className="space-y-2">
                {categoryItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.purchased}
                      onChange={() => togglePurchased(item)}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <span className={`flex-1 text-sm ${item.purchased ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {item.name}
                    </span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-gray-300 hover:text-red-500 text-sm transition-colors"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
