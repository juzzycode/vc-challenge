'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/tasks', label: 'Tasks', icon: '✅' },
  { href: '/groceries', label: 'Groceries', icon: '🛒' },
  { href: '/bills', label: 'Bills', icon: '💳' },
  { href: '/maintenance', label: 'Maintenance', icon: '🔧' },
  { href: '/search', label: 'Search', icon: '🔍' },
]

export default function Nav({ userName }: { userName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/dashboard" className="font-bold text-blue-600 text-lg">
            🏠 HCC
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/settings"
              className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
            >
              {userName}
            </Link>
            <button onClick={handleLogout} className="btn-secondary btn-sm">
              Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  pathname === link.href
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.icon} {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">{userName}</span>
              <button onClick={handleLogout} className="btn-secondary btn-sm">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
