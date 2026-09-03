const prisma = require("../config/prisma");

const createSubject = async (req, res) => {
  try {
    const {
      name,
      code,
      teacherId,
      classId,
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Subject name and code are required",
      });
    }

    const existingSubject = await prisma.subject.findUnique({
      where: { code },
    });

    if (existingSubject) {
      return res.status(409).json({
        success: false,
        message: "A subject with this code already exists",
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

    const subject = await prisma.subject.create({
      data: {
        name,
        code,
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
      message: "Subject created successfully",
      subject,
    });
  } catch (error) {
    console.error("Create subject error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create subject",
    });
  }
};

const getSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      subjects,
    });
  } catch (error) {
    console.error("Get subjects error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
    });
  }
};

const getSubjectById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID",
      });
    }

    const subject = await prisma.subject.findUnique({
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
        results: true,
      },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    return res.status(200).json({
      success: true,
      subject,
    });
  } catch (error) {
    console.error("Get subject error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subject",
    });
  }
};

module.exports = {
  createSubject,
  getSubjects,
  getSubjectById,
};
