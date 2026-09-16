
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const tableHeaderStyle = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "13px",
  color: "#374151",
};

const tableCellStyle = {
  padding: "13px 12px",
  borderBottom: "1px solid #f1f5f9",
  fontSize: "14px",
  color: "#374151",
};
function TeacherDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [creatingResult, setCreatingResult] = useState(false);
  const [publishingResultId, setPublishingResultId] = useState(null);

  const [gradingId, setGradingId] = useState(null);
  const [scores, setScores] = useState({});
  const [feedback, setFeedback] = useState({});

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [dueDate, setDueDate] = useState("");
  const [resultStudentId, setResultStudentId] = useState("");
  const [resultSubjectId, setResultSubjectId] = useState("");
  const [resultSession, setResultSession] = useState("2025/2026");
  const [resultTerm, setResultTerm] = useState("First Term");
  const [resultScore, setResultScore] = useState("");

 const token = localStorage.getItem("token");

let teacherName = "Teacher";

try {
  const payload = JSON.parse(atob(token.split(".")[1]));
  teacherName =
    payload.firstName ||
    payload.name ||
    payload.username ||
    "Teacher";
} catch (error) {
  console.log("Could not read teacher name from token.");
}
  const loadAssignments = async () => {
    try {
      setLoading(true);

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
      console.error("Teacher dashboard error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      setCoursesLoading(true);

      const response = await fetch(`${API_URL}/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load courses"
        );
      }

      setCourses(data.courses || []);
    } catch (error) {
      console.error("Load courses error:", error);
      setError(error.message);
    } finally {
      setCoursesLoading(false);
    }
  };

    const loadStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load students"
        );
      }

      setStudents(data.students || []);
    } catch (error) {
      console.error("Load students error:", error);
      setError(error.message);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}/subjects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load subjects"
        );
      }

      setSubjects(data.subjects || []);
    } catch (error) {
      console.error("Load subjects error:", error);
      setError(error.message);
    }
  };

    const loadResults = async () => {
    try {
      setResultsLoading(true);

      const response = await fetch(`${API_URL}/results/teacher`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load results"
        );
      }

      setResults(data.results || []);
    } catch (error) {
      console.error("Load results error:", error);
      setError(error.message);
    } finally {
      setResultsLoading(false);
    }
  };
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setCoursesLoading(false);
      setError("Please log in first.");
      return;
    }
    
        loadAssignments();
        loadCourses();
        loadStudents();
        loadSubjects();
        loadResults();
  }, []);

 
  const createAssignment = async (event) => {
    event.preventDefault();

    setCreating(true);
    setMessage("");
    setError("");

    try {
      if (!title.trim()) {
        throw new Error("Assignment title is required.");
      }

      if (!courseId) {
        throw new Error("Please select a course.");
      }

      const response = await fetch(`${API_URL}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          courseId: Number(courseId),
          maxScore: Number(maxScore),
          dueDate: dueDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create assignment"
        );
      }

      setMessage("Assignment created successfully.");

      setTitle("");
      setDescription("");
      setCourseId("");
      setMaxScore("100");
      setDueDate("");

      setShowCreateForm(false);

      await loadAssignments();
    } catch (error) {
      console.error("Create assignment error:", error);
      setError(error.message);
    } finally {
      setCreating(false);
    }
  };
    const createResult = async (event) => {
    event.preventDefault();

    setCreatingResult(true);
    setMessage("");
    setError("");

    try {
      if (!resultStudentId) {
        throw new Error("Please select a student.");
      }

      if (!resultSubjectId) {
        throw new Error("Please select a subject.");
      }

      if (!resultSession.trim()) {
        throw new Error("Session is required.");
      }

      if (!resultTerm) {
        throw new Error("Please select a term.");
      }

      if (
        resultScore === "" ||
        resultScore === null ||
        resultScore === undefined
      ) {
        throw new Error("Please enter a score.");
      }

      const numericScore = Number(resultScore);

      if (
        Number.isNaN(numericScore) ||
        numericScore < 0 ||
        numericScore > 100
      ) {
        throw new Error("Score must be between 0 and 100.");
      }

      const response = await fetch(`${API_URL}/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: Number(resultStudentId),
          subjectId: Number(resultSubjectId),
          session: resultSession.trim(),
          term: resultTerm,
          score: numericScore,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create result"
        );
      }

      setMessage("Result entered successfully.");

      setResultStudentId("");
      setResultSubjectId("");
      setResultScore("");

      await loadResults();
    } catch (error) {
      console.error("Create result error:", error);
      setError(error.message);
    } finally {
      setCreatingResult(false);
    }
  };

  const publishResult = async (resultId) => {
  setPublishingResultId(resultId);
  setMessage("");
  setError("");

  try {
    const response = await fetch(
      `${API_URL}/results/${resultId}/publish`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to publish result"
      );
    }

    setMessage("Result published successfully.");

    await loadResults();
  } catch (error) {
    console.error("Publish result error:", error);
    setError(error.message);
  } finally {
    setPublishingResultId(null);
  }
};
  const gradeSubmission = async (submissionId) => {
    try {
      setGradingId(submissionId);
      setMessage("");
      setError("");

      const score = scores[submissionId];
      const submissionFeedback = feedback[submissionId] || "";

      if (
        score === undefined ||
        score === "" ||
        score === null
      ) {
        setError("Please enter a score before grading.");
        setGradingId(null);
        return;
      }

      const response = await fetch(
        `${API_URL}/submissions/${submissionId}/grade`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            score: Number(score),
            feedback: submissionFeedback,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to grade submission"
        );
      }

      setMessage("Submission graded successfully.");

      await loadAssignments();
    } catch (error) {
      console.error("Grade submission error:", error);
      setError(error.message);
    } finally {
      setGradingId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2>Loading teacher dashboard...</h2>
      </div>
    );
  }

  return (
    <div
      className="portal-page portal-teacher"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          backgroundColor: "#166534",
          color: "white",
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Smart School</h1>

          <p style={{ margin: "5px 0 0" }}>
            Teacher Dashboard
          </p>
        </div>

        <button
          onClick={logout}
          style={{
            backgroundColor: "white",
            color: "#166534",
            border: "none",
            padding: "10px 18px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>
      </header>
      
      
      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        {/* Dashboard Overview */}
<section style={{ marginBottom: "32px" }}>
  {/* Welcome row */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: "20px",
      gap: "20px",
      flexWrap: "wrap",
    }}
  >
    <div>
      <h2
        style={{
          margin: 0,
          fontSize: "26px",
          fontWeight: "700",
          color: "#111827",
        }}
      >
        Welcome back, {teacherName}
      </h2>

      <p
        style={{
          margin: "6px 0 0",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        Here’s what is happening across your classes today.
      </p>
    </div>

    <div
      style={{
        fontSize: "13px",
        color: "#6b7280",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        padding: "9px 14px",
        borderRadius: "8px",
      }}
    >
      Teacher Overview
    </div>
  </div>
{/* Stats */}
<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "18px",
  }}
>
  {/* Students */}
  <div
    style={{
      background:
        "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
      border: "1px solid #bbf7d0",
      borderRadius: "14px",
      padding: "20px",
      boxShadow: "0 4px 12px rgba(22, 101, 52, 0.06)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        width: "85px",
        height: "85px",
        borderRadius: "50%",
        backgroundColor: "#dcfce7",
        right: "-30px",
        top: "-30px",
        opacity: 0.8,
      }}
    />

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
      }}
    >
      <span
        style={{
          fontSize: "13px",
          fontWeight: "600",
          color: "#166534",
        }}
      >
        Students
      </span>

      <span
        style={{
          fontSize: "12px",
          color: "#166534",
          backgroundColor: "#dcfce7",
          padding: "5px 9px",
          borderRadius: "20px",
          fontWeight: "600",
        }}
      >
        Active
      </span>
    </div>

    <div
      style={{
        marginTop: "14px",
        fontSize: "30px",
        fontWeight: "700",
        color: "#14532d",
        position: "relative",
      }}
    >
      {students.length}
    </div>

    <p
      style={{
        margin: "5px 0 0",
        fontSize: "13px",
        color: "#4b7c5a",
        position: "relative",
      }}
    >
      Students in the system
    </p>
  </div>

  {/* Courses */}
  <div
    style={{
      background:
        "linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)",
      border: "1px solid #bfdbfe",
      borderRadius: "14px",
      padding: "20px",
      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.06)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        width: "85px",
        height: "85px",
        borderRadius: "50%",
        backgroundColor: "#dbeafe",
        right: "-30px",
        top: "-30px",
        opacity: 0.8,
      }}
    />

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
      }}
    >
      <span
        style={{
          fontSize: "13px",
          fontWeight: "600",
          color: "#1d4ed8",
        }}
      >
        Courses
      </span>

      <span
        style={{
          fontSize: "12px",
          color: "#1d4ed8",
          backgroundColor: "#dbeafe",
          padding: "5px 9px",
          borderRadius: "20px",
          fontWeight: "600",
        }}
      >
        Teaching
      </span>
    </div>

    <div
      style={{
        marginTop: "14px",
        fontSize: "30px",
        fontWeight: "700",
        color: "#1e3a8a",
        position: "relative",
      }}
    >
      {courses.length}
    </div>

    <p
      style={{
        margin: "5px 0 0",
        fontSize: "13px",
        color: "#4b6b9b",
        position: "relative",
      }}
    >
      Available courses
    </p>
  </div>

  {/* Assignments */}
  <div
    style={{
      background:
        "linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)",
      border: "1px solid #fde68a",
      borderRadius: "14px",
      padding: "20px",
      boxShadow: "0 4px 12px rgba(202, 138, 4, 0.06)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        width: "85px",
        height: "85px",
        borderRadius: "50%",
        backgroundColor: "#fef3c7",
        right: "-30px",
        top: "-30px",
        opacity: 0.8,
      }}
    />

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
      }}
    >
      <span
        style={{
          fontSize: "13px",
          fontWeight: "600",
          color: "#a16207",
        }}
      >
        Assignments
      </span>

      <span
        style={{
          fontSize: "12px",
          color: "#92400e",
          backgroundColor: "#fef3c7",
          padding: "5px 9px",
          borderRadius: "20px",
          fontWeight: "600",
        }}
      >
        Created
      </span>
    </div>

    <div
      style={{
        marginTop: "14px",
        fontSize: "30px",
        fontWeight: "700",
        color: "#713f12",
        position: "relative",
      }}
    >
      {assignments.length}
    </div>

    <p
      style={{
        margin: "5px 0 0",
        fontSize: "13px",
        color: "#92734a",
        position: "relative",
      }}
    >
      Total assignments
    </p>
  </div>

  {/* Results */}
  <div
    style={{
      background:
        "linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)",
      border: "1px solid #ddd6fe",
      borderRadius: "14px",
      padding: "20px",
      boxShadow: "0 4px 12px rgba(124, 58, 237, 0.06)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        width: "85px",
        height: "85px",
        borderRadius: "50%",
        backgroundColor: "#ede9fe",
        right: "-30px",
        top: "-30px",
        opacity: 0.8,
      }}
    />

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
      }}
    >
      <span
        style={{
          fontSize: "13px",
          fontWeight: "600",
          color: "#6d28d9",
        }}
      >
        Results
      </span>

      <span
        style={{
          fontSize: "12px",
          color: "#6d28d9",
          backgroundColor: "#ede9fe",
          padding: "5px 9px",
          borderRadius: "20px",
          fontWeight: "600",
        }}
      >
        Academic
      </span>
    </div>

    <div
      style={{
        marginTop: "14px",
        fontSize: "30px",
        fontWeight: "700",
        color: "#4c1d95",
        position: "relative",
      }}
    >
      {results.length}
    </div>

    <p
      style={{
        margin: "5px 0 0",
        fontSize: "13px",
        color: "#75649a",
        position: "relative",
      }}
    >
      Recorded results
    </p>
  </div>
</div>
</section>
        {/* Result Management */}
        <section
          style={{
            backgroundColor: "white",
            padding: "28px",
            borderRadius: "12px",
            marginBottom: "30px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "20px",
              flexWrap: "wrap",
              marginBottom: "24px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#111827",
                  fontSize: "24px",
                }}
              >
                Results
              </h2>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#6b7280",
                }}
              >
                Enter and manage students' academic results.
              </p>
            </div>
          </div>

          {/* Summary cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "14px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                padding: "18px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  marginBottom: "6px",
                }}
              >
                Total Results
              </div>

              <strong
                style={{
                  fontSize: "24px",
                  color: "#111827",
                }}
              >
                {results.length}
              </strong>
            </div>

            <div
              style={{
                padding: "18px",
                backgroundColor: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#92400e",
                  marginBottom: "6px",
                }}
              >
                Draft
              </div>

              <strong
                style={{
                  fontSize: "24px",
                  color: "#92400e",
                }}
              >
                {
                  results.filter(
                    (result) => result.status === "DRAFT"
                  ).length
                }
              </strong>
            </div>

            <div
              style={{
                padding: "18px",
                backgroundColor: "#ecfdf5",
                border: "1px solid #bbf7d0",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#166534",
                  marginBottom: "6px",
                }}
              >
                Published
              </div>

              <strong
                style={{
                  fontSize: "24px",
                  color: "#166534",
                }}
              >
                {
                  results.filter(
                    (result) =>
                      result.status === "PUBLISHED"
                  ).length
                }
              </strong>
            </div>
          </div>

          {/* Enter Result */}
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: "24px",
            }}
          >
            <h3
              style={{
                margin: "0 0 18px",
                color: "#111827",
              }}
            >
              Enter Result
            </h3>

            <form onSubmit={createResult}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(190px, 1fr))",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      fontSize: "14px",
                      marginBottom: "7px",
                      color: "#374151",
                    }}
                  >
                    Student
                  </label>

                  <select
                    value={resultStudentId}
                    onChange={(event) =>
                      setResultStudentId(event.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "11px 12px",
                      borderRadius: "7px",
                      border: "1px solid #d1d5db",
                      backgroundColor: "white",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">
                      Select student
                    </option>

                    {students.map((student) => {
  const firstName =
    student.user?.firstName ||
    student.firstName ||
    "";

  const lastName =
    student.user?.lastName ||
    student.lastName ||
    "";

  const fullName =
    `${firstName} ${lastName}`.trim();

  return (
    <option
      key={student.id}
      value={student.id}
    >
      {fullName || student.user?.email || `Student #${student.id}`}
    </option>
  );
})}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      fontSize: "14px",
                      marginBottom: "7px",
                      color: "#374151",
                    }}
                  >
                    Subject
                  </label>

                  <select
                    value={resultSubjectId}
                    onChange={(event) =>
                      setResultSubjectId(event.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "11px 12px",
                      borderRadius: "7px",
                      border: "1px solid #d1d5db",
                      backgroundColor: "white",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">
                      Select subject
                    </option>

                    {subjects.map((subject) => (
                      <option
                        key={subject.id}
                        value={subject.id}
                      >
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      fontSize: "14px",
                      marginBottom: "7px",
                      color: "#374151",
                    }}
                  >
                    Session
                  </label>

                  <input
                    type="text"
                    value={resultSession}
                    onChange={(event) =>
                      setResultSession(event.target.value)
                    }
                    placeholder="2025/2026"
                    style={{
                      width: "100%",
                      padding: "11px 12px",
                      borderRadius: "7px",
                      border: "1px solid #d1d5db",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      fontSize: "14px",
                      marginBottom: "7px",
                      color: "#374151",
                    }}
                  >
                    Term
                  </label>

                  <select
                    value={resultTerm}
                    onChange={(event) =>
                      setResultTerm(event.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "11px 12px",
                      borderRadius: "7px",
                      border: "1px solid #d1d5db",
                      backgroundColor: "white",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="First Term">
                      First Term
                    </option>
                    <option value="Second Term">
                      Second Term
                    </option>
                    <option value="Third Term">
                      Third Term
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      fontSize: "14px",
                      marginBottom: "7px",
                      color: "#374151",
                    }}
                  >
                    Score
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={resultScore}
                    onChange={(event) =>
                      setResultScore(event.target.value)
                    }
                    placeholder="0 - 100"
                    style={{
                      width: "100%",
                      padding: "11px 12px",
                      borderRadius: "7px",
                      border: "1px solid #d1d5db",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingResult}
                style={{
                  marginTop: "20px",
                  backgroundColor: creatingResult
                    ? "#9ca3af"
                    : "#166534",
                  color: "white",
                  border: "none",
                  padding: "11px 20px",
                  borderRadius: "7px",
                  cursor: creatingResult
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: "600",
                }}
              >
                {creatingResult
                  ? "Saving Result..."
                  : "Enter Result"}
              </button>
            </form>
          </div>

          {/* Results list */}
          <div
            style={{
              marginTop: "30px",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "24px",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px",
                color: "#111827",
              }}
            >
              Recent Results
            </h3>

            {resultsLoading ? (
              <p style={{ color: "#6b7280" }}>
                Loading results...
              </p>
            ) : results.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  color: "#6b7280",
                }}
              >
                No results entered yet.
              </div>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: "700px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <th style={tableHeaderStyle}>
                        Student
                      </th>

                      <th style={tableHeaderStyle}>
                        Subject
                      </th>

                      <th style={tableHeaderStyle}>
                        Score
                      </th>

                      <th style={tableHeaderStyle}>
                        Grade
                      </th>

                      <th style={tableHeaderStyle}>
                        Status
                      </th>

                      <th style={tableHeaderStyle}>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {results.map((result) => (
                      <tr key={result.id}>
                        <td style={tableCellStyle}>
                          {result.student?.user?.firstName ||
                            result.student?.firstName ||
                            ""}{" "}
                          {result.student?.user?.lastName ||
                            result.student?.lastName ||
                            ""}
                        </td>

                        <td style={tableCellStyle}>
                          {result.subject?.name ||
                            "Unknown subject"}
                        </td>

                        <td style={tableCellStyle}>
                          {result.score}
                        </td>

                        <td style={tableCellStyle}>
                          <strong>
                            {result.grade}
                          </strong>
                        </td>

                        <td style={tableCellStyle}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "5px 9px",
                              borderRadius: "999px",
                              fontSize: "12px",
                              fontWeight: "600",
                              backgroundColor:
                                result.status ===
                                "PUBLISHED"
                                  ? "#dcfce7"
                                  : "#fef3c7",
                              color:
                                result.status ===
                                "PUBLISHED"
                                  ? "#166534"
                                  : "#92400e",
                            }}
                          >
                            {result.status}
                          </span>
                        </td>

                        <td style={tableCellStyle}>
                          {result.status ===
                          "DRAFT" ? (
                            <button
                              onClick={() =>
                                publishResult(
                                  result.id
                                )
                              }
                              disabled={
                                publishingResultId ===
                                result.id
                              }
                              style={{
                                backgroundColor:
                                  "#166534",
                                color: "white",
                                border: "none",
                                padding:
                                  "7px 12px",
                                borderRadius: "6px",
                                cursor:
                                  publishingResultId ===
                                  result.id
                                    ? "not-allowed"
                                    : "pointer",
                                fontWeight: "600",
                                fontSize: "12px",
                              }}
                            >
                              {publishingResultId ===
                              result.id
                                ? "Publishing..."
                                : "Publish"}
                            </button>
                          ) : (
                            <span
                              style={{
                                color: "#166534",
                                fontSize: "13px",
                              }}
                            >
                              Published
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>


                {/* Assignments */}
        <section
          style={{
            backgroundColor: "white",
            padding: "28px",
            borderRadius: "12px",
            marginBottom: "30px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          {/* Assignment Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "20px",
              flexWrap: "wrap",
              marginBottom: "24px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#111827",
                  fontSize: "24px",
                }}
              >
                Assignments
              </h2>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#6b7280",
                }}
              >
                Create assignments, review submissions,
                and grade student work.
              </p>
            </div>

            <button
              onClick={() =>
                setShowCreateForm(!showCreateForm)
              }
              style={{
                backgroundColor: "#166534",
                color: "white",
                border: "none",
                padding: "11px 18px",
                borderRadius: "7px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {showCreateForm
                ? "Cancel"
                : "+ Create Assignment"}
            </button>
          </div>

          {/* Assignment Summary */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "14px",
              marginBottom: "28px",
            }}
          >
            {/* Total */}
            <div
              style={{
                padding: "18px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  marginBottom: "6px",
                }}
              >
                Total Assignments
              </div>

              <strong
                style={{
                  fontSize: "24px",
                  color: "#111827",
                }}
              >
                {assignments.length}
              </strong>
            </div>

            {/* Active */}
            <div
              style={{
                padding: "18px",
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#1d4ed8",
                  marginBottom: "6px",
                }}
              >
                Active
              </div>

              <strong
                style={{
                  fontSize: "24px",
                  color: "#1d4ed8",
                }}
              >
                {
                  assignments.filter(
                    (assignment) =>
                      !assignment.dueDate ||
                      new Date(assignment.dueDate) >=
                        new Date()
                  ).length
                }
              </strong>
            </div>

            {/* Submissions */}
            <div
              style={{
                padding: "18px",
                backgroundColor: "#f5f3ff",
                border: "1px solid #ddd6fe",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#6d28d9",
                  marginBottom: "6px",
                }}
              >
                Submissions
              </div>

              <strong
                style={{
                  fontSize: "24px",
                  color: "#6d28d9",
                }}
              >
                {assignments.reduce(
                  (total, assignment) =>
                    total +
                    (assignment.submissions?.length || 0),
                  0
                )}
              </strong>
            </div>

            {/* Pending */}
            <div
              style={{
                padding: "18px",
                backgroundColor: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#92400e",
                  marginBottom: "6px",
                }}
              >
                Pending Grading
              </div>

              <strong
                style={{
                  fontSize: "24px",
                  color: "#92400e",
                }}
              >
                {assignments.reduce(
                  (total, assignment) =>
                    total +
                    (assignment.submissions?.filter(
                      (submission) =>
                        submission.status !== "GRADED"
                    ).length || 0),
                  0
                )}
              </strong>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div
              style={{
                backgroundColor: "#dcfce7",
                color: "#166534",
                padding: "13px 15px",
                borderRadius: "8px",
                marginBottom: "20px",
                border: "1px solid #bbf7d0",
              }}
            >
              {message}
            </div>
          )}

          {error && (
            <div
              style={{
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                padding: "13px 15px",
                borderRadius: "8px",
                marginBottom: "20px",
                border: "1px solid #fecaca",
              }}
            >
              {error}
            </div>
          )}

          {/* Create Assignment */}
          {showCreateForm && (
            <form
              onSubmit={createAssignment}
              style={{
                backgroundColor: "#f8fafc",
                padding: "24px",
                borderRadius: "10px",
                marginBottom: "28px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "#111827",
                  }}
                >
                  Create Assignment
                </h3>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#6b7280",
                    fontSize: "14px",
                  }}
                >
                  Add coursework for one of your courses.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                {/* Title */}
                <div
                  style={{
                    gridColumn: "1 / -1",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      fontSize: "14px",
                      marginBottom: "7px",
                      color: "#374151",
                    }}
                  >
                    Assignment Title
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    placeholder="e.g. Algebra Practice Test"
                    required
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "11px 12px",
                      borderRadius: "7px",
                      border: "1px solid #d1d5db",
                    }}
                  />
                </div>

                {/* Course */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      fontSize: "14px",
                      marginBottom: "7px",
                      color: "#374151",
                    }}
                  >
                    Course
                  </label>

                  {coursesLoading ? (
                    <div
                      style={{
                        padding: "11px",
                        color: "#6b7280",
                      }}
                    >
                      Loading courses...
                    </div>
                  ) : courses.length === 0 ? (
                    <div
                      style={{
                        backgroundColor: "#fff7ed",
                        color: "#9a3412",
                        padding: "11px",
                        borderRadius: "7px",
                        fontSize: "14px",
                      }}
                    >
                      No courses available.
                    </div>
                  ) : (
                    <select
                      value={courseId}
                      onChange={(event) =>
                        setCourseId(event.target.value)
                      }
                      required
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "11px 12px",
                        borderRadius: "7px",
                        border: "1px solid #d1d5db",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="">
                        Select a course
                      </option>

                      {courses.map((course) => (
                        <option
                          key={course.id}
                          value={course.id}
                        >
                          {course.title} ({course.code})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Maximum Score */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      fontSize: "14px",
                      marginBottom: "7px",
                      color: "#374151",
                    }}
                  >
                    Maximum Score
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={maxScore}
                    onChange={(event) =>
                      setMaxScore(event.target.value)
                    }
                    required
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "11px 12px",
                      borderRadius: "7px",
                      border: "1px solid #d1d5db",
                    }}
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      fontSize: "14px",
                      marginBottom: "7px",
                      color: "#374151",
                    }}
                  >
                    Due Date
                  </label>

                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(event) =>
                      setDueDate(event.target.value)
                    }
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "11px 12px",
                      borderRadius: "7px",
                      border: "1px solid #d1d5db",
                    }}
                  />
                </div>

                {/* Description */}
                <div
                  style={{
                    gridColumn: "1 / -1",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      fontSize: "14px",
                      marginBottom: "7px",
                      color: "#374151",
                    }}
                  >
                    Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Explain what students need to do..."
                    rows="4"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "11px 12px",
                      borderRadius: "7px",
                      border: "1px solid #d1d5db",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <button
                  type="submit"
                  disabled={
                    creating || courses.length === 0
                  }
                  style={{
                    backgroundColor:
                      creating || courses.length === 0
                        ? "#9ca3af"
                        : "#166534",
                    color: "white",
                    border: "none",
                    padding: "11px 20px",
                    borderRadius: "7px",
                    cursor:
                      creating ||
                      courses.length === 0
                        ? "not-allowed"
                        : "pointer",
                    fontWeight: "600",
                  }}
                >
                  {creating
                    ? "Creating..."
                    : "Create Assignment"}
                </button>
              </div>
            </form>
          )}

          {/* Assignment List */}
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#111827",
                }}
              >
                My Assignments
              </h3>

              <span
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                {assignments.length} assignment
                {assignments.length !== 1 ? "s" : ""}
              </span>
            </div>

            {assignments.length === 0 ? (
              <div
                style={{
                  padding: "35px 20px",
                  textAlign: "center",
                  backgroundColor: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px dashed #d1d5db",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 8px",
                    color: "#374151",
                  }}
                >
                  No assignments yet
                </h3>

                <p
                  style={{
                    margin: 0,
                    color: "#6b7280",
                  }}
                >
                  Create your first assignment using
                  the button above.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "18px",
                }}
              >
                {assignments.map((assignment) => {
                  const submissionCount =
                    assignment.submissions?.length || 0;

                  const pendingCount =
                    assignment.submissions?.filter(
                      (submission) =>
                        submission.status !== "GRADED"
                    ).length || 0;

                  const isOverdue =
                    assignment.dueDate &&
                    new Date(assignment.dueDate) <
                      new Date();

                  return (
                    <div
                      key={assignment.id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        overflow: "hidden",
                        backgroundColor: "white",
                      }}
                    >
                      {/* Assignment Card Header */}
                      <div
                        style={{
                          padding: "18px",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems: "flex-start",
                            gap: "12px",
                          }}
                        >
                          <div>
                            <h3
                              style={{
                                margin: 0,
                                color: "#111827",
                                fontSize: "18px",
                              }}
                            >
                              {assignment.title}
                            </h3>

                            <p
                              style={{
                                margin:
                                  "6px 0 0",
                                color: "#166534",
                                fontSize:
                                  "14px",
                                fontWeight:
                                  "600",
                              }}
                            >
                              {assignment.course
                                ?.title ||
                                "Unknown course"}
                            </p>
                          </div>

                          <span
                            style={{
                              padding:
                                "5px 9px",
                              borderRadius:
                                "999px",
                              fontSize:
                                "12px",
                              fontWeight:
                                "600",
                              backgroundColor:
                                isOverdue
                                  ? "#fee2e2"
                                  : "#dcfce7",
                              color:
                                isOverdue
                                  ? "#991b1b"
                                  : "#166534",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {isOverdue
                              ? "Overdue"
                              : "Active"}
                          </span>
                        </div>

                        <p
                          style={{
                            margin:
                              "14px 0 0",
                            color: "#6b7280",
                            fontSize:
                              "14px",
                            lineHeight:
                              "1.5",
                          }}
                        >
                          {assignment.description ||
                            "No description provided."}
                        </p>
                      </div>

                      {/* Assignment Details */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(2, 1fr)",
                          backgroundColor:
                            "#f8fafc",
                          borderBottom:
                            "1px solid #e5e7eb",
                        }}
                      >
                        <div
                          style={{
                            padding: "13px 16px",
                            borderRight:
                              "1px solid #e5e7eb",
                          }}
                        >
                          <div
                            style={{
                              fontSize:
                                "12px",
                              color:
                                "#6b7280",
                            }}
                          >
                            Maximum Score
                          </div>

                          <strong
                            style={{
                              display:
                                "block",
                              marginTop:
                                "4px",
                              color:
                                "#111827",
                            }}
                          >
                            {assignment.maxScore}
                          </strong>
                        </div>

                        <div
                          style={{
                            padding: "13px 16px",
                          }}
                        >
                          <div
                            style={{
                              fontSize:
                                "12px",
                              color:
                                "#6b7280",
                            }}
                          >
                            Due Date
                          </div>

                          <strong
                            style={{
                              display:
                                "block",
                              marginTop:
                                "4px",
                              color:
                                "#111827",
                              fontSize:
                                "13px",
                            }}
                          >
                            {assignment.dueDate
                              ? new Date(
                                  assignment.dueDate
                                ).toLocaleDateString()
                              : "No due date"}
                          </strong>
                        </div>
                      </div>

                      {/* Submission Summary */}
                      <div
                        style={{
                          padding: "15px 16px",
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "center",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              color:
                                "#111827",
                            }}
                          >
                            Submissions
                          </strong>

                          <span
                            style={{
                              marginLeft:
                                "8px",
                              color:
                                "#6b7280",
                              fontSize:
                                "14px",
                            }}
                          >
                            {submissionCount}
                          </span>
                        </div>

                        {pendingCount > 0 && (
                          <span
                            style={{
                              backgroundColor:
                                "#fef3c7",
                              color:
                                "#92400e",
                              padding:
                                "5px 9px",
                              borderRadius:
                                "999px",
                              fontSize:
                                "12px",
                              fontWeight:
                                "600",
                            }}
                          >
                            {pendingCount} pending
                          </span>
                        )}
                      </div>

                      {/* Submissions */}
                      {submissionCount > 0 && (
                        <div
                          style={{
                            borderTop:
                              "1px solid #e5e7eb",
                            padding:
                              "16px",
                          }}
                        >
                          <h4
                            style={{
                              margin:
                                "0 0 12px",
                              color:
                                "#374151",
                            }}
                          >
                            Student Submissions
                          </h4>

                          <div
                            style={{
                              display:
                                "flex",
                              flexDirection:
                                "column",
                              gap: "12px",
                            }}
                          >
                            {assignment.submissions.map(
                              (submission) => (
                                <div
                                  key={
                                    submission.id
                                  }
                                  style={{
                                    padding:
                                      "14px",
                                    backgroundColor:
                                      "#f8fafc",
                                    border:
                                      "1px solid #e5e7eb",
                                    borderRadius:
                                      "8px",
                                  }}
                                >
                                  {/* Student */}
                                  <div
                                    style={{
                                      display:
                                        "flex",
                                      justifyContent:
                                        "space-between",
                                      gap:
                                        "10px",
                                      alignItems:
                                        "flex-start",
                                    }}
                                  >
                                    <div>
                                      <strong
                                        style={{
                                          color:
                                            "#111827",
                                        }}
                                      >
                                        {submission
                                          .student
                                          ?.user
                                          ? `${submission.student.user.firstName} ${submission.student.user.lastName}`
                                          : "Unknown student"}
                                      </strong>

                                      <div
                                        style={{
                                          marginTop:
                                            "3px",
                                          color:
                                            "#6b7280",
                                          fontSize:
                                            "12px",
                                        }}
                                      >
                                        {submission
                                          .student
                                          ?.user
                                          ?.email ||
                                          "No email"}
                                      </div>
                                    </div>

                                    <span
                                      style={{
                                        padding:
                                          "4px 8px",
                                        borderRadius:
                                          "999px",
                                        fontSize:
                                          "11px",
                                        fontWeight:
                                          "600",
                                        backgroundColor:
                                          submission.status ===
                                          "GRADED"
                                            ? "#dcfce7"
                                            : "#fef3c7",
                                        color:
                                          submission.status ===
                                          "GRADED"
                                            ? "#166534"
                                            : "#92400e",
                                      }}
                                    >
                                      {
                                        submission.status
                                      }
                                    </span>
                                  </div>

                                  <div
                                    style={{
                                      marginTop:
                                        "10px",
                                      fontSize:
                                        "12px",
                                      color:
                                        "#6b7280",
                                    }}
                                  >
                                    Submitted:{" "}
                                    {submission.submittedAt
                                      ? new Date(
                                          submission.submittedAt
                                        ).toLocaleString()
                                      : "Unknown"}
                                  </div>

                                  {/* Answer */}
                                  <div
                                    style={{
                                      marginTop:
                                        "12px",
                                      padding:
                                        "12px",
                                      backgroundColor:
                                        "white",
                                      borderRadius:
                                        "7px",
                                      border:
                                        "1px solid #e5e7eb",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize:
                                          "12px",
                                        fontWeight:
                                          "600",
                                        color:
                                          "#374151",
                                        marginBottom:
                                          "6px",
                                      }}
                                    >
                                      Student Answer
                                    </div>

                                    <div
                                      style={{
                                        color:
                                          "#555",
                                        lineHeight:
                                          "1.5",
                                        whiteSpace:
                                          "pre-wrap",
                                        fontSize:
                                          "14px",
                                      }}
                                    >
                                      {submission.content ||
                                        "No written answer."}
                                    </div>
                                  </div>

                                  {/* Graded */}
                                  {submission.status ===
                                  "GRADED" ? (
                                    <div
                                      style={{
                                        marginTop:
                                          "12px",
                                        padding:
                                          "12px",
                                        backgroundColor:
                                          "#ecfdf5",
                                        borderRadius:
                                          "7px",
                                        color:
                                          "#166534",
                                      }}
                                    >
                                      <strong>
                                        Score:
                                      </strong>{" "}
                                      {
                                        submission.score
                                      }{" "}
                                      /{" "}
                                      {
                                        assignment.maxScore
                                      }

                                      <div
                                        style={{
                                          marginTop:
                                            "5px",
                                        }}
                                      >
                                        <strong>
                                          Feedback:
                                        </strong>{" "}
                                        {submission.feedback ||
                                          "No feedback provided."}
                                      </div>
                                    </div>
                                  ) : (
                                    /* Grade Form */
                                    <div
                                      style={{
                                        marginTop:
                                          "12px",
                                        padding:
                                          "14px",
                                        backgroundColor:
                                          "#fff7ed",
                                        border:
                                          "1px solid #fed7aa",
                                        borderRadius:
                                          "7px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontWeight:
                                            "600",
                                          color:
                                            "#9a3412",
                                          marginBottom:
                                            "12px",
                                        }}
                                      >
                                        Grade Submission
                                      </div>

                                      <label
                                        style={{
                                          display:
                                            "block",
                                          fontSize:
                                            "13px",
                                          fontWeight:
                                            "600",
                                          marginBottom:
                                            "6px",
                                          color:
                                            "#374151",
                                        }}
                                      >
                                        Score
                                      </label>

                                      <input
                                        type="number"
                                        min="0"
                                        max={
                                          assignment.maxScore
                                        }
                                        value={
                                          scores[
                                            submission.id
                                          ] ?? ""
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          setScores({
                                            ...scores,
                                            [submission.id]:
                                              event
                                                .target
                                                .value,
                                          })
                                        }
                                        placeholder={`0-${assignment.maxScore}`}
                                        style={{
                                          width:
                                            "100%",
                                          boxSizing:
                                            "border-box",
                                          padding:
                                            "10px 11px",
                                          borderRadius:
                                            "6px",
                                          border:
                                            "1px solid #d1d5db",
                                          marginBottom:
                                            "10px",
                                        }}
                                      />

                                      <label
                                        style={{
                                          display:
                                            "block",
                                          fontSize:
                                            "13px",
                                          fontWeight:
                                            "600",
                                          marginBottom:
                                            "6px",
                                          color:
                                            "#374151",
                                        }}
                                      >
                                        Feedback
                                      </label>

                                      <textarea
                                        value={
                                          feedback[
                                            submission.id
                                          ] ?? ""
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          setFeedback({
                                            ...feedback,
                                            [submission.id]:
                                              event
                                                .target
                                                .value,
                                          })
                                        }
                                        placeholder="Enter feedback for the student"
                                        rows="3"
                                        style={{
                                          width:
                                            "100%",
                                          boxSizing:
                                            "border-box",
                                          padding:
                                            "10px 11px",
                                          borderRadius:
                                            "6px",
                                          border:
                                            "1px solid #d1d5db",
                                          resize:
                                            "vertical",
                                          marginBottom:
                                            "10px",
                                        }}
                                      />

                                      <button
                                        onClick={() =>
                                          gradeSubmission(
                                            submission.id
                                          )
                                        }
                                        disabled={
                                          gradingId ===
                                          submission.id
                                        }
                                        style={{
                                          backgroundColor:
                                            gradingId ===
                                            submission.id
                                              ? "#9ca3af"
                                              : "#166534",
                                          color:
                                            "white",
                                          border:
                                            "none",
                                          padding:
                                            "9px 15px",
                                          borderRadius:
                                            "6px",
                                          cursor:
                                            gradingId ===
                                            submission.id
                                              ? "not-allowed"
                                              : "pointer",
                                          fontWeight:
                                            "600",
                                          fontSize:
                                            "13px",
                                        }}
                                      >
                                        {gradingId ===
                                        submission.id
                                          ? "Grading..."
                                          : "Grade Submission"}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default TeacherDashboard;

