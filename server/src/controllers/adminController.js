
const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

const createTeacher = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      employeeNo,
      department,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !employeeNo
    ) {
      return res.status(400).json({
        success: false,
        message:
          "First name, last name, email, password, and employee number are required",
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role: "TEACHER",
        },
      });

      return tx.teacher.create({
        data: {
          userId: user.id,
          employeeNo,
          department: department || null,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
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
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
        courses: {
          select: {
            id: true,
            title: true,
            code: true,
          },
          orderBy: {
            title: "asc",
          },
        },
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

const assignCourseToTeacher = async (req, res) => {
  try {
    const teacherId = Number(req.params.teacherId);
    const courseId = Number(req.body.courseId);

    if (!Number.isInteger(teacherId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID",
      });
    }

    if (!Number.isInteger(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        teacherId,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Course assigned to teacher successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Assign course error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to assign course",
    });
  }
};

const unassignCourseFromTeacher = async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);

    if (!Number.isInteger(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        teacherId: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Course unassigned successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Unassign course error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to unassign course",
    });
  }
};

const linkStudentToParent = async (req, res) => {
  try {
    const parentId = Number(req.params.parentId);
    const studentId = Number(req.body.studentId);

    if (!Number.isInteger(parentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parent ID",
      });
    }

    if (!Number.isInteger(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const parent = await prisma.parent.findUnique({
      where: {
        id: parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    const student = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const existingLink = await prisma.parentStudent.findUnique({
      where: {
        parentId_studentId: {
          parentId,
          studentId,
        },
      },
    });

    if (existingLink) {
      return res.status(409).json({
        success: false,
        message: "This student is already linked to this parent",
      });
    }

    const parentStudent = await prisma.parentStudent.create({
      data: {
        parentId,
        studentId,
      },
      include: {
        parent: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Student linked to parent successfully",
      parentStudent,
    });
  } catch (error) {
    console.error("Link student to parent error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to link student to parent",
    });
  }
};
module.exports = {
  createTeacher,
  getTeachers,
  assignCourseToTeacher,
  unassignCourseFromTeacher,
  linkStudentToParent,
};
