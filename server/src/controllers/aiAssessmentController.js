const prisma = require("../config/prisma");

const getStudent = async (userId) => {
  return prisma.student.findUnique({
    where: { userId },
    include: { user: { select: { firstName: true, lastName: true } } },
  });
};

const assessWithAI = async (req, res) => {
  try {
    const { assignmentId, answer } = req.body;
    const numericAssignmentId = Number(assignmentId);

    if (!Number.isInteger(numericAssignmentId) || !answer?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID and an answer are required.",
      });
    }

    const student = await getStudent(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found." });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: numericAssignmentId },
      include: { course: true },
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found." });
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
        message: "You are not enrolled in this course.",
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: "AI assessment is not configured yet. Add OPENAI_API_KEY to the server environment.",
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

    if (existingSubmission?.status === "GRADED") {
      return res.status(409).json({
        success: false,
        message: "This assignment has already been graded.",
      });
    }

    const prompt = `
You are an experienced secondary-school teacher assisting with a Smart School portal.
Assess the student's response fairly against the assignment.

Assignment title: ${assignment.title}
Course: ${assignment.course?.title || "Unknown course"}
Maximum score: ${assignment.maxScore}
Instructions:
${assignment.description || "No additional instructions were provided."}

Student response:
${answer.trim()}

Return ONLY valid JSON with this exact shape:
{
  "score": number,
  "feedback": "short teacher-style feedback",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."]
}

Scoring rules:
- score must be between 0 and ${assignment.maxScore}
- reward correct reasoning and evidence, not just keywords
- do not penalize minor grammar mistakes unless communication is part of the task
- be constructive and age-appropriate
- never claim the student used AI
- if the response is incomplete, reflect that in the score and feedback
`;

    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
        input: prompt,
        max_output_tokens: 700,
      }),
    });

    if (!aiResponse.ok) {
      const details = await aiResponse.text();
      console.error("OpenAI assessment error:", details);
      return res.status(502).json({
        success: false,
        message: "The AI assessor could not complete the assessment. Please try again.",
      });
    }

    const result = await aiResponse.json();
    const output = result.output_text || "";
    const jsonText = output.match(/\{[\s\S]*\}/)?.[0];

    if (!jsonText) {
      throw new Error("AI returned an unexpected assessment format.");
    }

    const assessment = JSON.parse(jsonText);
    const score = Math.min(
      Number(assignment.maxScore),
      Math.max(0, Number(assessment.score))
    );

    if (!Number.isFinite(score)) {
      throw new Error("AI returned an invalid score.");
    }

    const feedback = String(assessment.feedback || "Assessment completed.");
    const details = {
      score,
      feedback,
      strengths: Array.isArray(assessment.strengths) ? assessment.strengths.slice(0, 4) : [],
      improvements: Array.isArray(assessment.improvements) ? assessment.improvements.slice(0, 4) : [],
    };

    const submission = existingSubmission
      ? await prisma.submission.update({
          where: { id: existingSubmission.id },
          data: {
            content: answer.trim(),
            score,
            feedback,
            status: "GRADED",
            submittedAt: existingSubmission.submittedAt || new Date(),
            gradedAt: new Date(),
          },
        })
      : await prisma.submission.create({
          data: {
            assignmentId: numericAssignmentId,
            studentId: student.id,
            content: answer.trim(),
            score,
            feedback,
            status: "GRADED",
            submittedAt: new Date(),
            gradedAt: new Date(),
          },
        });

    return res.status(200).json({
      success: true,
      message: "AI assessment completed.",
      assessment: details,
      submission,
    });
  } catch (error) {
    console.error("AI assessment error:", error);
    return res.status(500).json({
      success: false,
      message: "AI assessment failed. Please try again.",
    });
  }
};

module.exports = { assessWithAI };
