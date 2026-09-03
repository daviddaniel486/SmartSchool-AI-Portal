const prisma = require("./src/config/prisma");

async function fixTeacher() {
  try {
    const user = await prisma.user.update({
      where: { id: 4 },
      data: {
        email: "teacher2@test.com",
      },
    });

    console.log("UPDATED:", JSON.stringify(user.email));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTeacher();