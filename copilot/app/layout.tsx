import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Household Command Center',
  description: 'Manage daily life: chores, groceries, bills, and home maintenance.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}