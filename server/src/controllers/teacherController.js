const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

const createTeacher = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      employeeNo,
      department,
    } = req.body;

    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !employeeNo
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email, password, first name, last name, and employee number are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    const existingTeacher = await prisma.teacher.findUnique({
      where: { employeeNo },
    });

    if (existingTeacher) {
      return res.status(409).json({
        success: false,
        message: "A teacher with this employee number already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const teacher = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: "TEACHER",
          phone,
        },
      });

      return tx.teacher.create({
        data: {
          userId: user.id,
          employeeNo,
          department,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              role: true,
              isActive: true,
            },
          },
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      teacher,
    });
  } catch (error) {
    console.error("Create teacher error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create teacher",
    });
  }
};

const getTeachers = async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
          },
        },
        classes: true,
        subjects: true,
        courses: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      teachers,
    });
  } catch (error) {
    console.error("Get teachers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch teachers",
    });
  }
};

const getTeacherById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID",
      });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
          },
        },
        classes: true,
        subjects: true,
        courses: true,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      success: true,
      teacher,
    });
  } catch (error) {
    console.error("Get teacher error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch teacher",
    });
  }
};

module.exports = {
  createTeacher,
  getTeachers,
  getTeacherById,
};