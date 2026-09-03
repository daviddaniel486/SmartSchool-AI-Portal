import { useEffect, useState } from "react";

const API_URL = "https://smart-school-api-tan.vercel.app/api";

function ParentDashboard() {
const [children, setChildren] = useState([]);
const [contacts, setContacts] = useState([]);
const [inbox, setInbox] = useState([]);
const [sentMessages, setSentMessages] = useState([]);

const [loading, setLoading] = useState(true);
const [messageLoading, setMessageLoading] = useState(false);
const [sending, setSending] = useState(false);

const [error, setError] = useState("");
const [success, setSuccess] = useState("");

const [activeSection, setActiveSection] = useState("overview");
const [selectedChild, setSelectedChild] = useState(null);
const [selectedConversation, setSelectedConversation] = useState(null);
const [conversation, setConversation] = useState([]);

const [receiverId, setReceiverId] = useState("");
const [subject, setSubject] = useState("");
const [content, setContent] = useState("");

const token = localStorage.getItem("token");
const userId = Number(localStorage.getItem("userId"));

const authHeaders = {
Authorization: `Bearer ${token}`,
};

const loadChildren = async () => {
try {
const response = await fetch(`${API_URL}/parents/me/children`, {
headers: authHeaders,
});


  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load children");
  }

  setChildren(data.children || []);
} catch (error) {
  console.error("Load children error:", error);
  setError(error.message);
}


};

const loadContacts = async () => {
try {
const response = await fetch(`${API_URL}/messages/contacts`, {
headers: authHeaders,
});


  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load contacts");
  }

  setContacts(data.contacts || []);
} catch (error) {
  console.error("Load contacts error:", error);
  setError(error.message);
}


};

const loadInbox = async () => {
try {
const response = await fetch(`${API_URL}/messages/inbox`, {
headers: authHeaders,
});


  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load inbox");
  }

  setInbox(data.messages || []);
} catch (error) {
  console.error("Load inbox error:", error);
  setError(error.message);
}


};

const loadSentMessages = async () => {
try {
const response = await fetch(`${API_URL}/messages/sent`, {
headers: authHeaders,
});


  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load sent messages");
  }

  setSentMessages(data.messages || []);
} catch (error) {
  console.error("Load sent messages error:", error);
  setError(error.message);
}


};

const loadAllData = async () => {
try {
setLoading(true);
setError("");


  await Promise.all([
    loadChildren(),
    loadContacts(),
    loadInbox(),
    loadSentMessages(),
  ]);
} catch (error) {
  console.error("Parent dashboard error:", error);
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


loadAllData();


}, []);

const loadConversation = async (contactId) => {
try {
setMessageLoading(true);
setError("");


  const response = await fetch(
    `${API_URL}/messages/conversation/${contactId}`,
    {
      headers: authHeaders,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load conversation"
    );
  }

  setConversation(data.messages || []);
  setSelectedConversation(contactId);

  await loadInbox();
} catch (error) {
  console.error("Load conversation error:", error);
  setError(error.message);
} finally {
  setMessageLoading(false);
}


};

const sendMessage = async (event) => {
event.preventDefault();

try {
  setSending(true);
  setError("");
  setSuccess("");

  if (!receiverId) {
    throw new Error("Please select a recipient.");
  }

  if (!content.trim()) {
    throw new Error("Please enter a message.");
  }

  const response = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      receiverId: Number(receiverId),
      subject: subject.trim(),
      content: content.trim(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to send message"
    );
  }

  setSuccess("Message sent successfully.");
  setSubject("");
  setContent("");

  await loadSentMessages();

  if (Number(receiverId) === selectedConversation) {
    await loadConversation(Number(receiverId));
  }
} catch (error) {
  console.error("Send message error:", error);
  setError(error.message);
} finally {
  setSending(false);
}


};

const logout = () => {
localStorage.removeItem("token");
localStorage.removeItem("userId");
window.location.reload();
};

const getFullName = (user) => {
if (!user) return "Unknown user";


return `${user.firstName || ""} ${
  user.lastName || ""
}`.trim();


};

const getInitials = (user) => {
if (!user) return "?";


const first = user.firstName?.charAt(0) || "";
const last = user.lastName?.charAt(0) || "";

return `${first}${last}`.toUpperCase();


};

const teacherContacts = contacts.filter(
(contact) => contact.role === "TEACHER"
);

const unreadCount = inbox.filter(
(message) => !message.isRead
).length;

const publishedResults = children.reduce(
(total, child) =>
total +
(child.results?.filter(
(result) => result.status === "PUBLISHED"
).length || 0),
0
);

const assignmentCount = children.reduce(
(total, child) =>
total + (child.submissions?.length || 0),
0
);

const menuItems = [
{
id: "overview",
label: "Overview",
icon: "⌂",
},
{
id: "children",
label: "My Children",
icon: "♙",
count: children.length,
},
{
id: "messages",
label: "Messages",
icon: "✉",
count: unreadCount,
},
{
id: "send",
label: "Contact Teacher",
icon: "◉",
},
];

if (loading) {
return ( <div style={styles.loadingPage}> <div style={styles.loadingCard}> <div style={styles.loadingLogo}>SS</div> <div style={styles.spinner}></div>
<h2 style={{ margin: "20px 0 6px" }}>
Preparing your dashboard </h2>
<p style={{ color: "#64748b", margin: 0 }}>
Loading your school information... </p> </div> </div>
);
}

return ( <div className="portal-page portal-parent" style={styles.app}> <aside style={styles.sidebar}> <div style={styles.brand}> <div style={styles.brandMark}>S</div> <div> <div style={styles.brandName}>Smart School</div> <div style={styles.brandSub}>Parent Portal</div> </div> </div>


    <div style={styles.sidebarSection}>
      <div style={styles.sidebarLabel}>MENU</div>

      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveSection(item.id)}
          style={{
            ...styles.sidebarButton,
            ...(activeSection === item.id
              ? styles.sidebarButtonActive
              : {}),
          }}
        >
          <span style={styles.menuIcon}>{item.icon}</span>
          <span style={{ flex: 1, textAlign: "left" }}>
            {item.label}
          </span>

          {item.count > 0 && (
            <span
              style={{
                ...styles.menuCount,
                ...(activeSection === item.id
                  ? styles.menuCountActive
                  : {}),
              }}
            >
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>

    <div style={styles.sidebarBottom}>
      <div style={styles.helpCard}>
        <div style={styles.helpIcon}>?</div>
        <div>
          <strong style={{ fontSize: "13px" }}>
            Need help?
          </strong>
          <p style={styles.helpText}>
            Contact the school office for assistance.
          </p>
        </div>
      </div>

      <button
        onClick={logout}
        style={styles.logoutButton}
      >
        <span>↪</span>
        Sign out
      </button>
    </div>
  </aside>

  <main style={styles.main}>
    <header style={styles.topbar}>
      <div>
        <div style={styles.mobileBrand}>
          Smart School
        </div>
        <p style={styles.breadcrumb}>
          Parent Portal
          <span style={{ margin: "0 8px" }}>›</span>
          {menuItems.find(
            (item) => item.id === activeSection
          )?.label || "Overview"}
        </p>
      </div>

      <div style={styles.topbarRight}>
        <button
          onClick={() => {
            loadAllData();
          }}
          style={styles.refreshButton}
          title="Refresh"
        >
          ↻
        </button>

        <div style={styles.profileMini}>
          <div style={styles.profileAvatar}>P</div>
          <div style={{ display: "none" }}>
            Parent
          </div>
        </div>
      </div>
    </header>

    <div style={styles.content}>
      {success && (
        <div style={styles.successAlert}>
          <span style={styles.alertIcon}>✓</span>
          <span>{success}</span>
          <button
            onClick={() => setSuccess("")}
            style={styles.alertClose}
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div style={styles.errorAlert}>
          <span style={styles.alertIcon}>!</span>
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            style={styles.alertClose}
          >
            ×
          </button>
        </div>
      )}

      {activeSection === "overview" && (
        <section>
          <div style={styles.welcome}>
            <div>
              <span style={styles.eyebrow}>
                PARENT DASHBOARD
              </span>
              <h1 style={styles.pageTitle}>
                Welcome back
              </h1>
              <p style={styles.pageSubtitle}>
                Keep track of your children's school
                progress, results and communication.
              </p>
            </div>

            <div style={styles.welcomeDecoration}>
              <div style={styles.decorationCircleOne}></div>
              <div style={styles.decorationCircleTwo}></div>
              <div style={styles.decorationBook}>▱</div>
            </div>
          </div>

          <div style={styles.statsGrid}>
            <StatCard
              icon="♙"
              title="Children"
              value={children.length}
              color="#7c3aed"
              bg="#f3e8ff"
            />

            <StatCard
              icon="✓"
              title="Published Results"
              value={publishedResults}
              color="#059669"
              bg="#d1fae5"
            />

            <StatCard
              icon="□"
              title="Assignments"
              value={assignmentCount}
              color="#2563eb"
              bg="#dbeafe"
            />

            <StatCard
              icon="✉"
              title="Unread Messages"
              value={unreadCount}
              color="#ea580c"
              bg="#ffedd5"
            />
          </div>

          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Your Children
              </h2>
              <p style={styles.sectionSubtitle}>
                A quick look at your children's school
                information.
              </p>
            </div>

            <button
              onClick={() =>
                setActiveSection("children")
              }
              style={styles.textButton}
            >
              View all →
            </button>
          </div>

          {children.length === 0 ? (
            <EmptyState
              icon="♙"
              title="No children linked"
              text="No student has been linked to your parent account yet."
            />
          ) : (
            <div style={styles.childrenGrid}>
              {children.slice(0, 3).map((child) => (
                <ChildSummaryCard
                  key={child.id}
                  child={child}
                  getFullName={getFullName}
                  getInitials={getInitials}
                  onClick={() => {
                    setSelectedChild(child);
                    setActiveSection("children");
                  }}
                />
              ))}
            </div>
          )}

          <div style={styles.quickGrid}>
            <button
              onClick={() => setActiveSection("messages")}
              style={styles.quickCard}
            >
              <div
                style={{
                  ...styles.quickIcon,
                  backgroundColor: "#ede9fe",
                  color: "#7c3aed",
                }}
              >
                ✉
              </div>
              <div>
                <strong>Check messages</strong>
                <p>
                  {unreadCount
                    ? `${unreadCount} unread message${
                        unreadCount > 1 ? "s" : ""
                      }`
                    : "You're all caught up"}
                </p>
              </div>
              <span style={styles.quickArrow}>→</span>
            </button>

            <button
              onClick={() => setActiveSection("send")}
              style={styles.quickCard}
            >
              <div
                style={{
                  ...styles.quickIcon,
                  backgroundColor: "#dbeafe",
                  color: "#2563eb",
                }}
              >
                ◉
              </div>
              <div>
                <strong>Contact a teacher</strong>
                <p>
                  Reach your child's teachers directly
                </p>
              </div>
              <span style={styles.quickArrow}>→</span>
            </button>
          </div>
        </section>
      )}

      {activeSection === "children" && (
        <section>
          <div style={styles.pageHeadingRow}>
            <div>
              <span style={styles.eyebrow}>
                FAMILY
              </span>
              <h1 style={styles.pageTitle}>
                My Children
              </h1>
              <p style={styles.pageSubtitle}>
                View school information, courses,
                results and assignments.
              </p>
            </div>

            <div style={styles.childCountBadge}>
              {children.length}{" "}
              {children.length === 1
                ? "Child"
                : "Children"}
            </div>
          </div>

          {children.length === 0 ? (
            <EmptyState
              icon="♙"
              title="No children linked"
              text="No student has been linked to your parent account yet."
            />
          ) : (
            <div style={styles.childrenList}>
              {children.map((child) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  getFullName={getFullName}
                  getInitials={getInitials}
                  selected={
                    selectedChild?.id === child.id
                  }
                  onSelect={() =>
                    setSelectedChild(
                      selectedChild?.id === child.id
                        ? null
                        : child
                    )
                  }
                />
              ))}
            </div>
          )}
        </section>
      )}

      {activeSection === "messages" && (
        <section>
          <div style={styles.pageHeadingRow}>
            <div>
              <span style={styles.eyebrow}>
                COMMUNICATION
              </span>
              <h1 style={styles.pageTitle}>
                Messages
              </h1>
              <p style={styles.pageSubtitle}>
                Stay connected with your child's
                teachers and school.
              </p>
            </div>

            {unreadCount > 0 && (
              <div style={styles.unreadBadge}>
                {unreadCount} unread
              </div>
            )}
          </div>

          <div style={styles.messagesLayout}>
            <div style={styles.inboxPanel}>
              <div style={styles.panelHeader}>
                <div>
                  <h3 style={styles.panelTitle}>
                    Inbox
                  </h3>
                  <p style={styles.panelSubtitle}>
                    {inbox.length} total messages
                  </p>
                </div>

                <button
                  onClick={loadInbox}
                  style={styles.smallIconButton}
                >
                  ↻
                </button>
              </div>

              {inbox.length === 0 ? (
                <div style={styles.smallEmpty}>
                  <div style={styles.emptyIcon}>✉</div>
                  <strong>No messages yet</strong>
                  <p>
                    Messages from teachers will appear
                    here.
                  </p>
                </div>
              ) : (
                <div>
                  {inbox.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() =>
                        loadConversation(msg.sender.id)
                      }
                      style={{
                        ...styles.messageItem,
                        ...(selectedConversation ===
                        msg.sender.id
                          ? styles.messageItemActive
                          : {}),
                        ...(msg.isRead
                          ? {}
                          : styles.messageItemUnread),
                      }}
                    >
                      <div
                        style={styles.messageAvatar}
                      >
                        {getInitials(msg.sender)}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={
                            styles.messageTopLine
                          }
                        >
                          <strong>
                            {getFullName(
                              msg.sender
                            )}
                          </strong>

                          {!msg.isRead && (
                            <span
                              style={
                                styles.unreadDot
                              }
                            ></span>
                          )}
                        </div>

                        <div
                          style={styles.messageSubject}
                        >
                          {msg.subject ||
                            "No subject"}
                        </div>

                        <div
                          style={styles.messageDate}
                        >
                          {new Date(
                            msg.createdAt
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.conversationPanel}>
              <div style={styles.panelHeader}>
                <div>
                  <h3 style={styles.panelTitle}>
                    Conversation
                  </h3>
                  <p style={styles.panelSubtitle}>
                    {selectedConversation
                      ? "Your conversation"
                      : "Select a message to begin"}
                  </p>
                </div>
              </div>

              {messageLoading ? (
                <div style={styles.conversationEmpty}>
                  <div style={styles.spinnerSmall}></div>
                  <p>Loading conversation...</p>
                </div>
              ) : selectedConversation ? (
                <div style={styles.conversationBody}>
                  <div
                    style={styles.messageHistory}
                  >
                    {conversation.length === 0 ? (
                      <div
                        style={
                          styles.conversationEmpty
                        }
                      >
                        <div
                          style={styles.emptyIcon}
                        >
                          ✉
                        </div>
                        <p>No messages yet.</p>
                      </div>
                    ) : (
                      conversation.map((msg) => {
                        const isMine =
                          msg.senderId === userId;

                        return (
                          <div
                            key={msg.id}
                            style={{
                              display: "flex",
                              justifyContent: isMine
                                ? "flex-end"
                                : "flex-start",
                              marginBottom: "14px",
                            }}
                          >
                            <div
                              style={{
                                maxWidth: "72%",
                                padding: "13px 16px",
                                borderRadius: isMine
                                  ? "16px 16px 4px 16px"
                                  : "16px 16px 16px 4px",
                                backgroundColor: isMine
                                  ? "#7c3aed"
                                  : "#f1f5f9",
                                color: isMine
                                  ? "white"
                                  : "#1e293b",
                              }}
                            >
                              {msg.subject && (
                                <strong
                                  style={{
                                    display: "block",
                                    marginBottom:
                                      "6px",
                                  }}
                                >
                                  {msg.subject}
                                </strong>
                              )}

                              <div
                                style={{
                                  whiteSpace:
                                    "pre-wrap",
                                  lineHeight: 1.5,
                                }}
                              >
                                {msg.content}
                              </div>

                              <small
                                style={{
                                  display: "block",
                                  marginTop: "8px",
                                  opacity: 0.65,
                                  fontSize: "11px",
                                }}
                              >
                                {new Date(
                                  msg.createdAt
                                ).toLocaleString()}
                              </small>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setReceiverId(
                        String(selectedConversation)
                      );
                      setActiveSection("send");
                    }}
                    style={styles.replyButton}
                  >
                    Reply to conversation
                  </button>
                </div>
              ) : (
                <div style={styles.conversationEmpty}>
                  <div
                    style={{
                      ...styles.largeEmptyIcon,
                      backgroundColor: "#f3e8ff",
                      color: "#7c3aed",
                    }}
                  >
                    ✉
                  </div>
                  <h3 style={{ margin: "15px 0 5px" }}>
                    Select a message
                  </h3>
                  <p>
                    Choose a message from your inbox
                    to view the conversation.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div style={styles.sentPanel}>
            <div style={styles.panelHeader}>
              <div>
                <h3 style={styles.panelTitle}>
                  Sent Messages
                </h3>
                <p style={styles.panelSubtitle}>
                  Messages you've sent
                </p>
              </div>
            </div>

            {sentMessages.length === 0 ? (
              <div style={styles.smallEmpty}>
                <p>No sent messages yet.</p>
              </div>
            ) : (
              <div>
                {sentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={styles.sentMessage}
                  >
                    <div
                      style={styles.sentMessageAvatar}
                    >
                      {getInitials(msg.receiver)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          gap: "15px",
                        }}
                      >
                        <strong>
                          To:{" "}
                          {getFullName(
                            msg.receiver
                          )}
                        </strong>

                        <small
                          style={{
                            color: "#94a3b8",
                          }}
                        >
                          {new Date(
                            msg.createdAt
                          ).toLocaleDateString()}
                        </small>
                      </div>

                      <div
                        style={{
                          fontWeight: 600,
                          marginTop: "5px",
                        }}
                      >
                        {msg.subject ||
                          "No subject"}
                      </div>

                      <p
                        style={{
                          margin:
                            "5px 0 0",
                          color: "#64748b",
                          whiteSpace:
                            "pre-wrap",
                        }}
                      >
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeSection === "send" && (
        <section>
          <div style={styles.pageHeadingRow}>
            <div>
              <span style={styles.eyebrow}>
                COMMUNICATION
              </span>
              <h1 style={styles.pageTitle}>
                Contact a Teacher
              </h1>
              <p style={styles.pageSubtitle}>
                Send a private message to one of your
                child's teachers.
              </p>
            </div>
          </div>

          <div style={styles.composeLayout}>
            <div style={styles.composeCard}>
              <form onSubmit={sendMessage}>
                <label style={styles.formLabel}>
                  Teacher
                </label>

                {teacherContacts.length === 0 ? (
                  <div style={styles.noTeachers}>
                    <div style={styles.noTeacherIcon}>
                      !
                    </div>
                    <div>
                      <strong>
                        No teachers available
                      </strong>
                      <p>
                        There are currently no teachers
                        available to contact.
                      </p>
                    </div>
                  </div>
                ) : (
                  <select
                    value={receiverId}
                    onChange={(event) =>
                      setReceiverId(
                        event.target.value
                      )
                    }
                    required
                    style={styles.formInput}
                  >
                    <option value="">
                      Select a teacher
                    </option>

                    {teacherContacts.map(
                      (teacher) => (
                        <option
                          key={teacher.id}
                          value={teacher.id}
                        >
                          {getFullName(teacher)} (
                          {teacher.email})
                        </option>
                      )
                    )}
                  </select>
                )}

                <label style={styles.formLabel}>
                  Subject
                </label>

                <input
                  type="text"
                  value={subject}
                  onChange={(event) =>
                    setSubject(event.target.value)
                  }
                  placeholder="What would you like to discuss?"
                  style={styles.formInput}
                />

                <label style={styles.formLabel}>
                  Message
                </label>

                <textarea
                  value={content}
                  onChange={(event) =>
                    setContent(event.target.value)
                  }
                  placeholder="Write your message here..."
                  rows="8"
                  required
                  style={{
                    ...styles.formInput,
                    resize: "vertical",
                    minHeight: "170px",
                  }}
                />

                <div style={styles.formFooter}>
                  <span style={styles.formHint}>
                    Your message will be sent privately
                    to the selected teacher.
                  </span>

                  <button
                    type="submit"
                    disabled={
                      sending ||
                      teacherContacts.length === 0
                    }
                    style={{
                      ...styles.sendButton,
                      ...(sending ||
                      teacherContacts.length === 0
                        ? styles.sendButtonDisabled
                        : {}),
                    }}
                  >
                    {sending
                      ? "Sending..."
                      : "Send Message  →"}
                  </button>
                </div>
              </form>
            </div>

            <div style={styles.contactInfo}>
              <div style={styles.contactInfoIcon}>
                ◉
              </div>
              <h3>Stay connected</h3>
              <p>
                Communication between parents and
                teachers helps keep everyone informed
                about a student's progress.
              </p>

              <div style={styles.infoDivider}></div>

              <div style={styles.infoRow}>
                <span>Available teachers</span>
                <strong>
                  {teacherContacts.length}
                </strong>
              </div>

              <div style={styles.infoRow}>
                <span>Messages sent</span>
                <strong>
                  {sentMessages.length}
                </strong>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  </main>
</div>


);
}

function StatCard({
icon,
title,
value,
color,
bg,
}) {
return ( <div style={styles.statCard}>
<div
style={{
...styles.statIcon,
color,
backgroundColor: bg,
}}
>
{icon} </div>


  <div>
    <p style={styles.statTitle}>{title}</p>
    <div style={styles.statValue}>{value}</div>
  </div>
</div>


);
}

function ChildSummaryCard({
child,
getFullName,
getInitials,
onClick,
}) {
return ( <button
   onClick={onClick}
   style={styles.childSummary}
 >
<div
style={{
...styles.childAvatar,
backgroundColor: "#ede9fe",
color: "#7c3aed",
}}
>
{getInitials(child.user)} </div>


  <div style={{ flex: 1, textAlign: "left" }}>
    <h3 style={styles.childName}>
      {getFullName(child.user)}
    </h3>

    <p style={styles.childAdmission}>
      {child.admissionNo || "No admission number"}
    </p>

    <span style={styles.classBadge}>
      {child.class?.name || "Class not assigned"}
    </span>
  </div>

  <span style={styles.childArrow}>→</span>
</button>


);
}

function ChildCard({
child,
getFullName,
getInitials,
selected,
onSelect,
}) {
const publishedResults =
child.results?.filter(
(result) => result.status === "PUBLISHED"
) || [];

return ( <div style={styles.childCard}> <button
     onClick={onSelect}
     style={styles.childCardHeader}
   >
<div
style={{
...styles.largeChildAvatar,
backgroundColor: selected
? "#7c3aed"
: "#ede9fe",
color: selected ? "white" : "#7c3aed",
}}
>
{getInitials(child.user)} </div>


    <div style={{ flex: 1, textAlign: "left" }}>
      <h2 style={styles.childCardName}>
        {getFullName(child.user)}
      </h2>

      <p style={styles.childCardMeta}>
        Admission No. {child.admissionNo || "—"}
      </p>
    </div>

    <span
      style={{
        ...styles.expandIcon,
        transform: selected
          ? "rotate(180deg)"
          : "rotate(0deg)",
      }}
    >
      ↓
    </span>
  </button>

  <div style={styles.childQuickStats}>
    <div>
      <span>Class</span>
      <strong>
        {child.class?.name || "Not assigned"}
      </strong>
    </div>

    <div>
      <span>Level</span>
      <strong>
        {child.class?.level || "Not specified"}
      </strong>
    </div>

    <div>
      <span>Courses</span>
      <strong>
        {child.enrollments?.length || 0}
      </strong>
    </div>

    <div>
      <span>Results</span>
      <strong>{publishedResults.length}</strong>
    </div>
  </div>

  {selected && (
    <div style={styles.childDetails}>
      <DetailBlock title="School Information">
        <InfoLine
          label="Email"
          value={child.user?.email || "Not available"}
        />

        <InfoLine
          label="Class"
          value={
            child.class?.name || "Not assigned"
          }
        />

        {child.class?.teacher?.user && (
          <InfoLine
            label="Class Teacher"
            value={getFullName(
              child.class.teacher.user
            )}
          />
        )}
      </DetailBlock>

      <DetailBlock title="Courses">
        {!child.enrollments?.length ? (
          <p style={styles.mutedText}>
            No enrolled courses.
          </p>
        ) : (
          child.enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              style={styles.courseRow}
            >
              <div>
                <strong>
                  {enrollment.course?.title ||
                    "Course"}
                </strong>
                <span>
                  {enrollment.course?.code || "—"}
                </span>
              </div>

              {enrollment.course?.teacher?.user && (
                <small>
                  {getFullName(
                    enrollment.course.teacher.user
                  )}
                </small>
              )}
            </div>
          ))
        )}
      </DetailBlock>

      <DetailBlock title="Results">
        {!publishedResults.length ? (
          <p style={styles.mutedText}>
            No published results available.
          </p>
        ) : (
          publishedResults.map((result) => (
            <div
              key={result.id}
              style={styles.resultRow}
            >
              <div>
                <strong>
                  {result.subject?.name ||
                    "Subject"}
                </strong>
                <span>
                  {result.session} •{" "}
                  {result.term}
                </span>
              </div>

              <div style={styles.resultScore}>
                <strong>{result.score}</strong>
                <span>
                  Grade {result.grade || "—"}
                </span>
              </div>
            </div>
          ))
        )}
      </DetailBlock>

      <DetailBlock title="Assignments">
        {!child.submissions?.length ? (
          <p style={styles.mutedText}>
            No assignments found.
          </p>
        ) : (
          child.submissions.map((submission) => (
            <div
              key={submission.id}
              style={styles.assignmentRow}
            >
              <div>
                <strong>
                  {submission.assignment?.title ||
                    "Assignment"}
                </strong>

                {submission.score !== null &&
                  submission.score !==
                    undefined && (
                    <span>
                      Score:{" "}
                      {submission.score} /{" "}
                      {
                        submission.assignment
                          ?.maxScore
                      }
                    </span>
                  )}
              </div>

              <span
                style={{
                  ...styles.statusBadge,
                  ...(submission.status ===
                  "GRADED"
                    ? styles.statusGreen
                    : styles.statusBlue),
                }}
              >
                {submission.status}
              </span>
            </div>
          ))
        )}
      </DetailBlock>
    </div>
  )}
</div>


);
}

function DetailBlock({ title, children }) {
return ( <div style={styles.detailBlock}> <h3 style={styles.detailTitle}>{title}</h3>
{children} </div>
);
}

function InfoLine({ label, value }) {
return ( <div style={styles.infoLine}> <span>{label}</span> <strong>{value}</strong> </div>
);
}

function EmptyState({ icon, title, text }) {
return ( <div style={styles.emptyState}> <div style={styles.largeEmptyIcon}>{icon}</div> <h3>{title}</h3> <p>{text}</p> </div>
);
}

const styles = {
app: {
minHeight: "100vh",
backgroundColor: "#f8fafc",
color: "#1e293b",
fontFamily:
'-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
display: "flex",
},

sidebar: {
width: "245px",
minHeight: "100vh",
backgroundColor: "#ffffff",
borderRight: "1px solid #e2e8f0",
display: "flex",
flexDirection: "column",
position: "fixed",
left: 0,
top: 0,
bottom: 0,
zIndex: 10,
},

brand: {
height: "82px",
display: "flex",
alignItems: "center",
gap: "11px",
padding: "0 24px",
borderBottom: "1px solid #f1f5f9",
},

brandMark: {
width: "38px",
height: "38px",
borderRadius: "10px",
backgroundColor: "#7c3aed",
color: "white",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontWeight: 800,
fontSize: "19px",
},

brandName: {
fontWeight: 800,
fontSize: "16px",
color: "#172033",
},

brandSub: {
color: "#94a3b8",
fontSize: "11px",
marginTop: "2px",
},

sidebarSection: {
padding: "28px 14px",
},

sidebarLabel: {
color: "#94a3b8",
fontSize: "10px",
fontWeight: 800,
letterSpacing: "1px",
padding: "0 12px 10px",
},

sidebarButton: {
width: "100%",
border: "none",
backgroundColor: "transparent",
color: "#64748b",
padding: "11px 12px",
borderRadius: "8px",
display: "flex",
alignItems: "center",
gap: "11px",
cursor: "pointer",
fontSize: "13px",
fontWeight: 600,
marginBottom: "4px",
},

sidebarButtonActive: {
backgroundColor: "#f3e8ff",
color: "#6d28d9",
},

menuIcon: {
width: "20px",
textAlign: "center",
fontSize: "16px",
},

menuCount: {
minWidth: "20px",
height: "20px",
borderRadius: "10px",
backgroundColor: "#f1f5f9",
color: "#64748b",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontSize: "10px",
},

menuCountActive: {
backgroundColor: "#7c3aed",
color: "white",
},

sidebarBottom: {
marginTop: "auto",
padding: "14px",
},

helpCard: {
backgroundColor: "#f8fafc",
border: "1px solid #e2e8f0",
borderRadius: "10px",
padding: "13px",
display: "flex",
gap: "9px",
marginBottom: "12px",
},

helpIcon: {
width: "26px",
height: "26px",
borderRadius: "50%",
backgroundColor: "#ede9fe",
color: "#7c3aed",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontWeight: 800,
flexShrink: 0,
},

helpText: {
color: "#94a3b8",
fontSize: "11px",
lineHeight: 1.4,
margin: "4px 0 0",
},

logoutButton: {
width: "100%",
backgroundColor: "transparent",
border: "1px solid #e2e8f0",
color: "#64748b",
padding: "10px",
borderRadius: "8px",
cursor: "pointer",
display: "flex",
gap: "9px",
alignItems: "center",
justifyContent: "center",
fontWeight: 600,
},

main: {
flex: 1,
marginLeft: "245px",
minWidth: 0,
},

topbar: {
height: "82px",
backgroundColor: "white",
borderBottom: "1px solid #e2e8f0",
display: "flex",
alignItems: "center",
justifyContent: "space-between",
padding: "0 38px",
},

breadcrumb: {
color: "#94a3b8",
fontSize: "12px",
margin: 0,
},

mobileBrand: {
display: "none",
},

topbarRight: {
display: "flex",
alignItems: "center",
gap: "12px",
},

refreshButton: {
width: "34px",
height: "34px",
border: "1px solid #e2e8f0",
backgroundColor: "white",
borderRadius: "8px",
cursor: "pointer",
color: "#64748b",
fontSize: "18px",
},

profileMini: {
paddingLeft: "12px",
borderLeft: "1px solid #e2e8f0",
},

profileAvatar: {
width: "34px",
height: "34px",
borderRadius: "50%",
backgroundColor: "#ede9fe",
color: "#7c3aed",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontWeight: 800,
fontSize: "13px",
},

content: {
maxWidth: "1250px",
margin: "0 auto",
padding: "34px 38px 60px",
},

welcome: {
minHeight: "185px",
borderRadius: "14px",
backgroundColor: "#6d28d9",
color: "white",
padding: "32px 35px",
position: "relative",
overflow: "hidden",
display: "flex",
alignItems: "center",
justifyContent: "space-between",
marginBottom: "22px",
},

eyebrow: {
fontSize: "10px",
fontWeight: 800,
letterSpacing: "1.2px",
color: "#8b5cf6",
},

pageTitle: {
fontSize: "30px",
lineHeight: 1.2,
margin: "7px 0 8px",
letterSpacing: "-0.8px",
color: "#172033",
},

welcome: {
minHeight: "185px",
borderRadius: "14px",
backgroundColor: "#6d28d9",
color: "white",
padding: "32px 35px",
position: "relative",
overflow: "hidden",
display: "flex",
alignItems: "center",
justifyContent: "space-between",
marginBottom: "22px",
},

pageSubtitle: {
color: "#64748b",
margin: 0,
fontSize: "13px",
lineHeight: 1.6,
maxWidth: "650px",
},

welcomeDecoration: {
width: "230px",
height: "180px",
position: "relative",
flexShrink: 0,
},

decorationCircleOne: {
position: "absolute",
width: "170px",
height: "170px",
borderRadius: "50%",
backgroundColor: "rgba(255,255,255,0.08)",
right: "-30px",
top: "-50px",
},

decorationCircleTwo: {
position: "absolute",
width: "110px",
height: "110px",
borderRadius: "50%",
backgroundColor: "rgba(255,255,255,0.08)",
right: "60px",
bottom: "-35px",
},

decorationBook: {
position: "absolute",
right: "55px",
top: "48px",
fontSize: "65px",
color: "rgba(255,255,255,0.85)",
transform: "rotate(-8deg)",
},

statsGrid: {
display: "grid",
gridTemplateColumns:
"repeat(4, minmax(0, 1fr))",
gap: "15px",
marginBottom: "34px",
},

statCard: {
backgroundColor: "white",
border: "1px solid #e2e8f0",
borderRadius: "11px",
padding: "19px",
display: "flex",
alignItems: "center",
gap: "14px",
},

statIcon: {
width: "43px",
height: "43px",
borderRadius: "10px",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontSize: "19px",
fontWeight: 700,
},

statTitle: {
color: "#94a3b8",
fontSize: "11px",
margin: "0 0 3px",
fontWeight: 600,
},

statValue: {
color: "#172033",
fontWeight: 800,
fontSize: "22px",
},

sectionHeader: {
display: "flex",
alignItems: "center",
justifyContent: "space-between",
marginBottom: "15px",
},

sectionTitle: {
fontSize: "18px",
margin: 0,
color: "#172033",
},

sectionSubtitle: {
color: "#94a3b8",
fontSize: "12px",
margin: "5px 0 0",
},

textButton: {
border: "none",
backgroundColor: "transparent",
color: "#7c3aed",
cursor: "pointer",
fontWeight: 700,
fontSize: "12px",
},

childrenGrid: {
display: "grid",
gridTemplateColumns:
"repeat(auto-fit, minmax(280px, 1fr))",
gap: "15px",
},

childSummary: {
border: "1px solid #e2e8f0",
backgroundColor: "white",
borderRadius: "11px",
padding: "18px",
display: "flex",
alignItems: "center",
gap: "13px",
cursor: "pointer",
textAlign: "left",
},

childAvatar: {
width: "48px",
height: "48px",
borderRadius: "12px",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontWeight: 800,
fontSize: "14px",
flexShrink: 0,
},

childName: {
fontSize: "14px",
margin: 0,
color: "#172033",
},

childAdmission: {
fontSize: "11px",
color: "#94a3b8",
margin: "4px 0 8px",
},

classBadge: {
display: "inline-block",
backgroundColor: "#f1f5f9",
color: "#64748b",
padding: "4px 8px",
borderRadius: "5px",
fontSize: "10px",
fontWeight: 700,
},

childArrow: {
color: "#94a3b8",
fontSize: "18px",
},

quickGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "15px",
marginTop: "20px",
},

quickCard: {
border: "1px solid #e2e8f0",
backgroundColor: "white",
borderRadius: "11px",
padding: "17px",
display: "flex",
alignItems: "center",
gap: "12px",
textAlign: "left",
cursor: "pointer",
},

quickIcon: {
width: "42px",
height: "42px",
borderRadius: "9px",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontSize: "17px",
flexShrink: 0,
},

quickCardText: {
flex: 1,
},

quickArrow: {
marginLeft: "auto",
color: "#94a3b8",
fontSize: "17px",
},

pageHeadingRow: {
display: "flex",
alignItems: "flex-end",
justifyContent: "space-between",
marginBottom: "28px",
},

childCountBadge: {
backgroundColor: "#ede9fe",
color: "#6d28d9",
padding: "8px 12px",
borderRadius: "7px",
fontSize: "11px",
fontWeight: 700,
},

childrenList: {
display: "flex",
flexDirection: "column",
gap: "15px",
},

childCard: {
backgroundColor: "white",
border: "1px solid #e2e8f0",
borderRadius: "12px",
overflow: "hidden",
},

childCardHeader: {
width: "100%",
border: "none",
backgroundColor: "white",
padding: "20px",
display: "flex",
alignItems: "center",
gap: "14px",
cursor: "pointer",
},

largeChildAvatar: {
width: "55px",
height: "55px",
borderRadius: "13px",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontWeight: 800,
fontSize: "16px",
flexShrink: 0,
},

childCardName: {
margin: 0,
fontSize: "17px",
color: "#172033",
},

childCardMeta: {
color: "#94a3b8",
margin: "5px 0 0",
fontSize: "11px",
},

expandIcon: {
color: "#94a3b8",
transition: "transform 0.2s",
fontSize: "17px",
},

childQuickStats: {
display: "grid",
gridTemplateColumns:
"repeat(4, minmax(0, 1fr))",
borderTop: "1px solid #f1f5f9",
borderBottom: "1px solid #f1f5f9",
backgroundColor: "#fafbfc",
},

childQuickStat: {
padding: "15px 20px",
},

childDetails: {
padding: "0 20px 25px",
},

detailBlock: {
marginTop: "24px",
},

detailTitle: {
fontSize: "12px",
textTransform: "uppercase",
letterSpacing: "0.6px",
color: "#64748b",
margin: "0 0 10px",
},

infoLine: {
display: "flex",
justifyContent: "space-between",
gap: "20px",
padding: "10px 0",
borderBottom: "1px solid #f1f5f9",
fontSize: "12px",
},

mutedText: {
color: "#94a3b8",
fontSize: "12px",
},

courseRow: {
display: "flex",
alignItems: "center",
justifyContent: "space-between",
gap: "15px",
padding: "12px",
backgroundColor: "#f8fafc",
borderRadius: "8px",
marginBottom: "7px",
fontSize: "12px",
},

courseRowSpan: {
display: "block",
},

resultRow: {
display: "flex",
alignItems: "center",
justifyContent: "space-between",
gap: "15px",
padding: "12px",
backgroundColor: "#f0fdf4",
borderRadius: "8px",
marginBottom: "7px",
fontSize: "12px",
},

resultScore: {
textAlign: "right",
},

assignmentRow: {
display: "flex",
alignItems: "center",
justifyContent: "space-between",
gap: "15px",
padding: "12px",
backgroundColor: "#f8fafc",
borderRadius: "8px",
marginBottom: "7px",
fontSize: "12px",
},

statusBadge: {
padding: "5px 8px",
borderRadius: "5px",
fontSize: "9px",
fontWeight: 800,
},

statusGreen: {
backgroundColor: "#dcfce7",
color: "#15803d",
},

statusBlue: {
backgroundColor: "#dbeafe",
color: "#1d4ed8",
},

messagesLayout: {
display: "grid",
gridTemplateColumns:
"minmax(270px, 0.8fr) minmax(400px, 1.5fr)",
gap: "15px",
},

inboxPanel: {
backgroundColor: "white",
border: "1px solid #e2e8f0",
borderRadius: "12px",
overflow: "hidden",
minHeight: "480px",
},

conversationPanel: {
backgroundColor: "white",
border: "1px solid #e2e8f0",
borderRadius: "12px",
overflow: "hidden",
minHeight: "480px",
},

panelHeader: {
padding: "17px 19px",
borderBottom: "1px solid #e2e8f0",
display: "flex",
alignItems: "center",
justifyContent: "space-between",
},

panelTitle: {
margin: 0,
fontSize: "14px",
color: "#172033",
},

panelSubtitle: {
margin: "4px 0 0",
color: "#94a3b8",
fontSize: "10px",
},

smallIconButton: {
width: "30px",
height: "30px",
border: "1px solid #e2e8f0",
backgroundColor: "white",
borderRadius: "7px",
cursor: "pointer",
color: "#64748b",
},

messageItem: {
width: "100%",
border: "none",
borderBottom: "1px solid #f1f5f9",
backgroundColor: "white",
padding: "14px 15px",
display: "flex",
gap: "10px",
textAlign: "left",
cursor: "pointer",
},

messageItemUnread: {
backgroundColor: "#faf7ff",
},

messageItemActive: {
backgroundColor: "#f3e8ff",
},

messageAvatar: {
width: "35px",
height: "35px",
borderRadius: "9px",
backgroundColor: "#e0e7ff",
color: "#4338ca",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontSize: "10px",
fontWeight: 800,
flexShrink: 0,
},

messageTopLine: {
display: "flex",
alignItems: "center",
gap: "7px",
fontSize: "12px",
color: "#172033",
},

unreadDot: {
width: "6px",
height: "6px",
borderRadius: "50%",
backgroundColor: "#7c3aed",
},

messageSubject: {
color: "#64748b",
fontSize: "11px",
marginTop: "4px",
whiteSpace: "nowrap",
overflow: "hidden",
textOverflow: "ellipsis",
},

messageDate: {
color: "#94a3b8",
fontSize: "9px",
marginTop: "4px",
},

conversationEmpty: {
minHeight: "390px",
display: "flex",
flexDirection: "column",
alignItems: "center",
justifyContent: "center",
color: "#94a3b8",
padding: "30px",
textAlign: "center",
},

conversationBody: {
padding: "18px",
},

messageHistory: {
height: "360px",
overflowY: "auto",
padding: "10px",
backgroundColor: "#f8fafc",
borderRadius: "9px",
},

replyButton: {
marginTop: "13px",
border: "none",
backgroundColor: "#7c3aed",
color: "white",
padding: "10px 15px",
borderRadius: "7px",
cursor: "pointer",
fontWeight: 700,
fontSize: "11px",
},

sentPanel: {
marginTop: "15px",
backgroundColor: "white",
border: "1px solid #e2e8f0",
borderRadius: "12px",
overflow: "hidden",
},

sentMessage: {
display: "flex",
gap: "12px",
padding: "15px 19px",
borderBottom: "1px solid #f1f5f9",
},

sentMessageAvatar: {
width: "36px",
height: "36px",
borderRadius: "50%",
backgroundColor: "#dbeafe",
color: "#2563eb",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontSize: "10px",
fontWeight: 800,
flexShrink: 0,
},

smallEmpty: {
padding: "55px 25px",
textAlign: "center",
color: "#94a3b8",
fontSize: "12px",
},

emptyIcon: {
width: "45px",
height: "45px",
borderRadius: "12px",
backgroundColor: "#f1f5f9",
display: "flex",
alignItems: "center",
justifyContent: "center",
margin: "0 auto 12px",
color: "#94a3b8",
fontSize: "20px",
},

largeEmptyIcon: {
width: "58px",
height: "58px",
borderRadius: "15px",
backgroundColor: "#f1f5f9",
display: "flex",
alignItems: "center",
justifyContent: "center",
color: "#94a3b8",
fontSize: "24px",
},

emptyState: {
backgroundColor: "white",
border: "1px solid #e2e8f0",
borderRadius: "12px",
padding: "65px 25px",
textAlign: "center",
},

unreadBadge: {
backgroundColor: "#fef2f2",
color: "#dc2626",
padding: "7px 10px",
borderRadius: "7px",
fontSize: "10px",
fontWeight: 800,
},

composeLayout: {
display: "grid",
gridTemplateColumns:
"minmax(450px, 1.6fr) minmax(250px, 0.8fr)",
gap: "18px",
alignItems: "start",
},

composeCard: {
backgroundColor: "white",
border: "1px solid #e2e8f0",
borderRadius: "12px",
padding: "25px",
},

formLabel: {
display: "block",
color: "#334155",
fontWeight: 700,
fontSize: "11px",
marginBottom: "7px",
},

formInput: {
width: "100%",
boxSizing: "border-box",
border: "1px solid #dbe2ea",
borderRadius: "7px",
padding: "11px 12px",
marginBottom: "18px",
fontSize: "12px",
color: "#1e293b",
backgroundColor: "white",
outline: "none",
fontFamily:
'-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
},

formFooter: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
gap: "20px",
paddingTop: "4px",
},

formHint: {
color: "#94a3b8",
fontSize: "10px",
lineHeight: 1.4,
},

sendButton: {
border: "none",
backgroundColor: "#7c3aed",
color: "white",
padding: "11px 16px",
borderRadius: "7px",
cursor: "pointer",
fontWeight: 700,
fontSize: "11px",
whiteSpace: "nowrap",
},

sendButtonDisabled: {
backgroundColor: "#cbd5e1",
cursor: "not-allowed",
},

noTeachers: {
display: "flex",
gap: "10px",
alignItems: "flex-start",
padding: "13px",
backgroundColor: "#fff7ed",
border: "1px solid #fed7aa",
borderRadius: "8px",
color: "#9a3412",
marginBottom: "18px",
fontSize: "11px",
},

noTeacherIcon: {
width: "25px",
height: "25px",
borderRadius: "50%",
backgroundColor: "#ffedd5",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontWeight: 800,
},

contactInfo: {
backgroundColor: "#172033",
color: "white",
borderRadius: "12px",
padding: "25px",
},

contactInfoIcon: {
width: "42px",
height: "42px",
borderRadius: "10px",
backgroundColor: "#7c3aed",
display: "flex",
alignItems: "center",
justifyContent: "center",
marginBottom: "18px",
},

infoDivider: {
height: "1px",
backgroundColor: "rgba(255,255,255,0.1)",
margin: "20px 0",
},

infoRow: {
display: "flex",
justifyContent: "space-between",
color: "#94a3b8",
fontSize: "11px",
marginBottom: "13px",
},

loadingPage: {
minHeight: "100vh",
backgroundColor: "#f8fafc",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontFamily:
'-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
},

loadingCard: {
backgroundColor: "white",
border: "1px solid #e2e8f0",
borderRadius: "14px",
padding: "40px",
textAlign: "center",
width: "300px",
},

loadingLogo: {
width: "48px",
height: "48px",
borderRadius: "12px",
backgroundColor: "#7c3aed",
color: "white",
display: "flex",
alignItems: "center",
justifyContent: "center",
margin: "0 auto",
fontWeight: 800,
fontSize: "17px",
},

spinner: {
width: "28px",
height: "28px",
border: "3px solid #ede9fe",
borderTopColor: "#7c3aed",
borderRadius: "50%",
margin: "25px auto 0",
animation: "spin 0.8s linear infinite",
},

spinnerSmall: {
width: "25px",
height: "25px",
border: "3px solid #ede9fe",
borderTopColor: "#7c3aed",
borderRadius: "50%",
animation: "spin 0.8s linear infinite",
},

successAlert: {
backgroundColor: "#f0fdf4",
border: "1px solid #bbf7d0",
color: "#166534",
padding: "11px 14px",
borderRadius: "8px",
display: "flex",
alignItems: "center",
gap: "9px",
marginBottom: "20px",
fontSize: "12px",
},

errorAlert: {
backgroundColor: "#fef2f2",
border: "1px solid #fecaca",
color: "#991b1b",
padding: "11px 14px",
borderRadius: "8px",
display: "flex",
alignItems: "center",
gap: "9px",
marginBottom: "20px",
fontSize: "12px",
},

alertIcon: {
width: "20px",
height: "20px",
borderRadius: "50%",
backgroundColor: "rgba(0,0,0,0.06)",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontWeight: 800,
flexShrink: 0,
},

alertClose: {
marginLeft: "auto",
border: "none",
backgroundColor: "transparent",
cursor: "pointer",
color: "inherit",
fontSize: "17px",
},
};

export default ParentDashboard;
