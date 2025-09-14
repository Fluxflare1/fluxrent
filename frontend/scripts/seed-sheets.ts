import bcrypt from "bcryptjs";
import { addUser } from "../lib/googleSheets";

async function seedAdmin() {
  const hash = await bcrypt.hash("admin123", 10); // Default password
  await addUser({
    id: "1",
    email: "admin@example.com",
    name: "Super Admin",
    role: "admin",
    status: "approved",
    password_hash: hash,
    uid: "ADM/001",
  });
  console.log("✅ Admin user seeded");
}

seedAdmin();
