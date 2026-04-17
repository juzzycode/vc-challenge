import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Create a default User (Admin) if one doesn't exist
  let adminUser = await prisma.user.findFirst({
    where: { email: "admin@household.com" },
  });

  if (!adminUser) {
    console.log("Creating initial Admin User...");
    adminUser = await prisma.user.create({
      data: {
        email: "admin@household.com",
        password: "$2b$10$HASHED_PASSWORD_PLACEHOLDER", // In a real app, this would be bcrypt hashed
        name: "Admin Household Manager",
      },
    });
  } else {
    console.log(`Found existing Admin User: ${adminUser.email}`);
  }

  // 2. Create initial Tasks for the user
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  await prisma.task.createMany({
    data: [
      // Task 1: Overdue (Due yesterday)
      {
        name: "Take out trash",
        description: "The kitchen bin is overflowing.",
        dueDate: new Date(today.getTime() - (24 * 60 * 60 * 1000)), // Yesterday
        isCompleted: false,
        recurrenceType: "NONE",
        recurrenceInterval: 1,
        userId: adminUser.id,
      },
      // Task 2: Due Today (High Priority)
      {
        name: "Pay electricity bill",
        description: "Don't forget the monthly utility payment.",
        dueDate: today, // Today
        isCompleted: false,
        recurrenceType: "MONTHLY",
        recurrenceInterval: 1,
        userId: adminUser.id,
      },
      // Task 3: Upcoming (Due in 5 days) - Weekly Recurrence
      {
        name: "Water garden plants",
        description: "The tomatoes look thirsty.",
        dueDate: new Date(today.getTime() + (5 * 24 * 60 * 60 * 1000)), // In 5 days
        isCompleted: false,
        recurrenceType: "WEEKLY",
        recurrenceInterval: 1,
        userId: adminUser.id,
      },
    ],
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });