const bcrypt = require("bcrypt");
const { User, sequelize } = require("./models");

async function seed() {
  await sequelize.sync();

  const existingAdmin = await User.findOne({ where: { email: "admin@system.com" } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      email: "admin@system.com",
      password: hashedPassword,
      role: "admin",
    });
    console.log("✅ Default admin created: admin@system.com / admin123");
  } else {
    console.log("ℹ️ Admin already exists, skipping seed.");
  }
}

seed().then(() => process.exit()).catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
