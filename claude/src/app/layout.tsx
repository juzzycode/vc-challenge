import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Household Command Center',
  description: 'Manage your home: chores, groceries, bills, and maintenance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
