const bcrypt = require("bcryptjs");
const prisma = require("./src/config/prisma");

const resetAdminPassword = async () => {
  try {
    const email = "admin@test.com";
    const newPassword = "Admin123!";

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("Admin account not found.");
      return;
    }

    console.log("Existing admin:");
    console.log("ID:", user.id);
    console.log("Name:", user.firstName, user.lastName);
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Active:", user.isActive);

    if (user.role !== "ADMIN") {
      console.log(
        `This account is ${user.role}, not ADMIN.`
      );
      return;
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        isActive: true,
      },
    });

    console.log("");
    console.log("Admin password reset successfully.");
    console.log("Email:", email);
    console.log("New password:", newPassword);
  } catch (error) {
    console.error("Reset admin password error:", error);
  } finally {
    await prisma.$disconnect();
  }
};

resetAdminPassword();