import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

// Initialize Prisma Client globally to avoid re-instantiation on every request
const prisma = new PrismaClient();

interface UserCardProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
}

/**
 * Component to display a single user card.
 */
const UserCard: React.FC<UserCardProps> = ({ user }) => (
  <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl flex flex-col justify-between h-full">
    <div>
      <h3 className="text-2xl font-bold text-indigo-700 mb-2">{user.name || 'New User'}</h3>
      <p className="text-gray-600 mb-4">{user.email}</p>
    </div>
    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
      <span className="text-sm font-medium text-indigo-500">User Profile</span>
      <Link href={`/user/${user.id}`} className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition duration-150 shadow-md">
        View Details &rarr;
      </Link>
    </div>
  </div>
);

/**
 * Main Dashboard Page Component.
 */
export default async function HomePage() {
  // Fetch all users from the database to prove persistence and connection
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      {/* Header Section */}
      <header className="text-center mb-12 pt-6">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
          🏠 Household Command Center
        </h1>
        <p className="text-xl text-indigo-600 font-medium">Your daily life, organized.</p>
      </header>

      {/* Quick Stats / Dashboard Summary (Placeholder for now) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard title="Total Users" value={users.length} color="bg-blue-500" />
        <StatCard title="Tasks Due Today" value="4" color="bg-amber-500" /> {/* Placeholder */}
        <StatCard title="Bills Upcoming (7d)" value="2" color="bg-red-500" /> {/* Placeholder */}
      </div>

      {/* Main Content Area: User List / Dashboard View */}
      <main className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
          Registered Users ({users.length})
        </h2>

        {/* User Grid */}
        {users.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        ) : (
          // Initial state message if no users exist yet
          <div className="text-center p-16 bg-white rounded-xl shadow-lg border-2 border-dashed border-indigo-300">
            <p className="text-xl text-gray-500 mb-4">No users registered yet.</p>
            <p className="text-md text-gray-400">Use the navigation (or create a form) to add your first household member!</p>
          </div>
        )}

        {/* Placeholder for other dashboard widgets */}
        <div className="mt-12 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-700 mb-4">Quick Actions</h3>
            <p className="text-gray-500">This area will house the Task/Grocery/Bill quick add forms.</p>
        </div>

      </main>
    </div>
  );
}

// Helper component for stats display
const StatCard: React.FC<{ title: string; value: string | number; color: string }> = ({ title, value, color }) => (
  <div className={`p-6 ${color} text-white rounded-xl shadow-lg transition duration-300 transform hover:scale-[1.02]`}>
    <p className="text-sm font-medium opacity-90">{title}</p>
    <p className="text-4xl font-extrabold mt-1">{value}</p>
  </div>
);