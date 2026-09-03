
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;
function TeacherDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [gradingId, setGradingId] = useState(null);
  const [scores, setScores] = useState({});
  const [feedback, setFeedback] = useState({});

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [dueDate, setDueDate] = useState("");

  const token = localStorage.getItem("token");

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

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setCoursesLoading(false);
      setError("Please log in first.");
      return;
    }

    loadAssignments();
    loadCourses();
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
        <div
          style={{
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "10px",
            marginBottom: "30px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ marginTop: 0 }}>
                My Assignments
              </h2>

              <p style={{ color: "#666" }}>
                Create assignments, view student submissions,
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
                padding: "12px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {showCreateForm
                ? "Cancel"
                : "Create Assignment"}
            </button>
          </div>
        </div>

        {message && (
          <div
            style={{
              backgroundColor: "#dcfce7",
              color: "#166534",
              padding: "15px",
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
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #fecaca",
            }}
          >
            {error}
          </div>
        )}

        {showCreateForm && (
          <form
            onSubmit={createAssignment}
            style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "10px",
              marginBottom: "30px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              Create Assignment
            </h2>

            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "6px",
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
              placeholder="Enter assignment title"
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                marginBottom: "18px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
              }}
            />

            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "6px",
              }}
            >
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Explain what students need to do"
              rows="5"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                marginBottom: "18px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                resize: "vertical",
              }}
            />

            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "6px",
              }}
            >
              Course
            </label>

            {coursesLoading ? (
              <p>Loading courses...</p>
            ) : courses.length === 0 ? (
              <div
                style={{
                  backgroundColor: "#fff7ed",
                  color: "#9a3412",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "18px",
                }}
              >
                No courses are available for assignment
                creation.
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
                  padding: "12px",
                  marginBottom: "18px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
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

            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "6px",
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
                padding: "12px",
                marginBottom: "18px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
              }}
            />

            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "6px",
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
                padding: "12px",
                marginBottom: "20px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
              }}
            />

            <button
              type="submit"
              disabled={creating || courses.length === 0}
              style={{
                backgroundColor:
                  creating || courses.length === 0
                    ? "#94a3b8"
                    : "#166534",
                color: "white",
                border: "none",
                padding: "12px 22px",
                borderRadius: "6px",
                cursor:
                  creating || courses.length === 0
                    ? "not-allowed"
                    : "pointer",
                fontWeight: "bold",
              }}
            >
              {creating
                ? "Creating..."
                : "Create Assignment"}
            </button>
          </form>
        )}

        {assignments.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            <h3>No assignments found</h3>

            <p style={{ color: "#666" }}>
              Create your first assignment using the
              button above.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {assignments.map((assignment) => (
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
                <h2
                  style={{
                    marginTop: 0,
                    color: "#166534",
                  }}
                >
                  {assignment.title}
                </h2>

                <p
                  style={{
                    color: "#555",
                    lineHeight: "1.6",
                  }}
                >
                  {assignment.description ||
                    "No description provided."}
                </p>

                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                  }}
                >
                  <p>
                    <strong>Course:</strong>{" "}
                    {assignment.course?.title ||
                      "Unknown course"}
                  </p>

                  <p>
                    <strong>Maximum score:</strong>{" "}
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

                <h3
                  style={{
                    marginTop: "25px",
                    borderTop: "1px solid #e5e7eb",
                    paddingTop: "20px",
                  }}
                >
                  Student Submissions
                </h3>

                {!assignment.submissions ||
                assignment.submissions.length === 0 ? (
                  <p style={{ color: "#666" }}>
                    No submissions yet.
                  </p>
                ) : (
                  assignment.submissions.map(
                    (submission) => (
                      <div
                        key={submission.id}
                        style={{
                          marginTop: "15px",
                          padding: "18px",
                          backgroundColor: "#f8fafc",
                          borderRadius: "8px",
                          border:
                            "1px solid #e2e8f0",
                        }}
                      >
                        <p>
                          <strong>Student:</strong>{" "}
                          {submission.student?.user
                            ? `${submission.student.user.firstName} ${submission.student.user.lastName}`
                            : "Unknown student"}
                        </p>

                        <p>
                          <strong>Email:</strong>{" "}
                          {submission.student?.user
                            ?.email || "No email"}
                        </p>

                        <p>
                          <strong>Status:</strong>{" "}
                          {submission.status}
                        </p>

                        <p>
                          <strong>Submitted:</strong>{" "}
                          {submission.submittedAt
                            ? new Date(
                                submission.submittedAt
                              ).toLocaleString()
                            : "Unknown"}
                        </p>

                        <div
                          style={{
                            marginTop: "15px",
                            padding: "15px",
                            backgroundColor: "white",
                            borderRadius: "6px",
                          }}
                        >
                          <strong>
                            Student Answer:
                          </strong>

                          <p
                            style={{
                              color: "#555",
                              lineHeight: "1.6",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {submission.content ||
                              "No written answer."}
                          </p>
                        </div>

                        {submission.status ===
                        "GRADED" ? (
                          <div
                            style={{
                              marginTop: "15px",
                              padding: "15px",
                              backgroundColor:
                                "#ecfdf5",
                              borderRadius: "6px",
                              color: "#166534",
                            }}
                          >
                            <p>
                              <strong>Score:</strong>{" "}
                              {submission.score} /{" "}
                              {assignment.maxScore}
                            </p>

                            <p>
                              <strong>
                                Feedback:
                              </strong>{" "}
                              {submission.feedback ||
                                "No feedback provided."}
                            </p>
                          </div>
                        ) : (
                          <div
                            style={{
                              marginTop: "15px",
                              padding: "15px",
                              backgroundColor:
                                "#fff7ed",
                              borderRadius: "6px",
                            }}
                          >
                            <h4
                              style={{
                                marginTop: 0,
                              }}
                            >
                              Grade Submission
                            </h4>

                            <label>
                              Score
                            </label>

                            <input
                              type="number"
                              min="0"
                              max={assignment.maxScore}
                              value={
                                scores[
                                  submission.id
                                ] ?? ""
                              }
                              onChange={(event) =>
                                setScores({
                                  ...scores,
                                  [submission.id]:
                                    event.target
                                      .value,
                                })
                              }
                              placeholder={`0-${assignment.maxScore}`}
                              style={{
                                width: "100%",
                                boxSizing:
                                  "border-box",
                                padding: "10px",
                                marginTop: "6px",
                                marginBottom:
                                  "12px",
                                borderRadius: "6px",
                                border:
                                  "1px solid #cbd5e1",
                              }}
                            />

                            <label>
                              Feedback
                            </label>

                            <textarea
                              value={
                                feedback[
                                  submission.id
                                ] ?? ""
                              }
                              onChange={(event) =>
                                setFeedback({
                                  ...feedback,
                                  [submission.id]:
                                    event.target
                                      .value,
                                })
                              }
                              placeholder="Enter feedback for the student"
                              rows="4"
                              style={{
                                width: "100%",
                                boxSizing:
                                  "border-box",
                                padding: "10px",
                                marginTop: "6px",
                                marginBottom:
                                  "12px",
                                borderRadius: "6px",
                                border:
                                  "1px solid #cbd5e1",
                                resize: "vertical",
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
                                  "#166534",
                                color: "white",
                                border: "none",
                                padding:
                                  "10px 18px",
                                borderRadius:
                                  "6px",
                                cursor:
                                  gradingId ===
                                  submission.id
                                    ? "not-allowed"
                                    : "pointer",
                                fontWeight: "bold",
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
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default TeacherDashboard;

