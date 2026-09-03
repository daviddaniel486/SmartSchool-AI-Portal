const bcrypt = require("bcryptjs");
const prisma = require("./src/config/prisma");

const createAdmin = async () => {
  try {
    const email = "admin@test.com";
    const password = "Admin123!";
    const firstName = "System";
    const lastName = "Admin";

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("Admin already exists:", existingUser.email);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      },
    });

    console.log("ADMIN CREATED:");
    console.log("Email:", admin.email);
    console.log("Password:", password);
    console.log("Role:", admin.role);
  } catch (error) {
    console.error("Create admin error:", error);
  } finally {
    await prisma.$disconnect();
  }
};

createAdmin();