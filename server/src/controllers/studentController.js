const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

const getStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
          },
        },
        class: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("Get students error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};

const getStudentById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
          },
        },
        class: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Get student error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student",
    });
  }
};

const createStudent = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      admissionNo,
      dateOfBirth,
      gender,
      address,
      classId,
    } = req.body;

    if (!email || !password || !firstName || !lastName || !admissionNo) {
      return res.status(400).json({
        success: false,
        message:
          "Email, password, first name, last name, and admission number are required",
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

    const existingStudent = await prisma.student.findUnique({
      where: { admissionNo },
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "A student with this admission number already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: "STUDENT",
          phone,
        },
      });

      return tx.student.create({
        data: {
          userId: user.id,
          admissionNo,
          dateOfBirth: dateOfBirth
            ? new Date(dateOfBirth)
            : undefined,
          gender,
          address,
          classId:
            classId !== undefined && classId !== null
              ? Number(classId)
              : undefined,
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
          class: true,
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      student,
    });
  } catch (error) {
    console.error("Create student error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create student",
    });
  }
};

const assignStudentToClass = async (req, res) => {
  try {
    const studentId = Number(req.params.id);
    const { classId } = req.body;

    if (!Number.isInteger(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    if (classId === undefined || classId === null) {
      return res.status(400).json({
        success: false,
        message: "Class ID is required",
      });
    }

    const numericClassId = Number(classId);

    if (!Number.isInteger(numericClassId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID",
      });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const classRecord = await prisma.class.findUnique({
      where: { id: numericClassId },
    });

    if (!classRecord) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        classId: numericClassId,
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
        class: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Student assigned to class successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Assign student to class error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to assign student to class",
    });
  }
};
const resetStudentPassword = async (req, res) => {
  try {
    const studentId = Number(req.params.id);
    const { password } = req.body;

    if (!Number.isInteger(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: student.userId },
      data: {
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Student password reset successfully",
    });
  } catch (error) {
    console.error("Reset student password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset student password",
    });
  }
};
module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  assignStudentToClass,
  resetStudentPassword,
};