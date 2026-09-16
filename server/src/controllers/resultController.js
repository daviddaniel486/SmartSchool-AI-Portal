const prisma = require("../config/prisma");
const { calculateGrade } = require("../utils/gradeUtils");
const { calculateGPA } = require("../utils/gpaUtils");

/**
 * Create a new academic result
 * ADMIN and TEACHER can create results
 */
const createResult = async (req, res) => {
  try {
    const {
      studentId,
      subjectId,
      session,
      term,
      score,
      remark,
    } = req.body;

    if (
      studentId === undefined ||
      subjectId === undefined ||
      !session ||
      !term ||
      score === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "studentId, subjectId, session, term and score are required",
      });
    }

    const numericStudentId = Number(studentId);
    const numericSubjectId = Number(subjectId);
    const numericScore = Number(score);

    if (!Number.isInteger(numericStudentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    if (!Number.isInteger(numericSubjectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID",
      });
    }

    if (
      Number.isNaN(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Score must be a number between 0 and 100",
      });
    }

    const student = await prisma.student.findUnique({
      where: {
        id: numericStudentId,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const subject = await prisma.subject.findUnique({
      where: {
        id: numericSubjectId,
      },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    const { grade, point, remark: calculatedRemark } =
      calculateGrade(numericScore);

    const result = await prisma.result.create({
      data: {
        studentId: numericStudentId,
        subjectId: numericSubjectId,
        session,
        term,
        score: numericScore,
        grade,
        remark: remark || calculatedRemark,
        status: "DRAFT",
      },
      include: {
        student: true,
        subject: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Result created successfully",
      result: {
        ...result,
        gradePoint: point,
      },
    });
  } catch (error) {
    console.error("Create result error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create result",
      error: error.message,
    });
  }
};

/**
 * Get published results for a specific student
 */
const getStudentResults = async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);

    if (!Number.isInteger(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const results = await prisma.result.findMany({
      where: {
        studentId,
        status: "PUBLISHED",
      },
      include: {
        subject: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Get student results error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve student results",
    });
  }
};

/**
 * Get published results for the logged-in student
 */
const getMyResults = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const student = await prisma.student.findUnique({
      where: {
        userId,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const results = await prisma.result.findMany({
      where: {
        studentId: student.id,
        status: "PUBLISHED",
      },
      include: {
        subject: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Get my results error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your results",
    });
  }
};

/**
 * Update an existing result
 */
const updateResult = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { score, remark } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid result ID",
      });
    }

    if (score === undefined) {
      return res.status(400).json({
        success: false,
        message: "Score is required",
      });
    }

    const numericScore = Number(score);

    if (
      Number.isNaN(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Score must be a number between 0 and 100",
      });
    }

    const existingResult = await prisma.result.findUnique({
      where: {
        id,
      },
    });

    if (!existingResult) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    const { grade, point, remark: calculatedRemark } =
      calculateGrade(numericScore);

    const result = await prisma.result.update({
      where: {
        id,
      },
      data: {
        score: numericScore,
        grade,
        remark: remark || calculatedRemark,
        status: "DRAFT",
      },
      include: {
        student: true,
        subject: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Result updated successfully",
      result: {
        ...result,
        gradePoint: point,
      },
    });
  } catch (error) {
    console.error("Update result error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update result",
      error: error.message,
    });
  }
};

/**
 * Publish a result
 */
const publishResult = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid result ID",
      });
    }

    const existingResult = await prisma.result.findUnique({
      where: {
        id,
      },
    });

    if (!existingResult) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    const result = await prisma.result.update({
      where: {
        id,
      },
      data: {
        status: "PUBLISHED",
      },
      include: {
        student: true,
        subject: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Result published successfully",
      result,
    });
  } catch (error) {
    console.error("Publish result error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to publish result",
    });
  }
};

/**
 * Get GPA for a specific student
 */

const getMyGPA = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const results = await prisma.result.findMany({
      where: {
        studentId: student.id,
        status: "PUBLISHED",
      },
    });

    const resultsWithPoints = results.map((result) => {
      const { point } = calculateGrade(Number(result.score));

      return {
        ...result,
        gradePoint: point,
      };
    });

    const gpa = calculateGPA(resultsWithPoints);

    return res.status(200).json({
      success: true,
      studentId: student.id,
      gpa,
      totalResults: results.length,
    });
  } catch (error) {
    console.error("Get my GPA error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to calculate your GPA",
    });
  }
};

const getStudentGPA = async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);

    if (!Number.isInteger(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const results = await prisma.result.findMany({
      where: {
        studentId,
        status: "PUBLISHED",
      },
    });

    const resultsWithPoints = results.map((result) => {
      const { point } = calculateGrade(Number(result.score));

      return {
        ...result,
        gradePoint: point,
      };
    });

    const gpa = calculateGPA(resultsWithPoints);

    return res.status(200).json({
      success: true,
      studentId,
      gpa,
      totalResults: results.length,
    });
  } catch (error) {
    console.error("Get student GPA error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to calculate GPA",
    });
  }
};
const getTeacherResults = async (req, res) => {
  try {
    const results = await prisma.result.findMany({
      include: {
        student: true,
        subject: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    const resultsWithPoints = results.map((result) => {
      const { point } = calculateGrade(Number(result.score));

      return {
        ...result,
        gradePoint: point,
      };
    });

    return res.status(200).json({
      success: true,
      results: resultsWithPoints,
    });
  } catch (error) {
    console.error("Get teacher results error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve teacher results",
    });
  }
};

module.exports = {
  createResult,
  getStudentResults,
  getMyResults,
  updateResult,
  publishResult,
  getStudentGPA,
  getMyGPA,
  getTeacherResults,
};