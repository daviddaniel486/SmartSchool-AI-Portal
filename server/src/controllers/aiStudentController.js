const prisma = require("../config/prisma");

const getStudentContext = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },

    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },

      results: {
        where: {
          status: "PUBLISHED",
        },

        include: {
          subject: {
            select: {
              name: true,
              code: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      },

      submissions: {
        include: {
          assignment: {
            include: {
              course: {
                select: {
                  title: true,
                },
              },
            },
          },
        },

        orderBy: {
          submittedAt: "desc",
        },
      },

      enrollments: {
        where: {
          status: "ACTIVE",
        },

        include: {
          course: {
            select: {
              id: true,
              title: true,
              code: true,
            },
          },
        },
      },
    },
  });

  return student;
};


const buildStudentSummary = (student) => {
  const results = student.results || [];
  const submissions = student.submissions || [];

  const gradedSubmissions = submissions.filter(
    (submission) =>
      submission.status === "GRADED" &&
      submission.score !== null &&
      submission.score !== undefined
  );


  // -----------------------------------------
  // RESULT AVERAGE
  // -----------------------------------------

  const averageResultScore =
    results.length > 0
      ? Number(
          (
            results.reduce(
              (total, result) => total + Number(result.score),
              0
            ) / results.length
          ).toFixed(2)
        )
      : null;


  // -----------------------------------------
  // ASSIGNMENT AVERAGE
  // -----------------------------------------

  const assignmentPercentages = gradedSubmissions
    .map((submission) => {
      const score = Number(submission.score);
      const maxScore = Number(submission.assignment?.maxScore);

      if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0) {
        return null;
      }

      return (score / maxScore) * 100;
    })
    .filter((value) => value !== null);


  const averageAssignmentScore =
    assignmentPercentages.length > 0
      ? Number(
          (
            assignmentPercentages.reduce(
              (total, score) => total + score,
              0
            ) / assignmentPercentages.length
          ).toFixed(2)
        )
      : null;


  // -----------------------------------------
  // SUBJECT PERFORMANCE
  // -----------------------------------------

  const subjectPerformance = {};

  results.forEach((result) => {
    const subjectName = result.subject?.name || "Unknown";

    if (!subjectPerformance[subjectName]) {
      subjectPerformance[subjectName] = [];
    }

    subjectPerformance[subjectName].push(Number(result.score));
  });


  const subjects = Object.entries(subjectPerformance)
    .map(([subject, scores]) => ({
      subject,

      average: Number(
        (
          scores.reduce((sum, score) => sum + score, 0) /
          scores.length
        ).toFixed(2)
      ),

      attempts: scores.length,
    }))
    .sort((a, b) => b.average - a.average);


  // -----------------------------------------
  // STRONGEST / FOCUS SUBJECT
  // -----------------------------------------

  const strongestSubject =
    subjects.length > 0
      ? subjects[0]
      : null;

  const focusSubject =
    subjects.length > 1
      ? subjects[subjects.length - 1]
      : subjects.length === 1
      ? subjects[0]
      : null;


  // -----------------------------------------
  // PENDING ASSIGNMENTS
  // -----------------------------------------

  const pendingAssignments = submissions.filter(
    (submission) =>
      submission.status !== "GRADED"
  ).length;


  // -----------------------------------------
  // RECENT RESULTS
  // -----------------------------------------

  const recentResults = results.slice(0, 10).map((result) => ({
    subject: result.subject?.name || "Unknown",
    score: Number(result.score),
    grade: result.grade,
    term: result.term,
    session: result.session,
    remark: result.remark,
  }));


  // -----------------------------------------
  // RECENT ASSIGNMENTS
  // -----------------------------------------

  const recentAssignments = submissions.slice(0, 10).map(
    (submission) => ({
      assignment: submission.assignment?.title || "Unknown assignment",

      course:
        submission.assignment?.course?.title ||
        "Unknown course",

      score:
        submission.score !== null &&
        submission.score !== undefined
          ? Number(submission.score)
          : null,

      maxScore:
        submission.assignment?.maxScore !== null &&
        submission.assignment?.maxScore !== undefined
          ? Number(submission.assignment.maxScore)
          : null,

      status: submission.status,

      feedback: submission.feedback,

      submittedAt: submission.submittedAt,
    })
  );


  return {
    studentName:
      `${student.user.firstName} ${student.user.lastName}`.trim(),

    averageResultScore,

    averageAssignmentScore,

    totalAssignments: submissions.length,

    gradedAssignments: gradedSubmissions.length,

    pendingAssignments,

    activeCourses: student.enrollments.map(
      (enrollment) => enrollment.course.title
    ),

    subjects,

    strongestSubject,

    focusSubject,

    recentResults,

    recentAssignments,
  };
};


// =====================================================
// OPENAI
// =====================================================

