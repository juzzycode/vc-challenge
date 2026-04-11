'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

type SearchResults = {
  tasks: Array<{ id: string; name: string; dueDate: string | null; completed: boolean }>
  groceries: Array<{ id: string; name: string; category: string; purchased: boolean }>
  bills: Array<{ id: string; name: string; amount: number; dueDate: string; paid: boolean }>
  maintenance: Array<{ id: string; name: string; frequencyDays: number; lastCompleted: string | null }>
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const formatDate = (d: string | null) => {
  if (!d) return 'N/A'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (debounceTimer) clearTimeout(debounceTimer)
    setDebounceTimer(setTimeout(() => search(val), 300))
  }

  const totalResults = results
    ? results.tasks.length + results.groceries.length + results.bills.length + results.maintenance.length
    : 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">🔍 Search</h1>

      <div className="relative">
        <input
          type="search"
          className="input pl-10 text-base"
          value={query}
          onChange={handleChange}
          placeholder="Search tasks, groceries, bills, maintenance..."
          autoFocus
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      </div>

      {loading && <div className="text-center py-8 text-gray-500">Searching...</div>}

      {!loading && results && (
        <div className="space-y-6">
          <p className="text-sm text-gray-500">
            {totalResults === 0
              ? `No results for "${query}"`
              : `${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`}
          </p>

          {results.tasks.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                ✅ Tasks
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{results.tasks.length}</span>
              </h2>
              <div className="space-y-2">
                {results.tasks.map((task) => (
                  <Link key={task.id} href="/tasks" className="card block hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.name}
                      </span>
                      <div className="flex gap-2 text-xs">
                        {task.completed && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">Done</span>}
                        {task.dueDate && <span className="text-gray-500">{formatDate(task.dueDate)}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.groceries.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                🛒 Groceries
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{results.groceries.length}</span>
              </h2>
              <div className="space-y-2">
                {results.groceries.map((item) => (
                  <Link key={item.id} href="/groceries" className="card block hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium text-sm ${item.purchased ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {item.name}
                      </span>
                      <div className="flex gap-2 text-xs">
                        <span className="text-gray-500 capitalize">{item.category}</span>
                        {item.purchased && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">Purchased</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.bills.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                💳 Bills
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{results.bills.length}</span>
              </h2>
              <div className="space-y-2">
                {results.bills.map((bill) => (
                  <Link key={bill.id} href="/bills" className="card block hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium text-sm ${bill.paid ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {bill.name}
                      </span>
                      <div className="flex gap-2 items-center text-xs">
                        <span className="font-semibold text-sm">{formatCurrency(bill.amount)}</span>
                        <span className="text-gray-500">{formatDate(bill.dueDate)}</span>
                        {bill.paid && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">Paid</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.maintenance.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                🔧 Maintenance
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{results.maintenance.length}</span>
              </h2>
              <div className="space-y-2">
                {results.maintenance.map((item) => (
                  <Link key={item.id} href="/maintenance" className="card block hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-800">{item.name}</span>
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span>Every {item.frequencyDays}d</span>
                        <span>Last: {formatDate(item.lastCompleted)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && !results && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">🔍</p>
          <p>Start typing to search across all your data</p>
        </div>
      )}
    </div>
  )
}
