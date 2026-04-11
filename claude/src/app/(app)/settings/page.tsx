'use client'

import { useState, useRef } from 'react'

export default function SettingsPage() {
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [importMessage, setImportMessage] = useState('')
  const [exporting, setExporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/export')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `household-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImportStatus('loading')
    setImportMessage('')

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setImportStatus('error')
        setImportMessage(result.error || 'Import failed')
        return
      }

      const { imported } = result
      setImportStatus('success')
      setImportMessage(
        `Imported: ${imported.tasks} tasks, ${imported.groceryItems} grocery items, ${imported.bills} bills, ${imported.maintenanceItems} maintenance items.`
      )
    } catch {
      setImportStatus('error')
      setImportMessage('Invalid file format. Please use a valid JSON export file.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900">⚙️ Settings</h1>

      {/* Export */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-1">📤 Export Data</h2>
        <p className="text-sm text-gray-500 mb-4">
          Download all your data as a JSON file. Use this to back up your data or migrate to another account.
        </p>
        <button onClick={handleExport} disabled={exporting} className="btn-primary">
          {exporting ? 'Exporting...' : '⬇️ Download JSON Export'}
        </button>
      </div>

      {/* Import */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-1">📥 Import Data</h2>
        <p className="text-sm text-gray-500 mb-4">
          Restore data from a previously exported JSON file. This will <strong>add</strong> the imported data to your account (it will not delete existing data).
        </p>

        {importStatus === 'success' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            ✅ {importMessage}
          </div>
        )}
        {importStatus === 'error' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            ❌ {importMessage}
          </div>
        )}

        <label className="btn-secondary cursor-pointer">
          {importStatus === 'loading' ? '⏳ Importing...' : '📁 Choose JSON File'}
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
            disabled={importStatus === 'loading'}
          />
        </label>
      </div>

      {/* About */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-1">ℹ️ About</h2>
        <p className="text-sm text-gray-500">Household Command Center — a local-first app to manage your home.</p>
        <p className="text-sm text-gray-400 mt-1">Data stored locally via SQLite.</p>
      </div>
    </div>
  )
}
