
const prisma = require("../config/prisma");

const getMyProfile = async (req, res) => {
  try {
    const parent = await prisma.parent.findUnique({
      where: {
        userId: req.user.id,
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

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      parent,
    });
  } catch (error) {
    console.error("Get parent profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch parent profile",
    });
  }
};

const getMyChildren = async (req, res) => {
  try {
    const parent = await prisma.parent.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    const children = await prisma.student.findMany({
      where: {
        parentLinks: {
          some: {
            parentId: parent.id,
          },
        },
      },
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

        class: {
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
        },

        enrollments: {
          include: {
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
              },
            },
          },
        },

        submissions: {
          include: {
            assignment: true,
          },
        },

        results: {
          include: {
            subject: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      children,
    });
  } catch (error) {
    console.error("Get parent children error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch children",
    });
  }
};

module.exports = {
  getMyProfile,
  getMyChildren,
};

