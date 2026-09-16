import React, { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function StudentDashboard({ onLogout }) {
  const [assignments, setAssignments] = useState([]);
  const [results, setResults] = useState([]);
  const [gpa, setGpa] = useState(0);

  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [answers, setAnswers] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [files, setFiles] = useState({});

  // AI Assessment
  const [aiAssessingId, setAiAssessingId] = useState(null);
  const [aiResults, setAiResults] = useState({});
  const [aiErrors, setAiErrors] = useState({});

  // Dobi personalized insights
  const [aiInsight, setAiInsight] = useState(null);
  const [aiInsightLoading, setAiInsightLoading] = useState(false);
  const [showAIInsight, setShowAIInsight] = useState(false);

  // Dobi chatbot
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const token = localStorage.getItem("token");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const firstName = user?.firstName || "Student";

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Student";

  const initials =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .map((name) => name.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2) || "S";

  /*
   * Safely find the student's submission.
   *
   * Your assignments endpoint may return submissions as:
   * assignment.submissions
   *
   * This helper also supports a few common response shapes so the
   * dashboard does not break if the backend includes the submission
   * under a slightly different property.
   */
  const getExistingSubmission = (assignment) => {
    if (!assignment) {
      return null;
    }

    if (assignment.submission) {
      return assignment.submission;
    }

    if (
      Array.isArray(assignment.submissions) &&
      assignment.submissions.length > 0
    ) {
      return assignment.submissions[0];
    }

    if (assignment.mySubmission) {
      return assignment.mySubmission;
    }

    return null;
  };

  /*
   * Determine whether this assignment supports AI assessment.
   *
   * We preserve compatibility with different possible backend flags.
   * If no explicit flag exists, AI assessment is available because
   * the dashboard already uses the /ai/assess endpoint.
   */
  const isAIEnabled = (assignment) => {
    if (!assignment) {
      return false;
    }

    if (assignment.aiEnabled === false) {
      return false;
    }

    if (assignment.enableAI === false) {
      return false;
    }

    if (assignment.allowAI === false) {
      return false;
    }

    return true;
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/assignments/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load assignments.");
      }

      setAssignments(data.assignments || []);
    } catch (err) {
      setError(err.message || "Unable to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async () => {
    try {
      setResultsLoading(true);

      const [resultsResponse, gpaResponse] = await Promise.all([
        fetch(`${API_URL}/results/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_URL}/results/me/gpa`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const resultsData = await resultsResponse.json();
      const gpaData = await gpaResponse.json();

      if (!resultsResponse.ok) {
        throw new Error(resultsData.message || "Failed to load results.");
      }

      if (!gpaResponse.ok) {
        throw new Error(gpaData.message || "Failed to load GPA.");
      }

      setResults(resultsData.results || []);
      setGpa(Number(gpaData.gpa) || 0);
    } catch (err) {
      setError(err.message || "Unable to load academic results.");
    } finally {
      setResultsLoading(false);
    }
  };

  const loadAIInsight = async () => {
    try {
      setAiInsightLoading(true);

      const response = await fetch(`${API_URL}/ai/insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to generate your AI insight."
        );
      }

      if (data.insight) {
        setAiInsight(data.insight);
        setShowAIInsight(true);
      }
    } catch (err) {
      console.error("AI insight error:", err);
    } finally {
      setAiInsightLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    loadAssignments();
    loadResults();
    loadAIInsight();
  }, [token]);

  const submitAssignment = async (assignmentId) => {
    const content = (answers[assignmentId] || "").trim();

    if (!content) {
      setError("Please enter your answer before submitting.");
      return;
    }

    try {
      setSubmittingId(assignmentId);
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignmentId,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit assignment.");
      }

      setMessage("Assignment submitted successfully.");

      setAnswers((current) => ({
        ...current,
        [assignmentId]: "",
      }));

      await loadAssignments();
    } catch (err) {
      setError(err.message || "Unable to submit assignment.");
    } finally {
      setSubmittingId(null);
    }
  };

  const assessWithAI = async (assignmentId) => {
    const assignment = assignments.find(
      (item) => Number(item.id) === Number(assignmentId)
    );

    const existingSubmission = assignment
      ? getExistingSubmission(assignment)
      : null;

    const answer =
      (answers[assignmentId] || "").trim() ||
      existingSubmission?.content?.trim() ||
      "";

    if (!answer) {
      setAiErrors((current) => ({
        ...current,
        [assignmentId]:
          "Enter your answer first, then use AI Assessment.",
      }));
      return;
    }

    try {
      setAiAssessingId(assignmentId);

      setAiErrors((current) => ({
        ...current,
        [assignmentId]: "",
      }));

      setMessage("");

      const response = await fetch(`${API_URL}/ai/assess`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assignmentId,
          answer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "The AI assessor could not complete the assessment."
        );
      }

      setAiResults((current) => ({
        ...current,
        [assignmentId]: data.assessment,
      }));

      setMessage("AI assessment completed successfully.");

      await loadAssignments();
    } catch (err) {
      setAiErrors((current) => ({
        ...current,
        [assignmentId]:
          err.message || "AI assessment failed. Please try again.",
      }));
    } finally {
      setAiAssessingId(null);
    }
  };

  const handleFileChange = (assignmentId, event) => {
    const file = event.target.files?.[0];

    setFiles((current) => ({
      ...current,
      [assignmentId]: file || null,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  const totalAssignments = assignments.length;

  const submittedAssignments = assignments.filter((assignment) => {
    return Boolean(getExistingSubmission(assignment));
  }).length;

  const gradedAssignments = assignments.filter((assignment) => {
    const submission = getExistingSubmission(assignment);
    return submission?.status === "GRADED";
  }).length;

  const pendingAssignments = totalAssignments - submittedAssignments;

  const gradedScores = assignments
    .map((assignment) => {
      const submission = getExistingSubmission(assignment);

      return submission?.status === "GRADED" &&
        submission?.score !== null &&
        submission?.score !== undefined
        ? Number(submission.score)
        : null;
    })
    .filter((score) => Number.isFinite(score));

  const averageScore =
    gradedScores.length > 0
      ? Math.round(
          gradedScores.reduce((total, score) => total + score, 0) /
            gradedScores.length
        )
      : 0;

  const insightAnalytics = aiInsight?.analytics || {};

  const safeAverageResult =
    insightAnalytics.averageResultScore !== null &&
    insightAnalytics.averageResultScore !== undefined
      ? insightAnalytics.averageResultScore
      : null;

  const safeAverageAssignment =
    insightAnalytics.averageAssignmentScore !== null &&
    insightAnalytics.averageAssignmentScore !== undefined
      ? insightAnalytics.averageAssignmentScore
      : null;

  const safeStrongestScore =
    insightAnalytics.strongestSubjectScore !== null &&
    insightAnalytics.strongestSubjectScore !== undefined
      ? insightAnalytics.strongestSubjectScore
      : null;

  const safeFocusScore =
    insightAnalytics.focusSubjectScore !== null &&
    insightAnalytics.focusSubjectScore !== undefined
      ? insightAnalytics.focusSubjectScore
      : null;

  return (
    <div
      className="portal-page portal-student"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      {/* =========================================================
          HEADER
      ========================================================== */}
      <header
        style={{
          background: "rgba(255,255,255,0.96)",
          borderBottom: "1px solid #e2e8f0",
          padding: "14px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 200,
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background:
                "linear-gradient(135deg, #2563eb, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 21,
              fontWeight: 900,
              boxShadow:
                "0 8px 22px rgba(37,99,235,0.22)",
            }}
          >
            S
          </div>

          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 850,
                letterSpacing: "-0.025em",
              }}
            >
              Smart School
            </div>

            <div
              style={{
                fontSize: 11,
                color: "#64748b",
                marginTop: 2,
                fontWeight: 600,
              }}
            >
              Student Portal
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
          }}
        >
          <div
            className="student-name"
            style={{
              fontSize: 13,
              fontWeight: 750,
              color: "#334155",
            }}
          >
            {fullName}
          </div>

          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #dbeafe, #e0e7ff)",
              color: "#3730a3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 900,
              border: "1px solid #c7d2fe",
            }}
            title={fullName}
          >
            {initials}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#334155",
              borderRadius: 9,
              padding: "9px 13px",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* =========================================================
          DOBI LOGIN INSIGHT POPUP
      ========================================================== */}
      {showAIInsight && aiInsight && (
        <>
          <div
            className="dobi-overlay"
            onClick={() => setShowAIInsight(false)}
          />

          <div
            className="dobi-insight-popup"
            role="dialog"
            aria-modal="true"
            aria-label="Dobi personal learning insight"
            style={{
              position: "fixed",
              top: 78,
              right: 24,
              width: 405,
              maxWidth: "calc(100vw - 30px)",
              maxHeight: "calc(100vh - 100px)",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 22,
              boxShadow:
                "0 28px 80px rgba(15,23,42,0.22)",
              zIndex: 1000,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
          >
            {/* Dobi header */}
            <div
              style={{
                padding: "19px 20px",
                background:
                  "linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)",
                color: "#fff",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 130,
                  height: 130,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                  right: -45,
                  top: -65,
                }}
              />

              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 13,
                      background: "rgba(255,255,255,0.16)",
                      border:
                        "1px solid rgba(255,255,255,0.22)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 21,
                    }}
                  >
                    🤖
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 900,
                      }}
                    >
                      Dobi
                    </div>

                    <div
                      style={{
                        marginTop: 2,
                        fontSize: 11,
                        color: "rgba(255,255,255,0.76)",
                        fontWeight: 600,
                      }}
                    >
                      Your Personal Learning Assistant
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAIInsight(false)}
                  aria-label="Close Dobi insight"
                  style={{
                    border: "none",
                    background: "rgba(255,255,255,0.10)",
                    color: "#fff",
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    cursor: "pointer",
                    fontSize: 18,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Dobi body */}
            <div style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  color: "#6366f1",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 7,
                }}
              >
                Your learning snapshot
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: 21,
                  lineHeight: 1.3,
                  color: "#111827",
                  letterSpacing: "-0.025em",
                }}
              >
                {aiInsight.title || "Here's how you're doing"}
              </h2>

              <p
                style={{
                  margin: "10px 0 18px",
                  color: "#475569",
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              >
                {aiInsight.message ||
                  "I looked at your current academic activity and prepared a quick learning insight for you."}
              </p>

              {/* Analytics */}
              {(safeAverageResult !== null ||
                safeAverageAssignment !== null ||
                insightAnalytics.strongestSubject ||
                insightAnalytics.focusSubject) && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 9,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 13,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "#64748b",
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      RESULTS AVERAGE
                    </div>

                    <strong
                      style={{
                        fontSize: 20,
                        color: "#0f172a",
                      }}
                    >
                      {safeAverageResult !== null
                        ? `${safeAverageResult}%`
                        : "—"}
                    </strong>
                  </div>

                  <div
                    style={{
                      padding: 12,
                      borderRadius: 13,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "#64748b",
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      ASSIGNMENT AVERAGE
                    </div>

                    <strong
                      style={{
                        fontSize: 20,
                        color: "#0f172a",
                      }}
                    >
                      {safeAverageAssignment !== null
                        ? `${safeAverageAssignment}%`
                        : "—"}
                    </strong>
                  </div>

                  <div
                    style={{
                      padding: 12,
                      borderRadius: 13,
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "#15803d",
                        fontWeight: 800,
                        marginBottom: 4,
                      }}
                    >
                      STRONGEST SUBJECT
                    </div>

                    <strong
                      style={{
                        display: "block",
                        fontSize: 13,
                        color: "#166534",
                      }}
                    >
                      {insightAnalytics.strongestSubject || "—"}
                    </strong>

                    {safeStrongestScore !== null && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#15803d",
                        }}
                      >
                        {safeStrongestScore}%
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      padding: 12,
                      borderRadius: 13,
                      background: "#fff7ed",
                      border: "1px solid #fed7aa",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "#c2410c",
                        fontWeight: 800,
                        marginBottom: 4,
                      }}
                    >
                      FOCUS AREA
                    </div>

                    <strong
                      style={{
                        display: "block",
                        fontSize: 13,
                        color: "#9a3412",
                      }}
                    >
                      {insightAnalytics.focusSubject ||
                        aiInsight.focusArea ||
                        "—"}
                    </strong>

                    {safeFocusScore !== null && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#c2410c",
                        }}
                      >
                        {safeFocusScore}%
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Focus */}
              {(aiInsight.focusArea ||
                insightAnalytics.focusSubject) && (
                <div
                  style={{
                    padding: 13,
                    borderRadius: 13,
                    background:
                      "linear-gradient(135deg, #eff6ff, #eef2ff)",
                    border: "1px solid #c7d2fe",
                    marginBottom: 11,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      color: "#4338ca",
                      marginBottom: 5,
                    }}
                  >
                    🎯 WHAT TO FOCUS ON
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "#334155",
                    }}
                  >
                    {aiInsight.focusArea ||
                      `Give some extra attention to ${
                        insightAnalytics.focusSubject
                      }.`}
                  </div>
                </div>
              )}

              {/* Action */}
              {aiInsight.action && (
                <div
                  style={{
                    padding: 13,
                    borderRadius: 13,
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      color: "#15803d",
                      marginBottom: 5,
                    }}
                  >
                    ✅ TODAY'S ACTION
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "#334155",
                    }}
                  >
                    {aiInsight.action}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {Array.isArray(aiInsight.strengths) &&
                aiInsight.strengths.length > 0 && (
                  <div style={{ marginBottom: 15 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        color: "#047857",
                        marginBottom: 7,
                      }}
                    >
                      💪 WHAT YOU'RE DOING WELL
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: 6,
                      }}
                    >
                      {aiInsight.strengths
                        .slice(0, 3)
                        .map((strength, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              gap: 7,
                              alignItems: "flex-start",
                              fontSize: 12,
                              lineHeight: 1.55,
                              color: "#475569",
                            }}
                          >
                            <span
                              style={{
                                color: "#10b981",
                                fontWeight: 900,
                              }}
                            >
                              ✓
                            </span>
                            <span>{strength}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: 9,
                  marginTop: 5,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAIInsight(false)}
                  style={{
                    flex: 1,
                    border: "none",
                    borderRadius: 10,
                    padding: "11px 13px",
                    background: "#111827",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Got it
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAIInsight(false);
                    setChatOpen(true);
                  }}
                  style={{
                    flex: 1,
                    border: "1px solid #c7d2fe",
                    borderRadius: 10,
                    padding: "11px 13px",
                    background: "#eef2ff",
                    color: "#4338ca",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Ask Dobi
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* =========================================================
          MAIN
      ========================================================== */}
      <main
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "32px 24px 70px",
        }}
      >
        {/* =======================================================
            HERO
        ======================================================== */}
        <section
          style={{
            background:
              "linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)",
            borderRadius: 23,
            padding: "31px 32px",
            color: "#fff",
            marginBottom: 22,
            boxShadow:
              "0 20px 45px rgba(37,99,235,0.17)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 250,
              height: 250,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              right: -80,
              top: -115,
            }}
          />

          <div
            style={{
              position: "absolute",
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              right: 170,
              bottom: -75,
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              maxWidth: 760,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.13)",
                border:
                  "1px solid rgba(255,255,255,0.18)",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.09em",
                marginBottom: 14,
              }}
            >
              <span>✦</span>
              STUDENT LEARNING & PERFORMANCE
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(28px, 4vw, 40px)",
                lineHeight: 1.1,
                letterSpacing: "-0.04em",
                fontWeight: 850,
              }}
            >
              Welcome back, {firstName}! 👋
            </h1>

            <p
              style={{
                margin: "12px 0 0",
                fontSize: 14,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.84)",
                maxWidth: 690,
              }}
            >
              Stay on top of your coursework, track your academic
              performance, and use Dobi whenever you need learning
              support.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 18,
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 11px",
                  borderRadius: 9,
                  background: "rgba(255,255,255,0.10)",
                  border:
                    "1px solid rgba(255,255,255,0.15)",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                📚 {totalAssignments} assignments
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 11px",
                  borderRadius: 9,
                  background: "rgba(255,255,255,0.10)",
                  border:
                    "1px solid rgba(255,255,255,0.15)",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                🎓 GPA{" "}
                {results.length > 0 ? gpa.toFixed(2) : "—"}
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            STATUS MESSAGES
        ======================================================== */}
        {message && (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 15px",
              borderRadius: 11,
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#047857",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            ✓ {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 15px",
              borderRadius: 11,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        )}

        {/* =======================================================
            STATISTICS
        ======================================================== */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(175px, 1fr))",
            gap: 12,
            marginBottom: 25,
          }}
        >
          {[
            {
              label: "Assignments",
              value: totalAssignments,
              icon: "📚",
              description: "Total coursework",
            },
            {
              label: "Submitted",
              value: submittedAssignments,
              icon: "✓",
              description: "Work turned in",
            },
            {
              label: "Pending",
              value: pendingAssignments,
              icon: "⏳",
              description: "Still to complete",
            },
            {
              label: "Graded",
              value: gradedAssignments,
              icon: "✓",
              description: "Results available",
            },
            {
              label: "Average Score",
              value:
                gradedScores.length > 0
                  ? `${averageScore}%`
                  : "—",
              icon: "★",
              description: "Assignment performance",
            },
            {
              label: "GPA",
              value:
                results.length > 0
                  ? gpa.toFixed(2)
                  : "—",
              icon: "🎓",
              description: "Current GPA",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 16,
                padding: "16px 17px",
                boxShadow:
                  "0 5px 18px rgba(15,23,42,0.035)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 13,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#64748b",
                  }}
                >
                  {stat.label}
                </span>

                <span
                  style={{
                    width: 31,
                    height: 31,
                    borderRadius: 9,
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 900,
                  }}
                >
                  {stat.icon}
                </span>
              </div>

              <div
                style={{
                  fontSize: 27,
                  lineHeight: 1,
                  fontWeight: 900,
                  color: "#0f172a",
                }}
              >
                {stat.value}
              </div>

              <div
                style={{
                  marginTop: 7,
                  fontSize: 10,
                  color: "#94a3b8",
                  fontWeight: 600,
                }}
              >
                {stat.description}
              </div>
            </div>
          ))}
        </section>

        {/* =======================================================
            ASSIGNMENTS
        ======================================================== */}
        <section
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 21,
            padding: "24px",
            boxShadow:
              "0 8px 26px rgba(15,23,42,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              marginBottom: 22,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  color: "#2563eb",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                Your work
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: 25,
                  letterSpacing: "-0.03em",
                }}
              >
                My Assignments
              </h2>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#64748b",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                Complete your coursework and use Dobi for
                learning support when AI assessment is available.
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 11px",
                borderRadius: 10,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#475569",
                fontSize: 11,
                fontWeight: 750,
              }}
            >
              <span>🤖</span>
              Dobi learning support
            </div>
          </div>

          {loading ? (
            <div
              style={{
                padding: "60px 20px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  border: "3px solid #dbeafe",
                  borderTopColor: "#2563eb",
                  borderRadius: "50%",
                  margin: "0 auto 14px",
                  animation:
                    "studentDashboardSpin 0.8s linear infinite",
                }}
              />

              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Loading your assignments...
              </div>
            </div>
          ) : assignments.length === 0 ? (
            <div
              style={{
                border: "1px dashed #cbd5e1",
                borderRadius: 16,
                padding: "50px 24px",
                textAlign: "center",
                background:
                  "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 15px",
                  fontSize: 26,
                }}
              >
                ✦
              </div>

              <h3
                style={{
                  margin: 0,
                  fontSize: 18,
                }}
              >
                Your workspace is ready
              </h3>

              <p
                style={{
                  maxWidth: 570,
                  margin: "9px auto 0",
                  color: "#64748b",
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              >
                You currently have no assignments. When your
                teacher posts supported work, it will appear here.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 15,
              }}
            >
              {assignments.map((assignment) => {
                const submission =
                  getExistingSubmission(assignment);

                const isGraded =
                  submission?.status === "GRADED";

                const isSubmitted = Boolean(submission);

                const aiEnabled =
                  isAIEnabled(assignment);

                const aiResult =
                  aiResults[assignment.id];

                const aiError =
                  aiErrors[assignment.id];

                const maxScore =
                  Number(assignment.maxScore) || 100;

                return (
                  <article
                    key={assignment.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 17,
                      padding: "20px",
                      background: "#fff",
                      boxShadow:
                        "0 4px 16px rgba(15,23,42,0.035)",
                      transition:
                        "box-shadow 0.2s ease, border-color 0.2s ease",
                    }}
                  >
                    {/* Assignment heading */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 15,
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                            flexWrap: "wrap",
                            marginBottom: 9,
                          }}
                        >
                          {aiEnabled && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "5px 8px",
                                borderRadius: 7,
                                background: "#eef2ff",
                                color: "#4338ca",
                                border:
                                  "1px solid #c7d2fe",
                                fontSize: 9,
                                fontWeight: 900,
                                letterSpacing: "0.06em",
                              }}
                            >
                              🤖 AI ASSESSMENT
                            </span>
                          )}

                          <span
                            style={{
                              padding: "5px 8px",
                              borderRadius: 7,
                              background: isGraded
                                ? "#ecfdf5"
                                : isSubmitted
                                ? "#eff6ff"
                                : "#fff7ed",
                              color: isGraded
                                ? "#047857"
                                : isSubmitted
                                ? "#1d4ed8"
                                : "#c2410c",
                              fontSize: 9,
                              fontWeight: 900,
                              letterSpacing: "0.06em",
                            }}
                          >
                            {isGraded
                              ? "GRADED"
                              : isSubmitted
                              ? "SUBMITTED"
                              : "PENDING"}
                          </span>

                          {isGraded &&
                            submission?.score !== null &&
                            submission?.score !==
                              undefined && (
                              <span
                                style={{
                                  padding: "5px 8px",
                                  borderRadius: 7,
                                  background: "#f8fafc",
                                  color: "#334155",
                                  fontSize: 10,
                                  fontWeight: 800,
                                }}
                              >
                                {submission.score}/{maxScore}
                              </span>
                            )}
                        </div>

                        <h3
                          style={{
                            margin: 0,
                            fontSize: 18,
                            lineHeight: 1.35,
                            color: "#0f172a",
                            letterSpacing: "-0.015em",
                          }}
                        >
                          {assignment.title}
                        </h3>

                        {assignment.description && (
                          <p
                            style={{
                              margin: "8px 0 0",
                              color: "#64748b",
                              fontSize: 13,
                              lineHeight: 1.65,
                            }}
                          >
                            {assignment.description}
                          </p>
                        )}

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 7,
                            marginTop: 13,
                          }}
                        >
                          <span
                            style={{
                              padding: "6px 9px",
                              borderRadius: 8,
                              background: "#f8fafc",
                              color: "#475569",
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            Course:{" "}
                            {assignment.course?.title ||
                              assignment.courseTitle ||
                              "Course"}
                          </span>

                          <span
                            style={{
                              padding: "6px 9px",
                              borderRadius: 8,
                              background: "#f8fafc",
                              color: "#475569",
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            Max score: {maxScore}
                          </span>

                          {assignment.dueDate && (
                            <span
                              style={{
                                padding: "6px 9px",
                                borderRadius: 8,
                                background: "#f8fafc",
                                color: "#475569",
                                fontSize: 10,
                                fontWeight: 700,
                              }}
                            >
                              Due:{" "}
                              {new Date(
                                assignment.dueDate
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {aiEnabled && !isGraded && (
                        <button
                          type="button"
                          onClick={() =>
                            assessWithAI(assignment.id)
                          }
                          disabled={
                            aiAssessingId === assignment.id
                          }
                          style={{
                            border:
                              "1px solid #c7d2fe",
                            background:
                              aiAssessingId ===
                              assignment.id
                                ? "#eef2ff"
                                : "#fff",
                            color: "#4338ca",
                            borderRadius: 10,
                            padding: "10px 13px",
                            fontSize: 11,
                            fontWeight: 800,
                            cursor:
                              aiAssessingId ===
                              assignment.id
                                ? "wait"
                                : "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {aiAssessingId ===
                          assignment.id
                            ? "Assessing..."
                            : "✨ Assess with AI"}
                        </button>
                      )}
                    </div>

                    {/* Graded result */}
                    {isGraded && (
                      <div
                        style={{
                          marginTop: 18,
                          padding: "16px",
                          borderRadius: 13,
                          background:
                            "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                          border:
                            "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems: "center",
                            gap: 15,
                            marginBottom: 11,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 850,
                              color: "#334155",
                            }}
                          >
                            Assessment result
                          </div>

                          <div
                            style={{
                              fontSize: 20,
                              fontWeight: 900,
                              color: "#047857",
                            }}
                          >
                            {submission.score}/{maxScore}
                          </div>
                        </div>

                        {submission.feedback && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: 12,
                              lineHeight: 1.7,
                              color: "#475569",
                            }}
                          >
                            {submission.feedback}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Submitted but not graded */}
                    {isSubmitted && !isGraded && (
                      <div
                        style={{
                          marginTop: 18,
                          padding: "15px",
                          borderRadius: 13,
                          background: "#eff6ff",
                          border:
                            "1px solid #bfdbfe",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 850,
                            color: "#1d4ed8",
                            marginBottom: 7,
                          }}
                        >
                          Your submission
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            color: "#475569",
                            lineHeight: 1.65,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {submission.content ||
                            "Submission received."}
                        </div>
                      </div>
                    )}

                    {/* Answer area */}
                    {!isSubmitted && (
                      <div
                        style={{
                          marginTop: 20,
                          paddingTop: 18,
                          borderTop:
                            "1px solid #f1f5f9",
                        }}
                      >
                        <label
                          htmlFor={`answer-${assignment.id}`}
                          style={{
                            display: "block",
                            fontSize: 12,
                            fontWeight: 850,
                            color: "#334155",
                            marginBottom: 8,
                          }}
                        >
                          Your answer
                        </label>

                        <textarea
                          id={`answer-${assignment.id}`}
                          value={
                            answers[assignment.id] || ""
                          }
                          onChange={(event) =>
                            setAnswers((current) => ({
                              ...current,
                              [assignment.id]:
                                event.target.value,
                            }))
                          }
                          placeholder="Write your answer here..."
                          rows={6}
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            resize: "vertical",
                            border:
                              "1px solid #cbd5e1",
                            borderRadius: 11,
                            padding: "12px 13px",
                            fontFamily: "inherit",
                            fontSize: 13,
                            lineHeight: 1.6,
                            color: "#0f172a",
                            outline: "none",
                          }}
                        />

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                              "space-between",
                            gap: 12,
                            flexWrap: "wrap",
                            marginTop: 11,
                          }}
                        >
                          <label
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 7,
                              fontSize: 11,
                              color: "#64748b",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="file"
                              onChange={(event) =>
                                handleFileChange(
                                  assignment.id,
                                  event
                                )
                              }
                            />

                            {files[assignment.id]?.name
                              ? files[assignment.id].name
                              : "Attach file"}
                          </label>

                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            {aiEnabled && (
                              <button
                                type="button"
                                onClick={() =>
                                  assessWithAI(
                                    assignment.id
                                  )
                                }
                                disabled={
                                  aiAssessingId ===
                                  assignment.id
                                }
                                style={{
                                  border:
                                    "1px solid #c7d2fe",
                                  background:
                                    "#eef2ff",
                                  color: "#4338ca",
                                  borderRadius: 9,
                                  padding:
                                    "10px 13px",
                                  fontSize: 11,
                                  fontWeight: 800,
                                  cursor:
                                    aiAssessingId ===
                                    assignment.id
                                      ? "wait"
                                      : "pointer",
                                }}
                              >
                                {aiAssessingId ===
                                assignment.id
                                  ? "Assessing..."
                                  : "✨ Assess with AI"}
                              </button>
                            )}

                            <button
                              type="button"
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
                                border: "none",
                                background:
                                  "#2563eb",
                                color: "#fff",
                                borderRadius: 9,
                                padding:
                                  "10px 15px",
                                fontSize: 11,
                                fontWeight: 800,
                                cursor:
                                  submittingId ===
                                  assignment.id
                                    ? "wait"
                                    : "pointer",
                                boxShadow:
                                  "0 5px 12px rgba(37,99,235,0.18)",
                              }}
                            >
                              {submittingId ===
                              assignment.id
                                ? "Submitting..."
                                : "Submit Assignment"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI error */}
                    {aiError && (
                      <div
                        style={{
                          marginTop: 15,
                          padding:
                            "11px 13px",
                          borderRadius: 9,
                          background: "#fef2f2",
                          border:
                            "1px solid #fecaca",
                          color: "#b91c1c",
                          fontSize: 11,
                          fontWeight: 650,
                        }}
                      >
                        {aiError}
                      </div>
                    )}

                    {/* AI assessment result */}
                    {aiResult && (
                      <div
                        style={{
                          marginTop: 18,
                          borderRadius: 15,
                          border:
                            "1px solid #c7d2fe",
                          background:
                            "linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            padding:
                              "15px 17px",
                            borderBottom:
                              "1px solid #c7d2fe",
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems: "center",
                            gap: 15,
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: 7,
                                marginBottom: 5,
                              }}
                            >
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 8,
                                  background:
                                    "#4f46e5",
                                  color: "#fff",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  fontSize: 15,
                                }}
                              >
                                🤖
                              </div>

                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 900,
                                  color:
                                    "#1e293b",
                                }}
                              >
                                Dobi
                              </div>
                            </div>

                            <div
                              style={{
                                fontSize: 11,
                                color:
                                  "#64748b",
                                fontWeight:
                                  600,
                              }}
                            >
                              Your personal
                              learning
                              assistant
                            </div>

                            <div
                              style={{
                                marginTop: 9,
                                fontSize: 14,
                                fontWeight: 850,
                                color:
                                  "#334155",
                              }}
                            >
                              AI Assessment
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems:
                                "baseline",
                              gap: 4,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 30,
                                lineHeight: 1,
                                fontWeight: 900,
                                color:
                                  "#4338ca",
                              }}
                            >
                              {aiResult.score}
                            </span>

                            <span
                              style={{
                                fontSize: 12,
                                color:
                                  "#64748b",
                                fontWeight:
                                  700,
                              }}
                            >
                              / {maxScore}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            padding: "17px",
                            display: "grid",
                            gap: 15,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 900,
                                color:
                                  "#475569",
                                textTransform:
                                  "uppercase",
                                letterSpacing:
                                  "0.07em",
                                marginBottom: 6,
                              }}
                            >
                              Feedback
                            </div>

                            <p
                              style={{
                                margin: 0,
                                color:
                                  "#334155",
                                fontSize: 12,
                                lineHeight:
                                  1.7,
                              }}
                            >
                              {aiResult.feedback ||
                                "Assessment completed."}
                            </p>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(210px, 1fr))",
                              gap: 11,
                            }}
                          >
                            <div
                              style={{
                                background:
                                  "#fff",
                                border:
                                  "1px solid #dbeafe",
                                borderRadius:
                                  11,
                                padding:
                                  "13px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize:
                                    10,
                                  fontWeight:
                                    900,
                                  color:
                                    "#047857",
                                  textTransform:
                                    "uppercase",
                                  letterSpacing:
                                    "0.05em",
                                  marginBottom:
                                    8,
                                }}
                              >
                                Strengths
                              </div>

                              {Array.isArray(
                                aiResult.strengths
                              ) &&
                              aiResult
                                .strengths
                                .length >
                                0 ? (
                                <ul
                                  style={{
                                    margin: 0,
                                    paddingLeft:
                                      18,
                                    color:
                                      "#475569",
                                    fontSize:
                                      11,
                                    lineHeight:
                                      1.65,
                                  }}
                                >
                                  {aiResult.strengths.map(
                                    (
                                      item,
                                      index
                                    ) => (
                                      <li
                                        key={
                                          index
                                        }
                                      >
                                        {item}
                                      </li>
                                    )
                                  )}
                                </ul>
                              ) : (
                                <div
                                  style={{
                                    color:
                                      "#64748b",
                                    fontSize:
                                      11,
                                  }}
                                >
                                  No specific
                                  strengths
                                  were
                                  returned.
                                </div>
                              )}
                            </div>

                            <div
                              style={{
                                background:
                                  "#fff",
                                border:
                                  "1px solid #e2e8f0",
                                borderRadius:
                                  11,
                                padding:
                                  "13px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize:
                                    10,
                                  fontWeight:
                                    900,
                                  color:
                                    "#b45309",
                                  textTransform:
                                    "uppercase",
                                  letterSpacing:
                                    "0.05em",
                                  marginBottom:
                                    8,
                                }}
                              >
                                Areas to improve
                              </div>

                              {Array.isArray(
                                aiResult.improvements
                              ) &&
                              aiResult
                                .improvements
                                .length >
                                0 ? (
                                <ul
                                  style={{
                                    margin: 0,
                                    paddingLeft:
                                      18,
                                    color:
                                      "#475569",
                                    fontSize:
                                      11,
                                    lineHeight:
                                      1.65,
                                  }}
                                >
                                  {aiResult.improvements.map(
                                    (
                                      item,
                                      index
                                    ) => (
                                      <li
                                        key={
                                          index
                                        }
                                      >
                                        {item}
                                      </li>
                                    )
                                  )}
                                </ul>
                              ) : (
                                <div
                                  style={{
                                    color:
                                      "#64748b",
                                    fontSize:
                                      11,
                                  }}
                                >
                                  No specific
                                  improvements
                                  were
                                  returned.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* =======================================================
            RESULTS
        ======================================================== */}
        <section
          style={{
            marginTop: 24,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 21,
            padding: "24px",
            boxShadow:
              "0 8px 26px rgba(15,23,42,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  color: "#2563eb",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                Academic Performance
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: 25,
                  letterSpacing: "-0.03em",
                }}
              >
                My Results
              </h2>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#64748b",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                View your published results and current
                academic performance.
              </p>
            </div>

            <div
              style={{
                padding: "10px 14px",
                borderRadius: 11,
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#1d4ed8",
                fontSize: 13,
                fontWeight: 850,
              }}
            >
              GPA:{" "}
              {results.length > 0
                ? gpa.toFixed(2)
                : "—"}
            </div>
          </div>

          {resultsLoading ? (
            <div
              style={{
                padding: "35px 20px",
                textAlign: "center",
                color: "#64748b",
                fontSize: 13,
              }}
            >
              Loading your results...
            </div>
          ) : results.length === 0 ? (
            <div
              style={{
                border: "1px dashed #cbd5e1",
                borderRadius: 14,
                padding: "35px 20px",
                textAlign: "center",
                background: "#f8fafc",
                color: "#64748b",
                fontSize: 13,
              }}
            >
              No published results are available yet.
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
                border: "1px solid #e2e8f0",
                borderRadius: 13,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 650,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                      borderBottom:
                        "1px solid #e2e8f0",
                    }}
                  >
                    <th
                      style={{
                        textAlign: "left",
                        padding:
                          "12px 14px",
                        fontSize: 10,
                        color: "#64748b",
                        fontWeight: 900,
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.05em",
                      }}
                    >
                      Subject
                    </th>

                    <th
                      style={{
                        textAlign: "left",
                        padding:
                          "12px 14px",
                        fontSize: 10,
                        color: "#64748b",
                        fontWeight: 900,
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.05em",
                      }}
                    >
                      Session
                    </th>

                    <th
                      style={{
                        textAlign: "left",
                        padding:
                          "12px 14px",
                        fontSize: 10,
                        color: "#64748b",
                        fontWeight: 900,
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.05em",
                      }}
                    >
                      Term
                    </th>

                    <th
                      style={{
                        textAlign: "center",
                        padding:
                          "12px 14px",
                        fontSize: 10,
                        color: "#64748b",
                        fontWeight: 900,
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.05em",
                      }}
                    >
                      Score
                    </th>

                    <th
                      style={{
                        textAlign: "center",
                        padding:
                          "12px 14px",
                        fontSize: 10,
                        color: "#64748b",
                        fontWeight: 900,
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.05em",
                      }}
                    >
                      Grade
                    </th>

                    <th
                      style={{
                        textAlign: "left",
                        padding:
                          "12px 14px",
                        fontSize: 10,
                        color: "#64748b",
                        fontWeight: 900,
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.05em",
                      }}
                    >
                      Remark
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((result) => (
                    <tr
                      key={result.id}
                      style={{
                        borderBottom:
                          "1px solid #f1f5f9",
                      }}
                    >
                      <td
                        style={{
                          padding:
                            "15px 14px",
                          fontSize: 12,
                          fontWeight: 800,
                          color: "#0f172a",
                        }}
                      >
                        {result.subject?.name ||
                          "Subject"}
                      </td>

                      <td
                        style={{
                          padding:
                            "15px 14px",
                          fontSize: 12,
                          color: "#475569",
                        }}
                      >
                        {result.session}
                      </td>

                      <td
                        style={{
                          padding:
                            "15px 14px",
                          fontSize: 12,
                          color: "#475569",
                        }}
                      >
                        {result.term}
                      </td>

                      <td
                        style={{
                          padding:
                            "15px 14px",
                          textAlign:
                            "center",
                          fontSize: 13,
                          fontWeight: 850,
                          color: "#0f172a",
                        }}
                      >
                        {result.score}
                      </td>

                      <td
                        style={{
                          padding:
                            "15px 14px",
                          textAlign:
                            "center",
                          fontSize: 13,
                          fontWeight: 900,
                        }}
                      >
                        <span
                          style={{
                            display:
                              "inline-flex",
                            minWidth: 30,
                            justifyContent:
                              "center",
                            padding:
                              "5px 7px",
                            borderRadius: 7,
                            background:
                              result.grade ===
                              "F"
                                ? "#fef2f2"
                                : "#ecfdf5",
                            color:
                              result.grade ===
                              "F"
                                ? "#dc2626"
                                : "#047857",
                          }}
                        >
                          {result.grade}
                        </span>
                      </td>

                      <td
                        style={{
                          padding:
                            "15px 14px",
                          fontSize: 12,
                          color: "#475569",
                        }}
                      >
                        {result.remark || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* =========================================================
          DOBI CHAT BUTTON
      ========================================================== */}
      <button
        type="button"
        onClick={() =>
          setChatOpen((current) => !current)
        }
        aria-label="Open Dobi"
        style={{
          position: "fixed",
          right: 22,
          bottom: 22,
          width: 58,
          height: 58,
          borderRadius: "50%",
          border: "none",
          background:
            "linear-gradient(135deg, #4f46e5, #7c3aed)",
          color: "#fff",
          fontSize: 22,
          cursor: "pointer",
          boxShadow:
            "0 14px 34px rgba(79,70,229,0.30)",
          zIndex: 500,
        }}
      >
        🤖
      </button>

      {/* =========================================================
          DOBI CHAT
      ========================================================== */}
      {chatOpen && (
        <div
          className="dobi-chat"
          style={{
            position: "fixed",
            right: 22,
            bottom: 92,
            width:
              "min(400px, calc(100vw - 30px))",
            height: 550,
            maxHeight:
              "calc(100vh - 110px)",
            background: "#fff",
            borderRadius: 19,
            border: "1px solid #e2e8f0",
            boxShadow:
              "0 25px 65px rgba(15,23,42,0.20)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 499,
          }}
        >
          {/* Chat header */}
          <div
            style={{
              padding: "16px 17px",
              background:
                "linear-gradient(135deg, #4f46e5, #7c3aed)",
              color: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius: 10,
                    background:
                      "rgba(255,255,255,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    fontSize: 18,
                  }}
                >
                  🤖
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                    }}
                  >
                    Dobi
                  </div>

                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 10,
                      color:
                        "rgba(255,255,255,0.76)",
                    }}
                  >
                    Your Learning Assistant
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setChatOpen(false)
                }
                aria-label="Close Dobi"
                style={{
                  border: "none",
                  background:
                    "rgba(255,255,255,0.10)",
                  color: "#fff",
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 17,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                marginTop: 9,
                fontSize: 11,
                color:
                  "rgba(255,255,255,0.78)",
              }}
            >
              Ask me about your academic
              performance.
            </div>
          </div>

          {/* Chat messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 15,
              background: "#f8fafc",
            }}
          >
            {chatMessages.length === 0 && (
              <>
                <div
                  style={{
                    padding: 14,
                    borderRadius: 13,
                    background:
                      "#eef2ff",
                    border:
                      "1px solid #c7d2fe",
                    color: "#3730a3",
                    fontSize: 12,
                    lineHeight: 1.65,
                  }}
                >
                  <strong>
                    Hi {firstName}! 👋
                  </strong>

                  <br />
                  <br />

                  I'm Dobi. I can help you
                  understand your results,
                  assignments, GPA and areas
                  you may want to focus on.
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 7,
                    marginTop: 10,
                  }}
                >
                  {[
                    "What is my GPA?",
                    "How are my assignments?",
                    "What should I improve?",
                  ].map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() =>
                        setChatMessage(
                          question
                        )
                      }
                      style={{
                        border:
                          "1px solid #c7d2fe",
                        background: "#fff",
                        color:
                          "#4338ca",
                        borderRadius: 9,
                        padding:
                          "8px 9px",
                        fontSize: 10,
                        fontWeight: 750,
                        cursor: "pointer",
                      }}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </>
            )}

            {chatMessages.map(
              (item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent:
                      item.role === "user"
                        ? "flex-end"
                        : "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      maxWidth: "85%",
                      padding:
                        "10px 12px",
                      borderRadius: 12,
                      background:
                        item.role ===
                        "user"
                          ? "#4f46e5"
                          : "#fff",
                      color:
                        item.role ===
                        "user"
                          ? "#fff"
                          : "#334155",
                      border:
                        item.role ===
                        "user"
                          ? "none"
                          : "1px solid #e2e8f0",
                      fontSize: 12,
                      lineHeight: 1.6,
                      whiteSpace:
                        "pre-wrap",
                    }}
                  >
                    {item.content}
                  </div>
                </div>
              )
            )}

            {chatLoading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  color: "#64748b",
                  fontSize: 11,
                  padding: 8,
                }}
              >
                <span>🤖</span>
                Dobi is thinking...
              </div>
            )}
          </div>

          {/* Chat input */}
          <form
            onSubmit={async (event) => {
              event.preventDefault();

              const text =
                chatMessage.trim();

              if (!text || chatLoading) {
                return;
              }

              setChatMessages(
                (current) => [
                  ...current,
                  {
                    role: "user",
                    content: text,
                  },
                ]
              );

              setChatMessage("");
              setChatLoading(true);

              try {
                const response =
                  await fetch(
                    `${API_URL}/ai/student/chat`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type":
                          "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        message: text,
                      }),
                    }
                  );

                const data =
                  await response.json();

                if (!response.ok) {
                  throw new Error(
                    data.message ||
                      "Dobi could not respond."
                  );
                }

                setChatMessages(
                  (current) => [
                    ...current,
                    {
                      role: "assistant",
                      content:
                        data.reply ||
                        "I couldn't generate a response right now.",
                    },
                  ]
                );
              } catch (err) {
                setChatMessages(
                  (current) => [
                    ...current,
                    {
                      role: "assistant",
                      content:
                        err.message ||
                        "Dobi is currently unavailable.",
                    },
                  ]
                );
              } finally {
                setChatLoading(false);
              }
            }}
            style={{
              display: "flex",
              gap: 8,
              padding: 11,
              borderTop:
                "1px solid #e2e8f0",
              background: "#fff",
            }}
          >
            <input
              value={chatMessage}
              onChange={(event) =>
                setChatMessage(
                  event.target.value
                )
              }
              placeholder="Ask Dobi..."
              style={{
                flex: 1,
                minWidth: 0,
                border:
                  "1px solid #cbd5e1",
                borderRadius: 9,
                padding:
                  "10px 11px",
                fontFamily: "inherit",
                fontSize: 12,
                outline: "none",
              }}
            />

            <button
              type="submit"
              disabled={chatLoading}
              style={{
                border: "none",
                borderRadius: 9,
                padding: "0 13px",
                background:
                  chatLoading
                    ? "#a5b4fc"
                    : "#4f46e5",
                color: "#fff",
                fontWeight: 800,
                cursor: chatLoading
                  ? "wait"
                  : "pointer",
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* =========================================================
          STYLES
      ========================================================== */}
      <style>
        {`
          @keyframes studentDashboardSpin {
            to {
              transform: rotate(360deg);
            }
          }

          .dobi-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.18);
            backdrop-filter: blur(2px);
            z-index: 999;
          }

          @media (max-width: 760px) {
            .student-name {
              display: none !important;
            }

            .portal-student main {
              padding-left: 14px !important;
              padding-right: 14px !important;
            }

            .portal-student header {
              padding-left: 14px !important;
              padding-right: 14px !important;
            }

            .portal-student section {
              border-radius: 17px !important;
            }
          }

          @media (max-width: 640px) {
            .dobi-insight-popup {
              top: 68px !important;
              right: 15px !important;
              left: 15px !important;
              width: auto !important;
              max-width: none !important;
              max-height: calc(100vh - 82px) !important;
            }

            .dobi-chat {
              right: 15px !important;
              bottom: 86px !important;
              width: calc(100vw - 30px) !important;
              height: calc(100vh - 125px) !important;
              max-height: none !important;
            }

            .portal-student main {
              padding-top: 20px !important;
            }
          }
        `}
      </style>
    </div>
  );
}