import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function StudentDashboard() {
const [assignments, setAssignments] = useState([]);
const [loading, setLoading] = useState(true);

const [message, setMessage] = useState("");
const [error, setError] = useState("");

const [answers, setAnswers] = useState({});
const [submittingId, setSubmittingId] = useState(null);
const [files, setFiles] = useState({});

const token = localStorage.getItem("token");

const loadAssignments = async () => {
try {
setLoading(true);
setError("");


  const response = await fetch(`${API_URL}/assignments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load assignments"
    );
  }

  setAssignments(data.assignments || []);
} catch (error) {
  console.error("Student dashboard error:", error);
  setError(error.message);
} finally {
  setLoading(false);
}


};

useEffect(() => {
if (!token) {
setLoading(false);
setError("Please log in first.");
return;
}


loadAssignments();


}, []);

const handleFileChange = (assignmentId, file) => {
if (!file) {
return;
}


setFiles((previousFiles) => ({
  ...previousFiles,
  [assignmentId]: file,
}));


};

const submitAssignment = async (assignmentId) => {
try {
setSubmittingId(assignmentId);
setMessage("");
setError("");


  const content = answers[assignmentId] || "";

  if (!content.trim()) {
    setError("Please enter an answer before submitting.");
    setSubmittingId(null);
    return;
  }

  const response = await fetch(`${API_URL}/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      assignmentId,
      content: content.trim(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to submit assignment"
    );
  }

  setMessage("Assignment submitted successfully.");

  setAnswers((previous) => ({
    ...previous,
    [assignmentId]: "",
  }));

  await loadAssignments();
} catch (error) {
  console.error("Submit assignment error:", error);
  setError(error.message);
} finally {
  setSubmittingId(null);
}


};

const logout = () => {
localStorage.removeItem("token");
window.location.reload();
};

const totalAssignments = assignments.length;

const submittedAssignments = assignments.filter(
(assignment) => {
const submission = assignment.submissions?.[0];


  return (
    submission &&
    submission.status !== "DRAFT"
  );
}


).length;

const gradedAssignments = assignments.filter(
(assignment) =>
assignment.submissions?.[0]?.status === "GRADED"
).length;

const pendingAssignments =
totalAssignments -
submittedAssignments;

const averageScoreData = assignments
.map((assignment) => {
const submission = assignment.submissions?.[0];

  if (
    submission &&
    submission.status === "GRADED" &&
    submission.score !== null &&
    submission.score !== undefined &&
    assignment.maxScore
  ) {
    return (
      (Number(submission.score) /
        Number(assignment.maxScore)) *
      100
    );
  }

  return null;
})
.filter((score) => score !== null);


const averageScore =
averageScoreData.length > 0
? Math.round(
averageScoreData.reduce(
(total, score) => total + score,
0
) / averageScoreData.length
)
: 0;

if (loading) {
return (
<div
style={{
minHeight: "100vh",
display: "flex",
alignItems: "center",
justifyContent: "center",
background:
"linear-gradient(135deg, #eff6ff, #f8fafc)",
fontFamily:
"'Inter', 'Segoe UI', Arial, sans-serif",
}}
>
<div
style={{
textAlign: "center",
backgroundColor: "white",
padding: "40px",
borderRadius: "20px",
boxShadow:
"0 20px 50px rgba(15, 23, 42, 0.08)",
}}
>
<div
style={{
width: "50px",
height: "50px",
borderRadius: "50%",
border: "5px solid #dbeafe",
borderTopColor: "#2563eb",
margin: "0 auto 20px",
animation: "spin 1s linear infinite",
}}
/>


      <h2
        style={{
          margin: 0,
          color: "#0f172a",
          fontSize: "20px",
        }}
      >
        Loading your dashboard...
      </h2>

      <p
        style={{
          color: "#64748b",
          marginTop: "8px",
        }}
      >
        Please wait a moment.
      </p>
    </div>

    <style>
      {`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}
    </style>
  </div>
);


}

return (
<div
className="portal-page portal-student"
style={{
minHeight: "100vh",
background:
"linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
fontFamily:
"'Inter', 'Segoe UI', Arial, sans-serif",
color: "#0f172a",
}}
>
{/* TOP NAVIGATION */}
<header
style={{
background:
"linear-gradient(135deg, #0f2a5f 0%, #1d4ed8 60%, #2563eb 100%)",
color: "white",
padding: "18px 5%",
display: "flex",
justifyContent: "space-between",
alignItems: "center",
gap: "20px",
boxShadow:
"0 10px 30px rgba(15, 42, 95, 0.18)",
position: "relative",
overflow: "hidden",
}}
>
<div
style={{
position: "absolute",
width: "250px",
height: "250px",
borderRadius: "50%",
background:
"rgba(255,255,255,0.05)",
right: "5%",
top: "-180px",
}}
/>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          backgroundColor: "white",
          color: "#1d4ed8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          fontWeight: "800",
          boxShadow:
            "0 8px 20px rgba(0,0,0,0.15)",
        }}
      >
        S
      </div>

      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "21px",
            fontWeight: "800",
            letterSpacing: "-0.5px",
          }}
        >
          Smart School
        </h1>

        <p
          style={{
            margin: "3px 0 0",
            color: "#bfdbfe",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          Student Portal
        </p>
      </div>
    </div>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "15px",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor:
              "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          👨‍🎓
        </div>

        <div
          style={{
            display: "none",
          }}
          className="student-name"
        >
          <strong>Student</strong>
        </div>
      </div>

      <button
        onClick={logout}
        style={{
          backgroundColor: "white",
          color: "#1d4ed8",
          border: "none",
          padding: "10px 18px",
          borderRadius: "9px",
          cursor: "pointer",
          fontWeight: "700",
          fontSize: "14px",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.transform =
            "translateY(-1px)";
          event.currentTarget.style.boxShadow =
            "0 6px 18px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.transform =
            "translateY(0)";
          event.currentTarget.style.boxShadow =
            "none";
        }}
      >
        Logout
      </button>
    </div>
  </header>

  <main
    style={{
      maxWidth: "1250px",
      margin: "0 auto",
      padding: "40px 22px 60px",
    }}
  >
    {/* WELCOME SECTION */}
    <section
      style={{
        background:
          "linear-gradient(135deg, #0f2a5f 0%, #1d4ed8 60%, #3b82f6 100%)",
        color: "white",
        borderRadius: "24px",
        padding: "38px 40px",
        marginBottom: "28px",
        position: "relative",
        overflow: "hidden",
        boxShadow:
          "0 20px 45px rgba(29, 78, 216, 0.18)",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background:
            "rgba(255,255,255,0.05)",
          right: "-100px",
          top: "-160px",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background:
            "rgba(255,255,255,0.04)",
          right: "180px",
          bottom: "-120px",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "700px",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            color: "#bfdbfe",
            fontSize: "13px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
          }}
        >
          Student Dashboard
        </p>

        <h2
          style={{
            margin: "0 0 12px",
            fontSize: "clamp(28px, 4vw, 42px)",
            lineHeight: "1.15",
            letterSpacing: "-1px",
          }}
        >
          Welcome back, Student! 👋
        </h2>

        <p
          style={{
            margin: 0,
            color: "#dbeafe",
            fontSize: "16px",
            lineHeight: "1.7",
          }}
        >
          Stay on top of your school work,
          submit assignments, track your
          progress, and review feedback from
          your teachers.
        </p>
      </div>
    </section>

    {/* SUCCESS / ERROR MESSAGES */}
    {message && (
      <div
        style={{
          backgroundColor: "#ecfdf5",
          color: "#166534",
          padding: "15px 18px",
          borderRadius: "12px",
          marginBottom: "20px",
          border: "1px solid #bbf7d0",
          boxShadow:
            "0 5px 15px rgba(22,101,52,0.05)",
          fontWeight: "600",
        }}
      >
        ✓ {message}
      </div>
    )}

    {error && (
      <div
        style={{
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          padding: "15px 18px",
          borderRadius: "12px",
          marginBottom: "20px",
          border: "1px solid #fecaca",
          boxShadow:
            "0 5px 15px rgba(153,27,27,0.05)",
          fontWeight: "600",
        }}
      >
        ⚠ {error}
      </div>
    )}

    {/* STATISTICS */}
    <section
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "18px",
        marginBottom: "32px",
      }}
    >
      <div
        className="stat-card"
        style={{
          backgroundColor: "white",
          padding: "23px",
          borderRadius: "18px",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 8px 25px rgba(15,23,42,0.05)",
          borderLeft:
            "5px solid #2563eb",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "13px",
                fontWeight: "700",
                textTransform: "uppercase",
              }}
            >
              Assignments
            </p>

            <h3
              style={{
                margin: "8px 0 0",
                fontSize: "34px",
                color: "#1e3a8a",
              }}
            >
              {totalAssignments}
            </h3>
          </div>

          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            📚
          </div>
        </div>
      </div>

      <div
        className="stat-card"
        style={{
          backgroundColor: "white",
          padding: "23px",
          borderRadius: "18px",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 8px 25px rgba(15,23,42,0.05)",
          borderLeft:
            "5px solid #16a34a",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "13px",
                fontWeight: "700",
                textTransform: "uppercase",
              }}
            >
              Submitted
            </p>

            <h3
              style={{
                margin: "8px 0 0",
                fontSize: "34px",
                color: "#166534",
              }}
            >
              {submittedAssignments}
            </h3>
          </div>

          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "#f0fdf4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            ✓
          </div>
        </div>
      </div>

      <div
        className="stat-card"
        style={{
          backgroundColor: "white",
          padding: "23px",
          borderRadius: "18px",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 8px 25px rgba(15,23,42,0.05)",
          borderLeft:
            "5px solid #f59e0b",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "13px",
                fontWeight: "700",
                textTransform: "uppercase",
              }}
            >
              Pending
            </p>

            <h3
              style={{
                margin: "8px 0 0",
                fontSize: "34px",
                color: "#92400e",
              }}
            >
              {pendingAssignments}
            </h3>
          </div>

          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "#fffbeb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            ⏳
          </div>
        </div>
      </div>

      <div
        className="stat-card"
        style={{
          backgroundColor: "white",
          padding: "23px",
          borderRadius: "18px",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 8px 25px rgba(15,23,42,0.05)",
          borderLeft:
            "5px solid #7c3aed",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "13px",
                fontWeight: "700",
                textTransform: "uppercase",
              }}
            >
              Average Score
            </p>

            <h3
              style={{
                margin: "8px 0 0",
                fontSize: "34px",
                color: "#6b21a8",
              }}
            >
              {averageScore}%
            </h3>
          </div>

          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "#faf5ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            📊
          </div>
        </div>
      </div>
    </section>

    {/* ASSIGNMENTS HEADER */}
    <section
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "20px",
        gap: "15px",
        flexWrap: "wrap",
      }}
    >
      <div>
        <p
          style={{
            margin: "0 0 5px",
            color: "#2563eb",
            fontSize: "13px",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Your Work
        </p>

        <h2
          style={{
            margin: 0,
            fontSize: "28px",
            letterSpacing: "-0.7px",
          }}
        >
          My Assignments
        </h2>

        <p
          style={{
            margin: "7px 0 0",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          Complete your assignments and keep
          track of your academic progress.
        </p>
      </div>
    </section>

    {/* NO ASSIGNMENTS */}
    {assignments.length === 0 ? (
      <div
        style={{
          backgroundColor: "white",
          padding: "60px 30px",
          borderRadius: "20px",
          textAlign: "center",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 10px 30px rgba(15,23,42,0.05)",
        }}
      >
        <div
          style={{
            width: "75px",
            height: "75px",
            borderRadius: "22px",
            backgroundColor: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "34px",
          }}
        >
          📚
        </div>

        <h3
          style={{
            margin: "0 0 8px",
            fontSize: "22px",
          }}
        >
          No assignments yet
        </h3>

        <p
          style={{
            color: "#64748b",
            margin: 0,
          }}
        >
          You currently have no assignments.
          Check back later for new work.
        </p>
      </div>
    ) : (
      /* ASSIGNMENT GRID */
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "22px",
        }}
      >
        {assignments.map((assignment) => {
          const mySubmission =
            assignment.submissions?.[0];

          const isGraded =
            mySubmission?.status === "GRADED";

          const hasSubmitted =
            mySubmission &&
            mySubmission.status !== "DRAFT";

          const submissionPercentage =
            isGraded &&
            assignment.maxScore
              ? Math.round(
                  (Number(
                    mySubmission.score
                  ) /
                    Number(
                      assignment.maxScore
                    )) *
                    100
                )
              : null;

          return (
            <article
              key={assignment.id}
              className="assignment-card"
              style={{
                backgroundColor: "white",
                borderRadius: "20px",
                overflow: "hidden",
                border:
                  "1px solid #e2e8f0",
                boxShadow:
                  "0 8px 25px rgba(15,23,42,0.05)",
                transition:
                  "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform =
                  "translateY(-4px)";
                event.currentTarget.style.boxShadow =
                  "0 18px 40px rgba(15,23,42,0.10)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform =
                  "translateY(0)";
                event.currentTarget.style.boxShadow =
                  "0 8px 25px rgba(15,23,42,0.05)";
              }}
            >
              {/* CARD TOP */}
              <div
                style={{
                  padding: "24px 24px 20px",
                  borderBottom:
                    "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                    marginBottom: "15px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding:
                        "6px 11px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: "800",
                      letterSpacing:
                        "0.4px",
                      backgroundColor:
                        isGraded
                          ? "#dcfce7"
                          : hasSubmitted
                          ? "#dbeafe"
                          : "#fef3c7",
                      color:
                        isGraded
                          ? "#166534"
                          : hasSubmitted
                          ? "#1e40af"
                          : "#92400e",
                    }}
                  >
                    {isGraded
                      ? "✓ GRADED"
                      : hasSubmitted
                      ? "✓ SUBMITTED"
                      : "● PENDING"}
                  </span>

                  {submissionPercentage !==
                    null && (
                    <span
                      style={{
                        color:
                          submissionPercentage >=
                          70
                            ? "#15803d"
                            : submissionPercentage >=
                              50
                            ? "#b45309"
                            : "#dc2626",
                        fontWeight: "800",
                        fontSize: "16px",
                      }}
                    >
                      {submissionPercentage}%
                    </span>
                  )}
                </div>

                <h2
                  style={{
                    margin: "0 0 10px",
                    color: "#0f172a",
                    fontSize: "21px",
                    lineHeight: "1.3",
                  }}
                >
                  {assignment.title}
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    lineHeight: "1.65",
                    fontSize: "14px",
                  }}
                >
                  {assignment.description ||
                    "No description provided."}
                </p>
              </div>

              {/* ASSIGNMENT DETAILS */}
              <div
                style={{
                  padding: "18px 24px",
                  backgroundColor:
                    "#f8fafc",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: "#94a3b8",
                        fontSize: "11px",
                        fontWeight: "800",
                        textTransform:
                          "uppercase",
                      }}
                    >
                      Course
                    </p>

                    <p
                      style={{
                        margin:
                          "5px 0 0",
                        color: "#334155",
                        fontWeight: "700",
                        fontSize: "13px",
                      }}
                    >
                      {assignment.course
                        ?.title ||
                        "Unknown course"}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: "#94a3b8",
                        fontSize: "11px",
                        fontWeight: "800",
                        textTransform:
                          "uppercase",
                      }}
                    >
                      Maximum Score
                    </p>

                    <p
                      style={{
                        margin:
                          "5px 0 0",
                        color: "#334155",
                        fontWeight: "700",
                        fontSize: "13px",
                      }}
                    >
                      {assignment.maxScore}
                    </p>
                  </div>

                  <div
                    style={{
                      gridColumn:
                        "1 / -1",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: "#94a3b8",
                        fontSize: "11px",
                        fontWeight: "800",
                        textTransform:
                          "uppercase",
                      }}
                    >
                      Due Date
                    </p>

                    <p
                      style={{
                        margin:
                          "5px 0 0",
                        color: "#334155",
                        fontWeight: "700",
                        fontSize: "13px",
                      }}
                    >
                      {assignment.dueDate
                        ? new Date(
                            assignment.dueDate
                          ).toLocaleString()
                        : "No due date"}
                    </p>
                  </div>
                </div>
              </div>

              {/* SUBMISSION / WORK AREA */}
              <div
                style={{
                  padding: "22px 24px 25px",
                }}
              >
                {isGraded ? (
                  <div
                    style={{
                      backgroundColor:
                        "#ecfdf5",
                      border:
                        "1px solid #bbf7d0",
                      borderRadius:
                        "14px",
                      padding: "18px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        marginBottom:
                          "14px",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          color:
                            "#166534",
                          fontSize:
                            "16px",
                        }}
                      >
                        Assignment Graded
                      </h3>

                      <span
                        style={{
                          backgroundColor:
                            "white",
                          padding:
                            "6px 10px",
                          borderRadius:
                            "8px",
                          color:
                            "#166534",
                          fontWeight:
                            "800",
                        }}
                      >
                        {mySubmission.score}{" "}
                        /{" "}
                        {
                          assignment.maxScore
                        }
                      </span>
                    </div>

                    <p
                      style={{
                        margin:
                          "0 0 7px",
                        color:
                          "#166534",
                        fontSize:
                          "13px",
                        fontWeight:
                          "800",
                      }}
                    >
                      Teacher Feedback
                    </p>

                    <p
                      style={{
                        margin: 0,
                        color:
                          "#365314",
                        whiteSpace:
                          "pre-wrap",
                        lineHeight:
                          "1.6",
                        fontSize:
                          "14px",
                      }}
                    >
                      {mySubmission.feedback ||
                        "No feedback provided."}
                    </p>
                  </div>
                ) : hasSubmitted ? (
                  <div
                    style={{
                      backgroundColor:
                        "#eff6ff",
                      border:
                        "1px solid #bfdbfe",
                      borderRadius:
                        "14px",
                      padding: "18px",
                    }}
                  >
                    <h3
                      style={{
                        margin:
                          "0 0 8px",
                        color:
                          "#1e40af",
                        fontSize:
                          "16px",
                      }}
                    >
                      ✓ Assignment Submitted
                    </h3>

                    <p
                      style={{
                        margin:
                          "0 0 12px",
                        color:
                          "#475569",
                        fontSize:
                          "14px",
                        lineHeight:
                          "1.5",
                      }}
                    >
                      Your assignment has
                      been submitted and is
                      waiting for grading.
                    </p>

                    <div
                      style={{
                        padding:
                          "13px",
                        backgroundColor:
                          "white",
                        borderRadius:
                          "9px",
                        color:
                          "#475569",
                        whiteSpace:
                          "pre-wrap",
                        fontSize:
                          "13px",
                        lineHeight:
                          "1.6",
                        border:
                          "1px solid #dbeafe",
                      }}
                    >
                      {mySubmission.content}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3
                      style={{
                        margin:
                          "0 0 13px",
                        fontSize:
                          "17px",
                        color:
                          "#0f172a",
                      }}
                    >
                      Submit Assignment
                    </h3>

                    <textarea
                      value={
                        answers[
                          assignment.id
                        ] || ""
                      }
                      onChange={(event) =>
                        setAnswers({
                          ...answers,
                          [assignment.id]:
                            event.target
                              .value,
                        })
                      }
                      placeholder="Write your answer here..."
                      rows="7"
                      style={{
                        width: "100%",
                        boxSizing:
                          "border-box",
                        padding: "14px",
                        borderRadius:
                          "12px",
                        border:
                          "1px solid #cbd5e1",
                        resize:
                          "vertical",
                        fontFamily:
                          "inherit",
                        fontSize:
                          "14px",
                        lineHeight:
                          "1.6",
                        outline: "none",
                        backgroundColor:
                          "#f8fafc",
                        color:
                          "#0f172a",
                      }}
                      onFocus={(event) => {
                        event.currentTarget.style.borderColor =
                          "#2563eb";
                        event.currentTarget.style.boxShadow =
                          "0 0 0 3px rgba(37,99,235,0.10)";
                        event.currentTarget.style.backgroundColor =
                          "white";
                      }}
                      onBlur={(event) => {
                        event.currentTarget.style.borderColor =
                          "#cbd5e1";
                        event.currentTarget.style.boxShadow =
                          "none";
                        event.currentTarget.style.backgroundColor =
                          "#f8fafc";
                      }}
                    />

                    {/* FILE UPLOAD */}
                    <div
                      style={{
                        marginTop:
                          "15px",
                        padding:
                          "18px",
                        border:
                          "2px dashed #93c5fd",
                        borderRadius:
                          "14px",
                        backgroundColor:
                          "#f8fbff",
                        textAlign:
                          "center",
                      }}
                    >
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius:
                            "12px",
                          backgroundColor:
                            "#dbeafe",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          margin:
                            "0 auto 10px",
                          fontSize:
                            "19px",
                        }}
                      >
                        📎
                      </div>

                      <p
                        style={{
                          margin:
                            "0 0 5px",
                          fontWeight:
                            "800",
                          color:
                            "#1e40af",
                          fontSize:
                            "14px",
                        }}
                      >
                        Attach your work
                      </p>

                      <p
                        style={{
                          margin:
                            "0 0 14px",
                          color:
                            "#64748b",
                          fontSize:
                            "12px",
                          lineHeight:
                            "1.5",
                        }}
                      >
                        Upload a PDF, Word
                        document, image, or
                        other required file.
                      </p>

                      <input
                        type="file"
                        onChange={(
                          event
                        ) =>
                          handleFileChange(
                            assignment.id,
                            event
                              .target
                              .files[0]
                          )
                        }
                        style={{
                          width:
                            "100%",
                          boxSizing:
                            "border-box",
                          padding:
                            "9px",
                          backgroundColor:
                            "white",
                          border:
                            "1px solid #cbd5e1",
                          borderRadius:
                            "8px",
                          fontSize:
                            "12px",
                        }}
                      />

                      {files[
                        assignment.id
                      ] && (
                        <div
                          style={{
                            marginTop:
                              "12px",
                            padding:
                              "10px 12px",
                            backgroundColor:
                              "#eff6ff",
                            borderRadius:
                              "8px",
                            color:
                              "#1e40af",
                            fontSize:
                              "12px",
                            textAlign:
                              "left",
                            overflowWrap:
                              "anywhere",
                          }}
                        >
                          📎{" "}
                          <strong>
                            Selected:
                          </strong>{" "}
                          {
                            files[
                              assignment.id
                            ].name
                          }
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        submitAssignment(
                          assignment.id
                        )
                      }
                      disabled={
                        submittingId ===
                        assignment.id
                      }
                      style={{
                        width: "100%",
                        marginTop:
                          "15px",
                        background:
                          submittingId ===
                          assignment.id
                            ? "#94a3b8"
                            : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                        color: "white",
                        border: "none",
                        padding:
                          "13px 20px",
                        borderRadius:
                          "10px",
                        cursor:
                          submittingId ===
                          assignment.id
                            ? "not-allowed"
                            : "pointer",
                        fontSize:
                          "14px",
                        fontWeight:
                          "800",
                        boxShadow:
                          submittingId ===
                          assignment.id
                            ? "none"
                            : "0 8px 18px rgba(37,99,235,0.22)",
                        transition:
                          "all 0.2s ease",
                      }}
                      onMouseEnter={(
                        event
                      ) => {
                        if (
                          submittingId !==
                          assignment.id
                        ) {
                          event.currentTarget.style.transform =
                            "translateY(-1px)";
                          event.currentTarget.style.boxShadow =
                            "0 11px 22px rgba(37,99,235,0.30)";
                        }
                      }}
                      onMouseLeave={(
                        event
                      ) => {
                        event.currentTarget.style.transform =
                          "translateY(0)";
                        event.currentTarget.style.boxShadow =
                          submittingId ===
                          assignment.id
                            ? "none"
                            : "0 8px 18px rgba(37,99,235,0.22)";
                      }}
                    >
                      {submittingId ===
                      assignment.id
                        ? "Submitting..."
                        : "Submit Assignment →"}
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    )}
  </main>

  <style>
    {`
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
      }

      @media (max-width: 700px) {
        header {
          padding-left: 18px !important;
          padding-right: 18px !important;
        }

        main {
          padding-left: 15px !important;
          padding-right: 15px !important;
        }

        section {
          border-radius: 18px !important;
        }

        .student-name {
          display: none !important;
        }
      }

      @media (min-width: 701px) {
        .student-name {
          display: block !important;
        }
      }

      textarea::placeholder {
        color: #94a3b8;
      }

      input[type="file"] {
        cursor: pointer;
      }

      input[type="file"]::file-selector-button {
        border: none;
        background: #2563eb;
        color: white;
        padding: 8px 12px;
        border-radius: 7px;
        margin-right: 10px;
        cursor: pointer;
        font-weight: 600;
      }
    `}
  </style>
</div>


);
}

export default StudentDashboard;
