const prisma = require("../config/prisma");

const enrollStudent = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Student ID and course ID are required",
      });
    }

    const numericStudentId = Number(studentId);
    const numericCourseId = Number(courseId);

    if (
      !Number.isInteger(numericStudentId) ||
      !Number.isInteger(numericCourseId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID or course ID",
      });
    }

    const student = await prisma.student.findUnique({
      where: { id: numericStudentId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: numericCourseId },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: numericStudentId,
          courseId: numericCourseId,
        },
      },
    });

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: "Student is already enrolled in this course",
      });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: numericStudentId,
        courseId: numericCourseId,
      },
      include: {
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
        course: {
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
            class: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Student enrolled successfully",
      enrollment,
    });
  } catch (error) {
    console.error("Enroll student error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to enroll student",
    });
  }
};

const getEnrollments = async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
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
        course: {
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
            class: true,
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      enrollments,
    });
  } catch (error) {
    console.error("Get enrollments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrollments",
    });
  }
};

module.exports = {
  enrollStudent,
  getEnrollments,
};