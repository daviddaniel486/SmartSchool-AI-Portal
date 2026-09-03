const prisma = require("../config/prisma");

const submitAssignment = async (req, res) => {
  try {
    const {
      assignmentId,
      content,
      fileUrl,
    } = req.body;

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID is required",
      });
    }

    const numericAssignmentId = Number(assignmentId);

    if (!Number.isInteger(numericAssignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
    }

    if (!content && !fileUrl) {
      return res.status(400).json({
        success: false,
        message: "Submission content or file URL is required",
      });
    }

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

    const assignment = await prisma.assignment.findUnique({
      where: { id: numericAssignmentId },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: assignment.courseId,
        },
      },
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "Student is not enrolled in this course",
      });
    }

    const existingSubmission = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: numericAssignmentId,
          studentId: student.id,
        },
      },
    });

    if (existingSubmission) {
      return res.status(409).json({
        success: false,
        message: "Student has already submitted this assignment",
      });
    }

    const now = new Date();

    let status = "SUBMITTED";

    if (assignment.dueDate && now > assignment.dueDate) {
      status = "LATE";
    }

    const submission = await prisma.submission.create({
      data: {
        assignmentId: numericAssignmentId,
        studentId: student.id,
        content: content || null,
        fileUrl: fileUrl || null,
        status,
        submittedAt: now,
      },
      include: {
        assignment: true,
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
      message: "Assignment submitted successfully",
      submission,
    });
  } catch (error) {
    console.error("Submit assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit assignment",
    });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      include: {
        assignment: true,
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
      orderBy: {
        submittedAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      submissions,
    });
  } catch (error) {
    console.error("Get submissions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
    });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID",
      });
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        assignment: true,
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

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    return res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("Get submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch submission",
    });
  }
};
const gradeSubmission = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { score, feedback } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID",
      });
    }

    if (score === undefined || score === null) {
      return res.status(400).json({
        success: false,
        message: "Score is required",
      });
    }

    const numericScore = Number(score);

    if (!Number.isFinite(numericScore) || numericScore < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid score",
      });
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        assignment: true,
      },
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    if (numericScore > submission.assignment.maxScore) {
      return res.status(400).json({
        success: false,
        message: `Score cannot be greater than ${submission.assignment.maxScore}`,
      });
    }

    const gradedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        score: numericScore,
        feedback: feedback || null,
        status: "GRADED",
        gradedAt: new Date(),
      },
      include: {
        assignment: true,
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

    return res.status(200).json({
      success: true,
      message: "Submission graded successfully",
      submission: gradedSubmission,
    });
  } catch (error) {
    console.error("Grade submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to grade submission",
    });
  }
};

const getMySubmissions = async (req, res) => {
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

    const submissions = await prisma.submission.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        assignment: true,
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      submissions,
    });
  } catch (error) {
    console.error("Get my submissions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your submissions",
    });
  }
};

module.exports = {
  submitAssignment,
  getSubmissions,
  getSubmissionById,
  gradeSubmission,
  getMySubmissions,
};