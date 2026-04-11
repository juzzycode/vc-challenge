import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const now = new Date()
  const startOfDay = new Date(now.toDateString())
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)
  const in7Days = new Date(now)
  in7Days.setDate(in7Days.getDate() + 7)

  const [todayTasks, overdueTasks, upcomingBills, overdueBills] = await Promise.all([
    prisma.task.findMany({
      where: { userId: session.userId, completed: false, dueDate: { gte: startOfDay, lt: endOfDay } },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.task.findMany({
      where: { userId: session.userId, completed: false, dueDate: { lt: startOfDay } },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),
    prisma.bill.findMany({
      where: { userId: session.userId, paid: false, dueDate: { gte: now, lte: in7Days } },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.bill.findMany({
      where: { userId: session.userId, paid: false, dueDate: { lt: now } },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">✅ Today&apos;s Tasks</h2>
            <Link href="/tasks?filter=today" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {todayTasks.length === 0 ? (
            <p className="text-sm text-gray-500">No tasks due today.</p>
          ) : (
            <ul className="space-y-2">
              {todayTasks.map((task) => (
                <li key={task.id} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">○</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{task.name}</p>
                    {task.description && (
                      <p className="text-xs text-gray-500">{task.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              ⚠️ Overdue Tasks
              {overdueTasks.length > 0 && (
                <span className="ml-2 text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5">
                  {overdueTasks.length}
                </span>
              )}
            </h2>
            <Link href="/tasks?filter=overdue" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {overdueTasks.length === 0 ? (
            <p className="text-sm text-gray-500">No overdue tasks.</p>
          ) : (
            <ul className="space-y-2">
              {overdueTasks.map((task) => (
                <li key={task.id} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">!</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{task.name}</p>
                    <p className="text-xs text-red-500">Due {formatDate(task.dueDate)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming Bills */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">💳 Upcoming Bills (7 days)</h2>
            <Link href="/bills" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {upcomingBills.length === 0 ? (
            <p className="text-sm text-gray-500">No bills due in the next 7 days.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingBills.map((bill) => (
                <li key={bill.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{bill.name}</p>
                    <p className="text-xs text-gray-500">Due {formatDate(bill.dueDate)}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {formatCurrency(bill.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Overdue Bills */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              🚨 Overdue Bills
              {overdueBills.length > 0 && (
                <span className="ml-2 text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5">
                  {overdueBills.length}
                </span>
              )}
            </h2>
            <Link href="/bills?filter=overdue" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {overdueBills.length === 0 ? (
            <p className="text-sm text-gray-500">No overdue bills.</p>
          ) : (
            <ul className="space-y-2">
              {overdueBills.map((bill) => (
                <li key={bill.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{bill.name}</p>
                    <p className="text-xs text-red-500">Due {formatDate(bill.dueDate)}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-600">
                    {formatCurrency(bill.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/tasks', label: 'Tasks', icon: '✅', color: 'bg-green-50 hover:bg-green-100 text-green-700' },
          { href: '/groceries', label: 'Groceries', icon: '🛒', color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700' },
          { href: '/bills', label: 'Bills', icon: '💳', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
          { href: '/maintenance', label: 'Maintenance', icon: '🔧', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${item.color} rounded-xl p-4 text-center font-medium transition-colors`}
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-sm">{item.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
