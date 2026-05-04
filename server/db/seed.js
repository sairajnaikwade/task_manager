import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Users ───────────────────────────────────────────────────────────────
  const adminHash  = await bcrypt.hash("Admin1234!",  12);
  const memberHash = await bcrypt.hash("Member1234!", 12);

  const admin = await db.user.upsert({
    where:  { email: "admin@demo.com" },
    update: {},
    create: { name: "Demo Admin", email: "admin@demo.com", password_hash: adminHash,  role: "admin" },
  });

  const alice = await db.user.upsert({
    where:  { email: "alice@demo.com" },
    update: {},
    create: { name: "Alice Member", email: "alice@demo.com", password_hash: memberHash, role: "member" },
  });

  const bob = await db.user.upsert({
    where:  { email: "bob@demo.com" },
    update: {},
    create: { name: "Bob Member", email: "bob@demo.com", password_hash: memberHash, role: "member" },
  });

  // ─── Project ─────────────────────────────────────────────────────────────
  const project = await db.project.upsert({
    where:  { id: "00000000-0000-0000-0000-000000000001" },
    update: { is_active: true }, // Ensure demo project is reactivated
    create: {
      id:          "00000000-0000-0000-0000-000000000001",
      name:        "Team Task Manager Demo",
      description: "A sample project pre-seeded for evaluators to explore the full feature set.",
      owner_id:    admin.id,
      is_active:   true,
    },
  });

  // ─── Project members ──────────────────────────────────────────────────────
  await db.projectMember.upsert({
    where:  { project_id_user_id: { project_id: project.id, user_id: admin.id } },
    update: {},
    create: { project_id: project.id, user_id: admin.id, role: "admin" },
  });
  await db.projectMember.upsert({
    where:  { project_id_user_id: { project_id: project.id, user_id: alice.id } },
    update: {},
    create: { project_id: project.id, user_id: alice.id, role: "member" },
  });
  await db.projectMember.upsert({
    where:  { project_id_user_id: { project_id: project.id, user_id: bob.id } },
    update: {},
    create: { project_id: project.id, user_id: bob.id, role: "member" },
  });

  const now      = new Date();
  const future30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const future7  = new Date(now.getTime() +  7 * 24 * 60 * 60 * 1000);
  const past3    = new Date(now.getTime() -  3 * 24 * 60 * 60 * 1000); // overdue

  // ─── Tasks ────────────────────────────────────────────────────────────────
  // Delete existing tasks for this project to ensure a fresh demo state
  await db.task.deleteMany({
    where: { project_id: project.id },
  });

  const tasks = [
    { title: "Implement OAuth2 Login with Google",      status: "in_progress", due_date: future7,  assigned_to: alice.id },
    { title: "Design User Profile Dashboard UI",        status: "todo",        due_date: future30, assigned_to: bob.id   },
    { title: "Set up PostgreSQL database schema",       status: "done",        due_date: null,     assigned_to: admin.id },
    { title: "Write unit tests for authentication API", status: "todo",        due_date: future30, assigned_to: alice.id },
    { title: "Fix responsive layout on mobile devices", status: "in_progress", due_date: past3,    assigned_to: bob.id   }, // OVERDUE
    { title: "Configure CI/CD pipeline",                status: "done",        due_date: null,     assigned_to: alice.id },
    { title: "Optimize image loading performance",      status: "todo",        due_date: future7,  assigned_to: bob.id   },
  ];

  for (const t of tasks) {
    await db.task.create({
      data: {
        title:       t.title,
        status:      t.status,
        due_date:    t.due_date,
        project_id:  project.id,
        assigned_to: t.assigned_to,
        created_by:  admin.id,
        is_active:   true,
      },
    });
  }
  console.log("✅ Seed complete!");

  console.log("   admin@demo.com  / Admin1234!");
  console.log("   alice@demo.com  / Member1234!");
  console.log("   bob@demo.com    / Member1234!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
