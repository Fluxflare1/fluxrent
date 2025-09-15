// frontend/scripts/seed-users.ts
import { addUser, ensureUsersSheet, clearUsersSheet, getUserByEmail } from "../lib/googleSheets";

async function main() {
  // Allow optional reset by suffix: if passed `--reset` we clear users sheet first
  const args = process.argv.slice(2);
  const doReset = args.includes("--reset");

  await ensureUsersSheet();
  if (doReset) {
    console.log("Clearing Users sheet...");
    await clearUsersSheet();
  }

  // helper to create if not exists
  async function ensureUser(email: string, name: string, role: string, password: string) {
    const existing = await getUserByEmail(email);
    if (existing) {
      console.log(`User ${email} exists — skipping`);
      return;
    }
    await addUser({ email, name, role, password, status: "approved" });
    console.log(`Seeded ${role} - ${email}`);
  }

  await ensureUser("admin@example.com", "Platform Admin", "admin", "admin123");
  await ensureUser("manager@example.com", "Property Manager", "manager", "manager123");
  await ensureUser("tenant@example.com", "Tenant User", "tenant", "tenant123");

  console.log("Seeding complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
