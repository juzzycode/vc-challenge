'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

type Task = {
  id: string
  name: string
  description: string | null
  dueDate: string | null
  recurrence: string | null
  completed: boolean
}

type TaskFormData = {
  name: string
  description: string
  dueDate: string
  recurrence: string
}

const emptyForm: TaskFormData = { name: '', description: '', dueDate: '', recurrence: 'none' }

function TasksContent() {
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('filter') ?? 'active'

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(filterParam)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<TaskFormData>(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tasks?status=${filter}`)
      const data = await res.json()
      setTasks(data.tasks ?? [])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchTasks() }, [fetchTasks])
  useEffect(() => { setFilter(filterParam) }, [filterParam])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const url = editId ? `/api/tasks/${editId}` : '/api/tasks'
      const method = editId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to save')
        return
      }
      setFormData(emptyForm)
      setEditId(null)
      setShowForm(false)
      fetchTasks()
    } finally {
      setSaving(false)
    }
  }

  async function toggleComplete(task: Task) {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    })
    fetchTasks()
  }

  async function deleteTask(id: string) {
    if (!confirm('Delete this task?')) return
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    fetchTasks()
  }

  function startEdit(task: Task) {
    setEditId(task.id)
    setFormData({
      name: task.name,
      description: task.description ?? '',
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
      recurrence: task.recurrence ?? 'none',
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

  const isOverdue = (dueDate: string | null) =>
    dueDate && new Date(dueDate) < new Date(new Date().toDateString())

  const formatDate = (d: string | null) => {
    if (!d) return null
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const filters = [
    { value: 'active', label: 'Active' },
    { value: 'today', label: 'Today' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'completed', label: 'Completed' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">✅ Tasks</h1>
        <button className="btn-primary" onClick={() => { cancelForm(); setShowForm(true) }}>
          + New Task
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card">
          <h2 className="font-semibold mb-4">{editId ? 'Edit Task' : 'New Task'}</h2>
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Name *</label>
              <input
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Task name"
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                className="input resize-none"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Due Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Recurrence</label>
                <select
                  className="input"
                  value={formData.recurrence}
                  onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : editId ? 'Update' : 'Add Task'}
              </button>
              <button type="button" onClick={cancelForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
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

      {/* Task list */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">📝</p>
          <p>No tasks found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`card flex items-start gap-3 ${task.completed ? 'opacity-60' : ''}`}
            >
              <button
                onClick={() => toggleComplete(task)}
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors flex items-center justify-center ${
                  task.completed
                    ? 'bg-green-500 border-green-500'
                    : isOverdue(task.dueDate)
                    ? 'border-red-400 hover:border-red-600'
                    : 'border-gray-300 hover:border-blue-500'
                }`}
                title={task.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {task.completed && <span className="text-white text-xs leading-none">✓</span>}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`font-medium text-gray-800 ${task.completed ? 'line-through' : ''}`}>
                  {task.name}
                </p>
                {task.description && (
                  <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-1">
                  {task.dueDate && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.completed
                        ? 'bg-gray-100 text-gray-500'
                        : isOverdue(task.dueDate)
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      📅 {formatDate(task.dueDate)}
                    </span>
                  )}
                  {task.recurrence && task.recurrence !== 'none' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                      🔄 {task.recurrence}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(task)} className="btn-secondary btn-sm" title="Edit">
                  ✏️
                </button>
                <button onClick={() => deleteTask(task.id)} className="btn-danger btn-sm" title="Delete">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-gray-500">Loading...</div>}>
      <TasksContent />
    </Suspense>
  )
}
