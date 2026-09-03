
import { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import TeacherDashboard from "./TeacherDashboard";
import StudentDashboard from "./StudentDashboard";
import ParentDashboard from "./ParentDashboard";

const API_URL = "https://smart-school-api-tan.vercel.app/api";

function App() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // Get the user's role from the JWT token
  const getUserRole = () => {
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role;
    } catch (error) {
      console.error("Failed to read user role:", error);
      return null;
    }
  };

  const userRole = getUserRole();

  // LOGIN
  const loginUser = async (event) => {
    event.preventDefault();

    try {
      setLoginLoading(true);
      setMessage("");

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);

      setMessage("Login successful.");

      window.location.reload();
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // LOAD STUDENT DASHBOARD DATA
  const loadDashboard = async () => {
    try {
      setLoading(true);
      setMessage("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const assignmentsResponse = await fetch(
        `${API_URL}/assignments/my`,
        {
          headers,
        }
      );

      const submissionsResponse = await fetch(
        `${API_URL}/submissions/my`,
        {
          headers,
        }
      );

      const assignmentsData = await assignmentsResponse.json();
      const submissionsData = await submissionsResponse.json();

      if (!assignmentsResponse.ok) {
        throw new Error(
          assignmentsData.message ||
            "Failed to load assignments"
        );
      }

      if (!submissionsResponse.ok) {
        throw new Error(
          submissionsData.message ||
            "Failed to load submissions"
        );
      }

      setAssignments(assignmentsData.assignments || []);
      setSubmissions(submissionsData.submissions || []);
    } catch (error) {
      console.error("Dashboard error:", error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  if (!token) {
    setLoading(false);
    return;
  }

  if (userRole === "STUDENT") {
    loadDashboard();
  } else {
    setLoading(false);
  }
}, [token, userRole]);
  // FIND SUBMISSION FOR ASSIGNMENT
  const getSubmission = (assignmentId) => {
    return submissions.find(
      (submission) =>
        submission.assignmentId === assignmentId
    );
  };

  // HANDLE ANSWER CHANGE
  const handleAnswerChange = (assignmentId, value) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [assignmentId]: value,
    }));
  };

  // SUBMIT ASSIGNMENT
  const submitAssignment = async (assignmentId) => {
    try {
      setMessage("");

      const answer = answers[assignmentId] || "";

      if (!answer.trim()) {
        setMessage(
          "Please enter your assignment answer before submitting."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/submissions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assignmentId,
            content: answer,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit assignment"
        );
      }

      setMessage(
        "Assignment submitted successfully."
      );

      setAnswers((previousAnswers) => {
        const updatedAnswers = {
          ...previousAnswers,
        };

        delete updatedAnswers[assignmentId];

        return updatedAnswers;
      });

      await loadDashboard();
    } catch (error) {
      console.error(
        "Submit assignment error:",
        error
      );

      setMessage(error.message);
    }
  };

  // DASHBOARD STATISTICS
  const totalAssignments = assignments.length;

  const submittedAssignments = assignments.filter(
    (assignment) =>
      getSubmission(assignment.id)
  ).length;

  const gradedAssignments = assignments.filter(
    (assignment) => {
      const submission = getSubmission(
        assignment.id
      );

      return (
        submission &&
        submission.status === "GRADED"
      );
    }
  ).length;

  const gradedSubmissions = submissions.filter(
    (submission) =>
      submission.score !== null &&
      submission.score !== undefined
  );

  const averageScore =
    gradedSubmissions.length > 0
      ? Math.round(
          gradedSubmissions.reduce(
            (total, submission) =>
              total + Number(submission.score),
            0
          ) / gradedSubmissions.length
        )
      : 0;

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  // =========================================================
  // ROLE-BASED DASHBOARDS
  // =========================================================

  if (userRole === "TEACHER") {
    return <TeacherDashboard />;
  }

  if (userRole === "ADMIN") {
    return <AdminDashboard />;
  }

  if (userRole === "STUDENT") {
    return <StudentDashboard />;
  }
  if (userRole === "PARENT") {
  return <ParentDashboard />;
}

  // =========================================================
  // LOGIN PAGE
  // =========================================================

  if (!token) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          background:
            "linear-gradient(135deg, #eff6ff 0%, #dbeafe 45%, #f8fafc 100%)",
          fontFamily:
            "'Inter', 'Segoe UI', Arial, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* LEFT BRANDING PANEL */}

        <div
          className="login-brand-panel"
          style={{
            flex: 1,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "50px",
            boxSizing: "border-box",
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(145deg, #0f2a5f 0%, #1d4ed8 55%, #2563eb 100%)",
            color: "white",
          }}
        >
          {/* Decorative circle */}

          <div
            style={{
              position: "absolute",
              width: "380px",
              height: "380px",
              borderRadius: "50%",
              background:
                "rgba(255,255,255,0.06)",
              top: "-150px",
              left: "-150px",
            }}
          />

          {/* Decorative circle */}

          <div
            style={{
              position: "absolute",
              width: "320px",
              height: "320px",
              borderRadius: "50%",
              background:
                "rgba(255,255,255,0.05)",
              bottom: "-130px",
              right: "-100px",
            }}
          />

          {/* Decorative small circle */}

          <div
            style={{
              position: "absolute",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border:
                "1px solid rgba(255,255,255,0.15)",
              top: "18%",
              right: "12%",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              maxWidth: "540px",
            }}
          >
            {/* Logo */}

            <div
              style={{
                width: "76px",
                height: "76px",
                borderRadius: "20px",
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "28px",
                boxShadow:
                  "0 15px 35px rgba(0,0,0,0.18)",
              }}
            >
              <span
                style={{
                  fontSize: "38px",
                  fontWeight: "800",
                  color: "#1d4ed8",
                }}
              >
                S
              </span>
            </div>

            <p
              style={{
                margin: "0 0 10px",
                fontSize: "14px",
                fontWeight: "700",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#bfdbfe",
              }}
            >
              Smart School Portal
            </p>

            <h1
              style={{
                fontSize:
                  "clamp(38px, 5vw, 62px)",
                lineHeight: "1.05",
                margin: "0 0 22px",
                fontWeight: "800",
                letterSpacing: "-2px",
              }}
            >
              Learn.
              <br />
              Grow.
              <br />
              Succeed.
            </h1>

            <p
              style={{
                fontSize: "18px",
                lineHeight: "1.7",
                color: "#dbeafe",
                maxWidth: "480px",
                margin: 0,
              }}
            >
              Welcome to Smart School, your
              digital learning environment for
              accessing courses, assignments,
              submissions, grades and academic
              feedback.
            </p>

            {/* Feature highlights */}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "32px",
              }}
            >
              {[
                "Courses",
                "Assignments",
                "Grades",
                "Feedback",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: "9px 15px",
                    borderRadius: "30px",
                    backgroundColor:
                      "rgba(255,255,255,0.1)",
                    border:
                      "1px solid rgba(255,255,255,0.15)",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: "600",
                    backdropFilter: "blur(5px)",
                  }}
                >
                  ✓ {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT LOGIN PANEL */}

        <div
          className="login-form-panel"
          style={{
            width: "min(48%, 600px)",
            minHeight: "100vh",
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "430px",
            }}
          >
            {/* Compact logo */}

            <div
              style={{
                display: "inline-flex",
                width: "54px",
                height: "54px",
                borderRadius: "15px",
                backgroundColor: "#eff6ff",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "25px",
              }}
            >
              <span
                style={{
                  color: "#1d4ed8",
                  fontSize: "27px",
                  fontWeight: "800",
                }}
              >
                S
              </span>
            </div>

            <p
              style={{
                margin: "0 0 8px",
                color: "#64748b",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Welcome back
            </p>

            <h2
              style={{
                margin: "0 0 10px",
                color: "#0f172a",
                fontSize: "34px",
                fontWeight: "800",
                letterSpacing: "-0.8px",
                lineHeight: "1.15",
              }}
            >
              Sign in to Smart School
            </h2>

            <p
              style={{
                margin: "0 0 30px",
                color: "#64748b",
                lineHeight: "1.6",
                fontSize: "15px",
              }}
            >
              Enter your account details to
              continue to your school portal.
            </p>

            {/* ERROR / STATUS MESSAGE */}

            {message && (
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  color: "#b91c1c",
                  padding: "13px 15px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                  border:
                    "1px solid #fecaca",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                {message}
              </div>
            )}

            {/* LOGIN FORM */}

            <form onSubmit={loginUser}>
              {/* EMAIL */}

              <div
                style={{
                  marginBottom: "20px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#334155",
                    fontSize: "14px",
                    fontWeight: "700",
                  }}
                >
                  Email address
                </label>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "15px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      color: "#64748b",
                      fontSize: "17px",
                      pointerEvents: "none",
                    }}
                  >
                    ✉
                  </span>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="student@example.com"
                    required
                    autoComplete="email"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding:
                        "14px 15px 14px 45px",
                      borderRadius: "10px",
                      border:
                        "1px solid #cbd5e1",
                      outline: "none",
                      fontSize: "15px",
                      color: "#0f172a",
                      backgroundColor:
                        "#f8fafc",
                    }}
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div
                style={{
                  marginBottom: "15px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#334155",
                    fontSize: "14px",
                    fontWeight: "700",
                  }}
                >
                  Password
                </label>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "15px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      color: "#64748b",
                      fontSize: "16px",
                      pointerEvents: "none",
                    }}
                  >
                    🔒
                  </span>

                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding:
                        "14px 15px 14px 45px",
                      borderRadius: "10px",
                      border:
                        "1px solid #cbd5e1",
                      outline: "none",
                      fontSize: "15px",
                      color: "#0f172a",
                      backgroundColor:
                        "#f8fafc",
                    }}
                  />
                </div>
              </div>

              {/* REMEMBER / FORGOT */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "25px",
                  fontSize: "13px",
                  gap: "15px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    style={{
                      width: "16px",
                      height: "16px",
                      accentColor: "#2563eb",
                    }}
                  />

                  Remember me
                </label>

                <span
                  style={{
                    color: "#2563eb",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Forgot password?
                </span>
              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loginLoading}
                style={{
                  width: "100%",
                  background:
                    loginLoading
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                  color: "white",
                  border: "none",
                  padding: "15px",
                  borderRadius: "10px",
                  cursor: loginLoading
                    ? "not-allowed"
                    : "pointer",
                  fontSize: "16px",
                  fontWeight: "700",
                  boxShadow:
                    loginLoading
                      ? "none"
                      : "0 8px 20px rgba(37,99,235,0.25)",
                  transition:
                    "all 0.2s ease",
                }}
              >
                {loginLoading
                  ? "Signing in..."
                  : "Sign In"}
              </button>
            </form>

            {/* FOOTER */}

            <div
              style={{
                marginTop: "35px",
                paddingTop: "20px",
                borderTop:
                  "1px solid #e2e8f0",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#94a3b8",
                  fontSize: "12px",
                  lineHeight: "1.6",
                }}
              >
                Smart School Management Portal
                <br />
                Secure academic access
              </p>
            </div>
          </div>
        </div>

        {/* RESPONSIVE STYLES */}

        <style>
          {`
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
            }

            input {
              transition: all 0.2s ease;
            }

            input:focus {
              border-color: #2563eb !important;
              box-shadow:
                0 0 0 3px rgba(37,99,235,0.10);
              background-color: #ffffff !important;
            }

            button[type="submit"]:hover:not(:disabled) {
              transform: translateY(-1px);
              box-shadow:
                0 10px 25px rgba(37,99,235,0.32) !important;
            }

            @media (max-width: 850px) {
              .login-brand-panel {
                display: none !important;
              }

              .login-form-panel {
                width: 100% !important;
                min-height: 100vh !important;
                padding: 30px 22px !important;
              }
            }

            @media (max-width: 480px) {
              .login-form-panel {
                padding: 25px 18px !important;
              }

              h2 {
                font-size: 29px !important;
              }
            }
          `}
        </style>
      </div>
    );
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f4f6f8",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  // =========================================================
  // FALLBACK STUDENT DASHBOARD
  // =========================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          backgroundColor: "#1d4ed8",
          color: "white",
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>
            Smart School
          </h1>

          <p style={{ margin: "5px 0 0" }}>
            Student Dashboard
          </p>
        </div>

        <button
          onClick={logout}
          style={{
            backgroundColor: "white",
            color: "#1d4ed8",
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
        {/* MY LEARNING */}

        <div
          style={{
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "10px",
            marginBottom: "30px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            My Learning
          </h2>

          <p style={{ color: "#666" }}>
            View your assignments, submission
            status, grades, and teacher feedback.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              marginTop: "25px",
            }}
          >
            {/* TOTAL */}

            <div
              style={{
                backgroundColor: "#eff6ff",
                padding: "20px",
                borderRadius: "10px",
                border:
                  "1px solid #bfdbfe",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#1d4ed8",
                  fontWeight: "bold",
                }}
              >
                Total Assignments
              </p>

              <h2
                style={{
                  margin: "10px 0 0",
                  fontSize: "32px",
                  color: "#1e3a8a",
                }}
              >
                {totalAssignments}
              </h2>
            </div>

            {/* SUBMITTED */}

            <div
              style={{
                backgroundColor: "#f0fdf4",
                padding: "20px",
                borderRadius: "10px",
                border:
                  "1px solid #bbf7d0",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#15803d",
                  fontWeight: "bold",
                }}
              >
                Submitted
              </p>

              <h2
                style={{
                  margin: "10px 0 0",
                  fontSize: "32px",
                  color: "#166534",
                }}
              >
                {submittedAssignments}
              </h2>
            </div>

            {/* GRADED */}

            <div
              style={{
                backgroundColor: "#fefce8",
                padding: "20px",
                borderRadius: "10px",
                border:
                  "1px solid #fde68a",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#a16207",
                  fontWeight: "bold",
                }}
              >
                Graded
              </p>

              <h2
                style={{
                  margin: "10px 0 0",
                  fontSize: "32px",
                  color: "#854d0e",
                }}
              >
                {gradedAssignments}
              </h2>
            </div>

            {/* AVERAGE */}

            <div
              style={{
                backgroundColor: "#faf5ff",
                padding: "20px",
                borderRadius: "10px",
                border:
                  "1px solid #e9d5ff",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#7e22ce",
                  fontWeight: "bold",
                }}
              >
                Average Score
              </p>

              <h2
                style={{
                  margin: "10px 0 0",
                  fontSize: "32px",
                  color: "#6b21a8",
                }}
              >
                {averageScore}%
              </h2>
            </div>
          </div>
        </div>

        {/* MESSAGE */}

        {message && (
          <div
            style={{
              backgroundColor: "#fff7ed",
              color: "#9a3412",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
              border:
                "1px solid #fed7aa",
            }}
          >
            {message}
          </div>
        )}

        {/* NO ASSIGNMENTS */}

        {assignments.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            <h3>No assignments found</h3>

            <p style={{ color: "#666" }}>
              Your assignments will appear here
              when they are available.
            </p>
          </div>
        ) : (
          // ASSIGNMENTS

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {assignments.map((assignment) => {
              const submission =
                getSubmission(assignment.id);

              return (
                <div
                  key={assignment.id}
                  style={{
                    backgroundColor: "white",
                    padding: "25px",
                    borderRadius: "10px",
                    boxShadow:
                      "0 2px 10px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* STATUS */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        backgroundColor:
                          submission
                            ? submission.status ===
                              "GRADED"
                              ? "#dcfce7"
                              : "#fef3c7"
                            : "#dbeafe",
                        color: submission
                          ? submission.status ===
                            "GRADED"
                            ? "#166534"
                            : "#92400e"
                          : "#1d4ed8",
                      }}
                    >
                      {submission
                        ? submission.status ===
                          "GRADED"
                          ? "GRADED"
                          : "SUBMITTED"
                        : "NOT SUBMITTED"}
                    </span>
                  </div>

                  {/* TITLE */}

                  <h2
                    style={{
                      marginTop: 0,
                      color: "#1d4ed8",
                    }}
                  >
                    {assignment.title}
                  </h2>

                  {/* DESCRIPTION */}

                  <p
                    style={{
                      color: "#555",
                      lineHeight: "1.6",
                    }}
                  >
                    {assignment.description ||
                      "No description provided."}
                  </p>

                  {/* DETAILS */}

                  <div
                    style={{
                      marginTop: "20px",
                      padding: "15px",
                      backgroundColor:
                        "#f8fafc",
                      borderRadius: "8px",
                    }}
                  >
                    <p>
                      <strong>Course:</strong>{" "}
                      {assignment.course?.title ||
                        "Unknown course"}
                    </p>

                    <p>
                      <strong>
                        Maximum score:
                      </strong>{" "}
                      {assignment.maxScore}
                    </p>

                    <p>
                      <strong>Due:</strong>{" "}
                      {assignment.dueDate
                        ? new Date(
                            assignment.dueDate
                          ).toLocaleString()
                        : "No due date"}
                    </p>
                  </div>

                  {/* SUBMISSION */}

                  <div
                    style={{
                      marginTop: "20px",
                    }}
                  >
                    {submission ? (
                      <div
                        style={{
                          backgroundColor:
                            "#f0fdf4",
                          padding: "18px",
                          borderRadius: "8px",
                          border:
                            "1px solid #bbf7d0",
                        }}
                      >
                        <h3
                          style={{
                            marginTop: 0,
                            color: "#166534",
                          }}
                        >
                          {submission.status ===
                          "GRADED"
                            ? "Assignment Graded"
                            : "Assignment Submitted"}
                        </h3>

                        <p>
                          <strong>Status:</strong>{" "}
                          {submission.status}
                        </p>

                        {submission.score !==
                          null &&
                          submission.score !==
                            undefined && (
                            <p>
                              <strong>
                                Score:
                              </strong>{" "}
                              {submission.score} /{" "}
                              {assignment.maxScore}
                            </p>
                          )}

                        {submission.feedback && (
                          <p>
                            <strong>
                              Teacher feedback:
                            </strong>{" "}
                            {submission.feedback}
                          </p>
                        )}

                        <p>
                          <strong>
                            Submitted:
                          </strong>{" "}
                          {submission.submittedAt
                            ? new Date(
                                submission.submittedAt
                              ).toLocaleString()
                            : "Unknown"}
                        </p>
                      </div>
                    ) : (
                      <div
                        style={{
                          backgroundColor:
                            "#eff6ff",
                          padding: "18px",
                          borderRadius: "8px",
                          border:
                            "1px solid #bfdbfe",
                        }}
                      >
                        <h3
                          style={{
                            marginTop: 0,
                            color: "#1d4ed8",
                          }}
                        >
                          Not Submitted
                        </h3>

                        <p>
                          You have not submitted
                          this assignment yet.
                        </p>

                        <textarea
                          placeholder="Enter your assignment answer here..."
                          rows="5"
                          value={
                            answers[
                              assignment.id
                            ] || ""
                          }
                          onChange={(event) =>
                            handleAnswerChange(
                              assignment.id,
                              event.target.value
                            )
                          }
                          style={{
                            width: "100%",
                            boxSizing:
                              "border-box",
                            padding: "12px",
                            borderRadius: "8px",
                            border:
                              "1px solid #cbd5e1",
                            resize: "vertical",
                            fontFamily:
                              "Arial, sans-serif",
                            fontSize: "14px",
                            marginBottom: "12px",
                          }}
                        />

                        <button
                          onClick={() =>
                            submitAssignment(
                              assignment.id
                            )
                          }
                          style={{
                            backgroundColor:
                              "#2563eb",
                            color: "white",
                            border: "none",
                            padding:
                              "10px 18px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "15px",
                            fontWeight: "bold",
                          }}
                        >
                          Submit Assignment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

