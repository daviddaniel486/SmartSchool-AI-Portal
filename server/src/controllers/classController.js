const prisma = require("../config/prisma");

const createClass = async (req, res) => {
  try {
    const { name, level, teacherId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Class name is required",
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

    const newClass = await prisma.class.create({
      data: {
        name,
        level,
        teacherId:
          teacherId !== undefined && teacherId !== null
            ? Number(teacherId)
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
      },
    });

    return res.status(201).json({
      success: true,
      message: "Class created successfully",
      class: newClass,
    });
  } catch (error) {
    console.error("Create class error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create class",
    });
  }
};

const getClasses = async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
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
        _count: {
          select: {
            students: true,
            subjects: true,
            courses: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      classes,
    });
  } catch (error) {
    console.error("Get classes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch classes",
    });
  }
};

const getClassById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID",
      });
    }

    const classRecord = await prisma.class.findUnique({
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
        students: {
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
        subjects: true,
        courses: true,
      },
    });

    if (!classRecord) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    return res.status(200).json({
      success: true,
      class: classRecord,
    });
  } catch (error) {
    console.error("Get class error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch class",
    });
  }
};

const assignTeacherToClass = async (req, res) => {
  try {
    const classId = Number(req.params.id);
    const { teacherId } = req.body;

    if (!Number.isInteger(classId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID",
      });
    }

    if (teacherId === undefined || teacherId === null) {
      return res.status(400).json({
        success: false,
        message: "Teacher ID is required",
      });
    }

    const numericTeacherId = Number(teacherId);

    if (!Number.isInteger(numericTeacherId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID",
      });
    }

    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classRecord) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
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

    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: {
        teacherId: numericTeacherId,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
              },
            },
          },
        },
        students: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Teacher assigned to class successfully",
      class: updatedClass,
    });
  } catch (error) {
    console.error("Assign teacher to class error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to assign teacher to class",
    });
  }
};

module.exports = {
  createClass,
  getClasses,
  getClassById,
  assignTeacherToClass,
};