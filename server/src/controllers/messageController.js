const prisma = require("../config/prisma");

/*
  Get users that the currently logged-in user is allowed
  to communicate with.
*/
const getContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let contacts = [];

    // =========================
    // PARENT CONTACTS
    // =========================
    if (role === "PARENT") {
      const parent = await prisma.parent.findUnique({
        where: {
          userId,
        },
        include: {
          students: {
            include: {
              student: {
                include: {
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
                              phone: true,
                              role: true,
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
                                  phone: true,
                                  role: true,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
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

      const contactMap = new Map();

      for (const link of parent.students) {
        const student = link.student;

        // Class teacher
        if (student.class?.teacher?.user) {
          const teacher = student.class.teacher.user;

          contactMap.set(teacher.id, {
            id: teacher.id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
            phone: teacher.phone,
            role: teacher.role,
            relationship: "Class Teacher",
            studentId: student.id,
            studentName: `${student.user?.firstName || ""} ${
              student.user?.lastName || ""
            }`.trim(),
          });
        }

        // Course teachers
        for (const enrollment of student.enrollments) {
          const teacher = enrollment.course?.teacher?.user;

          if (teacher) {
            contactMap.set(teacher.id, {
              id: teacher.id,
              firstName: teacher.firstName,
              lastName: teacher.lastName,
              email: teacher.email,
              phone: teacher.phone,
              role: teacher.role,
              relationship: `Teacher - ${enrollment.course.title}`,
              studentId: student.id,
              studentName: `${student.user?.firstName || ""} ${
                student.user?.lastName || ""
              }`.trim(),
            });
          }
        }
      }

      contacts = Array.from(contactMap.values());
    }

    // =========================
    // TEACHER CONTACTS
    // =========================
    else if (role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: {
          userId,
        },
        include: {
          classes: {
            include: {
              students: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                      phone: true,
                    },
                  },
                  parentLinks: {
                    include: {
                      parent: {
                        include: {
                          user: {
                            select: {
                              id: true,
                              firstName: true,
                              lastName: true,
                              email: true,
                              phone: true,
                              role: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },

          courses: {
            include: {
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
                      parentLinks: {
                        include: {
                          parent: {
                            include: {
                              user: {
                                select: {
                                  id: true,
                                  firstName: true,
                                  lastName: true,
                                  email: true,
                                  phone: true,
                                  role: true,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher profile not found",
        });
      }

      const contactMap = new Map();

      // Students and parents from classes
      for (const classRecord of teacher.classes) {
        for (const student of classRecord.students) {
          if (student.user) {
            contactMap.set(student.user.id, {
              id: student.user.id,
              firstName: student.user.firstName,
              lastName: student.user.lastName,
              email: student.user.email,
              phone: student.user.phone,
              role: "STUDENT",
              relationship: `Student - ${classRecord.name}`,
              studentId: student.id,
            });
          }

          for (const link of student.parentLinks) {
            const parentUser = link.parent.user;

            contactMap.set(parentUser.id, {
              id: parentUser.id,
              firstName: parentUser.firstName,
              lastName: parentUser.lastName,
              email: parentUser.email,
              phone: parentUser.phone,
              role: "PARENT",
              relationship: `Parent of ${student.user.firstName} ${student.user.lastName}`,
              studentId: student.id,
            });
          }
        }
      }

      // Students and parents from courses
      for (const course of teacher.courses) {
        for (const enrollment of course.enrollments) {
          const student = enrollment.student;

          if (student.user) {
            contactMap.set(student.user.id, {
              id: student.user.id,
              firstName: student.user.firstName,
              lastName: student.user.lastName,
              email: student.user.email,
              phone: student.user.phone,
              role: "STUDENT",
              relationship: `Student - ${course.title}`,
              studentId: student.id,
            });
          }

          for (const link of student.parentLinks) {
            const parentUser = link.parent.user;

            contactMap.set(parentUser.id, {
              id: parentUser.id,
              firstName: parentUser.firstName,
              lastName: parentUser.lastName,
              email: parentUser.email,
              phone: parentUser.phone,
              role: "PARENT",
              relationship: `Parent of ${student.user.firstName} ${student.user.lastName}`,
              studentId: student.id,
            });
          }
        }
      }

      contacts = Array.from(contactMap.values());
    }

    // =========================
    // STUDENT CONTACTS
    // =========================
    else if (role === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: {
          userId,
        },
        include: {
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
                      phone: true,
                      role: true,
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
                          phone: true,
                          role: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      const contactMap = new Map();

      if (student.class?.teacher?.user) {
        const teacher = student.class.teacher.user;

        contactMap.set(teacher.id, {
          id: teacher.id,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
          phone: teacher.phone,
          role: teacher.role,
          relationship: "Class Teacher",
        });
      }

      for (const enrollment of student.enrollments) {
        const teacher = enrollment.course?.teacher?.user;

        if (teacher) {
          contactMap.set(teacher.id, {
            id: teacher.id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
            phone: teacher.phone,
            role: teacher.role,
            relationship: `Teacher - ${enrollment.course.title}`,
          });
        }
      }

      contacts = Array.from(contactMap.values());
    }

    return res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.error("Get message contacts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load communication contacts",
    });
  }
};


/*
  Send a message
*/
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;

    const {
      receiverId,
      subject,
      content,
    } = req.body;

    const numericReceiverId = Number(receiverId);

    if (!Number.isInteger(numericReceiverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiver ID",
      });
    }

    if (numericReceiverId === senderId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    const receiver = await prisma.user.findUnique({
      where: {
        id: numericReceiverId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    if (!receiver.isActive) {
      return res.status(400).json({
        success: false,
        message: "This user account is disabled",
      });
    }

    /*
      Make sure the receiver appears in the sender's
      allowed contacts.
    */
    const contactsRequest = {
      ...req,
      user: req.user,
    };

    let allowed = false;

    // Simpler relationship checks
    if (
      req.user.role === "PARENT" &&
      receiver.role === "TEACHER"
    ) {
      const parent = await prisma.parent.findUnique({
        where: {
          userId: senderId,
        },
        include: {
          students: {
            include: {
              student: {
                include: {
                  class: {
                    include: {
                      teacher: true,
                    },
                  },
                  enrollments: {
                    include: {
                      course: {
                        include: {
                          teacher: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (parent) {
        for (const link of parent.students) {
          const student = link.student;

          if (
            student.class?.teacher?.userId ===
            numericReceiverId
          ) {
            allowed = true;
          }

          for (const enrollment of student.enrollments) {
            if (
              enrollment.course?.teacher?.userId ===
              numericReceiverId
            ) {
              allowed = true;
            }
          }
        }
      }
    }

    if (
      req.user.role === "STUDENT" &&
      receiver.role === "TEACHER"
    ) {
      const student = await prisma.student.findUnique({
        where: {
          userId: senderId,
        },
        include: {
          class: {
            include: {
              teacher: true,
            },
          },
          enrollments: {
            include: {
              course: {
                include: {
                  teacher: true,
                },
              },
            },
          },
        },
      });

      if (student) {
        if (
          student.class?.teacher?.userId ===
          numericReceiverId
        ) {
          allowed = true;
        }

        for (const enrollment of student.enrollments) {
          if (
            enrollment.course?.teacher?.userId ===
            numericReceiverId
          ) {
            allowed = true;
          }
        }
      }
    }

    if (req.user.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: {
          userId: senderId,
        },
        include: {
          classes: {
            include: {
              students: {
                include: {
                  user: true,
                  parentLinks: {
                    include: {
                      parent: {
                        include: {
                          user: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          courses: {
            include: {
              enrollments: {
                include: {
                  student: {
                    include: {
                      user: true,
                      parentLinks: {
                        include: {
                          parent: {
                            include: {
                              user: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (teacher) {
        for (const classRecord of teacher.classes) {
          for (const student of classRecord.students) {
            if (student.userId === numericReceiverId) {
              allowed = true;
            }

            for (const link of student.parentLinks) {
              if (link.parent.userId === numericReceiverId) {
                allowed = true;
              }
            }
          }
        }

        for (const course of teacher.courses) {
          for (const enrollment of course.enrollments) {
            const student = enrollment.student;

            if (student.userId === numericReceiverId) {
              allowed = true;
            }

            for (const link of student.parentLinks) {
              if (link.parent.userId === numericReceiverId) {
                allowed = true;
              }
            }
          }
        }
      }
    }

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to message this user",
      });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: numericReceiverId,
        subject: subject?.trim() || null,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: numericReceiverId,
        title: "New Message",
        message: `You have a new message from ${req.user.firstName} ${req.user.lastName}.`,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Send message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};


/*
  Get inbox
*/
const getInbox = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        receiverId: req.user.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get inbox error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load inbox",
    });
  }
};


/*
  Get sent messages
*/
const getSentMessages = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        senderId: req.user.id,
      },
      include: {
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get sent messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load sent messages",
    });
  }
};


/*
  Mark message as read
*/
const markMessageRead = async (req, res) => {
  try {
    const messageId = Number(req.params.id);

    if (!Number.isInteger(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.receiverId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You cannot modify this message",
      });
    }

    const updatedMessage = await prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        isRead: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Mark message read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark message as read",
    });
  }
};


module.exports = {
  getContacts,
  sendMessage,
  getInbox,
  getSentMessages,
  markMessageRead,
};