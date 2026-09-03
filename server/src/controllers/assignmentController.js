const prisma = require("../config/prisma");

const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      teacherId,
      dueDate,
      maxScore,
    } = req.body;

    if (!title || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Assignment title and course ID are required",
      });
    }

    const numericCourseId = Number(courseId);

    if (!Number.isInteger(numericCourseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
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

    if (teacherId !== undefined && teacherId !== null) {
      const numericTeacherId = Number(teacherId);

      if (!Number.isInteger(numericTeacherId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid teacher ID",
        });
      }

      const teacher = await prisma.teacher.findUnique({
        where: { id: numericTeacherId },
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        courseId: numericCourseId,
        teacherId:
          teacherId !== undefined && teacherId !== null
            ? Number(teacherId)
            : undefined,
        dueDate: dueDate ? new Date(dueDate) : null,
        maxScore:
          maxScore !== undefined && maxScore !== null
            ? Number(maxScore)
            : 100,
      },
      include: {
        course: true,
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

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    console.error("Create assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create assignment",
    });
  }
};

const getAssignments = async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        course: true,
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
        },submissions: {
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
  },
},submissions: {
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
  },
},
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error("Get assignments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
    });
  }
};

const getAssignmentById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        course: true,
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
        submissions: {
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
          },
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    return res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error("Get assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignment",
    });
  }
};
const getMyAssignments = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: student.id,
      },
      select: {
        courseId: true,
      },
    });

    const courseIds = enrollments.map(
      (enrollment) => enrollment.courseId
    );

    const assignments = await prisma.assignment.findMany({
      where: {
        courseId: {
          in: courseIds,
        },
      },
      include: {
        course: true,
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
        submissions: {
          where: {
            studentId: student.id,
          },
          select: {
            id: true,
            score: true,
            feedback: true,
            status: true,
            submittedAt: true,
            gradedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error("Get my assignments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your assignments",
    });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  getMyAssignments,
};