const callOpenAI = async (prompt) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  if (!process.env.OPENAI_MODEL) {
    throw new Error("OPENAI_MODEL is not configured.");
  }

  const response = await fetch(
    "https://api.openai.com/v1/responses",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization:
          `Bearer ${process.env.OPENAI_API_KEY}`,
      },

      body: JSON.stringify({
        model: process.env.OPENAI_MODEL,

        input: prompt,

        max_output_tokens: 900,
      }),
    }
  );


  if (!response.ok) {
    const details = await response.text();

    console.error(
      "OpenAI student AI error:",
      details
    );

    throw new Error("OpenAI request failed.");
  }


  const data = await response.json();

  return data.output_text || "";
};


// =====================================================
// PERSONALIZED INSIGHT
// =====================================================

const getStudentInsight = async (req, res) => {
  try {
    const student = await getStudentContext(
      req.user.id
    );


    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }


    const summary = buildStudentSummary(student);


    const prompt = `
You are Dobi, the personalized learning assistant inside Smart School.

You are speaking directly to this student.

Student academic data:

${JSON.stringify(summary, null, 2)}

Generate a personalized academic insight using ONLY the data provided.

Your insight should:

- mention real academic patterns
- identify the student's strongest subject when available
- identify a subject that needs attention when appropriate
- consider assignment performance
- consider pending assignments
- give one practical study action
- be encouraging
- be concise
- never invent grades or assignments
- never compare the student with other students
- never claim certainty about why the student is struggling
- never make medical or psychological claims

Return ONLY valid JSON in exactly this format:

{
  "title": "short personalized title",
  "message": "2-4 sentence personalized insight",
  "focusArea": "one useful study focus",
  "action": "one practical action the student can take today",
  "strengths": [
    "short strength",
    "short strength"
  ],
  "improvements": [
    "short improvement",
    "short improvement"
  ]
}
`;


    const output = await callOpenAI(prompt);


    const jsonText =
      output.match(/\{[\s\S]*\}/)?.[0];


    if (!jsonText) {
      throw new Error(
        "AI returned an invalid insight."
      );
    }


    const aiInsight = JSON.parse(jsonText);


    // -----------------------------------------
    // BUILD ANALYTICS FOR THE FRONTEND
    // -----------------------------------------

    const analytics = {
      averageResultScore:
        summary.averageResultScore,

      averageAssignmentScore:
        summary.averageAssignmentScore,

      totalAssignments:
        summary.totalAssignments,

      gradedAssignments:
        summary.gradedAssignments,

      pendingAssignments:
        summary.pendingAssignments,

      strongestSubject:
        summary.strongestSubject?.subject || null,

      strongestSubjectScore:
        summary.strongestSubject?.average || null,

      focusSubject:
        summary.focusSubject?.subject || null,

      focusSubjectScore:
        summary.focusSubject?.average || null,

      subjects:
        summary.subjects,
    };


    return res.json({
      success: true,

      insight: {
        title:
          aiInsight.title ||
          "Your Learning Insight",

        message:
          aiInsight.message ||
          "Here is a quick look at your recent academic progress.",

        focusArea:
          aiInsight.focusArea ||
          "Keep building consistent study habits.",

        action:
          aiInsight.action ||
          "Review one topic you found difficult today.",

        strengths:
          Array.isArray(aiInsight.strengths)
            ? aiInsight.strengths.slice(0, 4)
            : [],

        improvements:
          Array.isArray(aiInsight.improvements)
            ? aiInsight.improvements.slice(0, 4)
            : [],

        analytics,
      },
    });


  } catch (error) {
    console.error(
      "Student insight error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate your learning insight.",
    });
  }
};


// =====================================================
// CHAT WITH DOBI
// =====================================================

const chatWithStudentAI = async (req, res) => {
  try {
    const { message } = req.body;


    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message.",
      });
    }


    const student = await getStudentContext(
      req.user.id
    );


    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }


    const summary =
      buildStudentSummary(student);


    const prompt = `
You are Dobi, the personalized academic assistant for a student using Smart School.

Student academic data:

${JSON.stringify(summary, null, 2)}

Student question:

${message.trim()}

Answer the student's question using their actual academic information.

Rules:

- Be supportive and age-appropriate.
- Use their actual results and assignments when relevant.
- If the student asks for their GPA or academic average, use the available academic data.
- Do not invent information.
- Do not compare the student with other students.
- Do not make medical or psychological claims.
- If the data is insufficient to answer something, clearly say so.
- Give practical study advice when appropriate.
- Keep responses concise and useful.
- Speak as Dobi.
`;

    const reply =
      await callOpenAI(prompt);


    return res.json({
      success: true,
      reply: reply.trim(),
    });


  } catch (error) {
    console.error(
      "Student AI chat error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Dobi is currently unavailable.",
    });
  }
};


module.exports = {
  getStudentInsight,
  chatWithStudentAI,
};