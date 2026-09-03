const prisma = require("../config/prisma");

const createCourse = async (req, res) => {
  try {
    const {
      title,
      code,
      description,
      teacherId,
      classId,
    } = req.body;

    if (!title || !code) {
      return res.status(400).json({
        success: false,
        message: "Course title and code are required",
      });
    }

    const existingCourse = await prisma.course.findUnique({
      where: { code },
    });

    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: "A course with this code already exists",
      });
    }

    if (teacherId !== undefined && teacherId !== null) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: Number(teacherId) },
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }
    }

    if (classId !== undefined && classId !== null) {
      const classRecord = await prisma.class.findUnique({
        where: { id: Number(classId) },
      });

      if (!classRecord) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }
    }

    const course = await prisma.course.create({
      data: {
        title,
        code,
        description,
        teacherId:
          teacherId !== undefined && teacherId !== null
            ? Number(teacherId)
            : undefined,
        classId:
          classId !== undefined && classId !== null
            ? Number(classId)
            : undefined,
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
        class: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Create course error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create course",
    });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
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
        _count: {
          select: {
            enrollments: true,
            assignments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("Get courses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await prisma.course.findUnique({
      where: { id },
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
        enrollments: {
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
        assignments: true,
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("Get course error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch course",
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
};