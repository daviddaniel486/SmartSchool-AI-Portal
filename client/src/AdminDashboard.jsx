
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function AdminDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  const [classForm, setClassForm] = useState({
    name: "",
    level: "",
    teacherId: "",
  });

  const [courseForm, setCourseForm] = useState({
    title: "",
    code: "",
    description: "",
    teacherId: "",
    classId: "",
  });

  const [studentForm, setStudentForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    admissionNo: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    classId: "",
  });

  const [teacherForm, setTeacherForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    employeeNo: "",
    department: "",
  });

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [creatingTeacher, setCreatingTeacher] = useState(false);
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [creatingClass, setCreatingClass] = useState(false);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [assigningCourse, setAssigningCourse] = useState(false);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        teachersResponse,
        coursesResponse,
        studentsResponse,
        classesResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/admin/teachers`, { headers }),
        fetch(`${API_URL}/courses`, { headers }),
        fetch(`${API_URL}/students`, { headers }),
        fetch(`${API_URL}/classes`, { headers }),
      ]);

      const teachersData = await teachersResponse.json();
      const coursesData = await coursesResponse.json();
      const studentsData = await studentsResponse.json();
      const classesData = await classesResponse.json();

      if (!teachersResponse.ok) {
        throw new Error(
          teachersData.message || "Failed to load teachers"
        );
      }

      if (!coursesResponse.ok) {
        throw new Error(
          coursesData.message || "Failed to load courses"
        );
      }

      if (!studentsResponse.ok) {
        throw new Error(
          studentsData.message || "Failed to load students"
        );
      }

      if (!classesResponse.ok) {
        throw new Error(
          classesData.message || "Failed to load classes"
        );
      }

      setTeachers(teachersData.teachers || []);
      setCourses(coursesData.courses || []);
      setStudents(studentsData.students || []);
      setClasses(classesData.classes || []);
    } catch (error) {
      console.error("Admin dashboard error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Please log in as an administrator.");
      setLoading(false);
      return;
    }

    loadData();
  }, []);

  const handleTeacherChange = (event) => {
    const { name, value } = event.target;

    setTeacherForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleStudentChange = (event) => {
    const { name, value } = event.target;

    setStudentForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleClassChange = (event) => {
    const { name, value } = event.target;

    setClassForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCourseChange = (event) => {
    const { name, value } = event.target;

    setCourseForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const createTeacher = async (event) => {
    event.preventDefault();

    try {
      setCreatingTeacher(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/admin/teachers`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(teacherForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create teacher"
        );
      }

      setMessage("Teacher registered successfully.");

      setTeacherForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        employeeNo: "",
        department: "",
      });

      await loadData();
    } catch (error) {
      console.error("Create teacher error:", error);
      setError(error.message);
    } finally {
      setCreatingTeacher(false);
    }
  };

  const createStudent = async (event) => {
    event.preventDefault();

    try {
      setCreatingStudent(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/students`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            ...studentForm,
            classId: studentForm.classId
              ? Number(studentForm.classId)
              : undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create student"
        );
      }

      setMessage("Student registered successfully.");

      setStudentForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        admissionNo: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        classId: "",
      });

      await loadData();
    } catch (error) {
      console.error("Create student error:", error);
      setError(error.message);
    } finally {
      setCreatingStudent(false);
    }
  };

  const createClass = async (event) => {
    event.preventDefault();

    try {
      setCreatingClass(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/classes`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: classForm.name,
            level: classForm.level,
            teacherId: classForm.teacherId
              ? Number(classForm.teacherId)
              : undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create class"
        );
      }

      setMessage("Class created successfully.");

      setClassForm({
        name: "",
        level: "",
        teacherId: "",
      });

      await loadData();
    } catch (error) {
      console.error("Create class error:", error);
      setError(error.message);
    } finally {
      setCreatingClass(false);
    }
  };

  const createCourse = async (event) => {
    event.preventDefault();

    try {
      setCreatingCourse(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/courses`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            title: courseForm.title,
            code: courseForm.code,
            description: courseForm.description,
            teacherId: courseForm.teacherId
              ? Number(courseForm.teacherId)
              : undefined,
            classId: courseForm.classId
              ? Number(courseForm.classId)
              : undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create course"
        );
      }

      setMessage("Course created successfully.");

      setCourseForm({
        title: "",
        code: "",
        description: "",
        teacherId: "",
        classId: "",
      });

      await loadData();
    } catch (error) {
      console.error("Create course error:", error);
      setError(error.message);
    } finally {
      setCreatingCourse(false);
    }
  };

  const assignCourse = async (event) => {
    event.preventDefault();

    if (!selectedTeacher || !selectedCourse) {
      setError("Please select both a teacher and a course.");
      return;
    }

    try {
      setAssigningCourse(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/admin/teachers/${selectedTeacher}/courses`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            courseId: Number(selectedCourse),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to assign course"
        );
      }

      setMessage("Course assigned to teacher successfully.");

      setSelectedTeacher("");
      setSelectedCourse("");

      await loadData();
    } catch (error) {
      console.error("Assign course error:", error);
      setError(error.message);
    } finally {
      setAssigningCourse(false);
    }
  };

  const unassignCourse = async (courseId) => {
    try {
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/admin/courses/${courseId}/unassign`,
        {
          method: "PATCH",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to unassign course"
        );
      }

      setMessage("Course unassigned successfully.");

      await loadData();
    } catch (error) {
      console.error("Unassign course error:", error);
      setError(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Smart School...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout portal-page portal-admin">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Inter, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
          background: #f6f7fb;
          color: #172033;
        }

        button,
        input,
        select,
        textarea {
          font-family: inherit;
        }

        .admin-layout {
          min-height: 100vh;
          display: flex;
          background: #f6f7fb;
        }

        /* SIDEBAR */

        .sidebar {
          width: 250px;
          background: #17152b;
          color: white;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          z-index: 10;
        }

        .brand {
          padding: 28px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .brand-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 800;
        }

        .brand h2 {
          margin: 0;
          font-size: 18px;
        }

        .brand span {
          color: #a7a3bd;
          font-size: 12px;
        }

        .nav {
          padding: 24px 14px;
          flex: 1;
        }

        .nav-label {
          color: #77738e;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 1.5px;
          font-weight: 700;
          padding: 0 12px 10px;
        }

        .nav-item {
          width: 100%;
          border: none;
          background: transparent;
          color: #aaa7bd;
          padding: 12px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 5px;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
        }

        .nav-item:hover,
        .nav-item.active {
          background: #282441;
          color: white;
        }

        .nav-icon {
          width: 20px;
          text-align: center;
        }

        .sidebar-bottom {
          padding: 18px 14px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .logout-button {
          width: 100%;
          border: none;
          background: rgba(239,68,68,0.1);
          color: #fca5a5;
          padding: 12px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logout-button:hover {
          background: rgba(239,68,68,0.18);
        }

        /* MAIN */

        .main-content {
          margin-left: 250px;
          width: calc(100% - 250px);
          min-height: 100vh;
        }

        .topbar {
          height: 76px;
          background: white;
          border-bottom: 1px solid #e8e9ef;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 36px;
        }

        .breadcrumb {
          color: #85899a;
          font-size: 13px;
        }

        .breadcrumb strong {
          color: #202536;
        }

        .admin-profile {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #ede9fe;
          color: #6d28d9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .profile-name {
          font-size: 13px;
          font-weight: 700;
        }

        .profile-role {
          display: block;
          color: #9296a5;
          font-size: 11px;
          margin-top: 2px;
        }

        .content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px 36px 60px;
        }

        .welcome {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 28px;
        }

        .welcome h1 {
          margin: 0 0 7px;
          font-size: 28px;
          letter-spacing: -0.5px;
        }

        .welcome p {
          margin: 0;
          color: #7d8292;
          font-size: 14px;
        }

        /* ALERTS */

        .alert {
          padding: 14px 18px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .success-alert {
          background: #ecfdf3;
          border: 1px solid #bbf7d0;
          color: #15803d;
        }

        .error-alert {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }

        /* STATISTICS */

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e9eaf0;
          border-radius: 14px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          transition: transform .2s, box-shadow .2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(30,25,60,.07);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
        }

        .purple {
          background: #f0eaff;
          color: #7c3aed;
        }

        .blue {
          background: #e8f1ff;
          color: #2563eb;
        }

        .green {
          background: #e9faef;
          color: #16a34a;
        }

        .orange {
          background: #fff4df;
          color: #ea580c;
        }

        .stat-label {
          color: #85899a;
          font-size: 12px;
          margin-bottom: 5px;
        }

        .stat-number {
          font-size: 25px;
          font-weight: 800;
        }

        /* SECTIONS */

        .section {
          background: white;
          border: 1px solid #e8e9ef;
          border-radius: 14px;
          margin-bottom: 24px;
          overflow: hidden;
        }

        .section-header {
          padding: 21px 24px;
          border-bottom: 1px solid #edf0f4;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .section-title h2 {
          margin: 0 0 4px;
          font-size: 17px;
        }

        .section-title p {
          margin: 0;
          color: #8b8f9e;
          font-size: 12px;
        }

        .section-body {
          padding: 24px;
        }

        /* FORMS */

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 17px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label {
          color: #4e5364;
          font-size: 12px;
          font-weight: 700;
        }

        .field input,
        .field select,
        .field textarea {
          width: 100%;
          border: 1px solid #dfe2e8;
          background: #fbfcfe;
          border-radius: 9px;
          padding: 11px 12px;
          font-size: 13px;
          color: #252a38;
          outline: none;
          transition: border .2s, box-shadow .2s;
        }

        .field textarea {
          resize: vertical;
          min-height: 100px;
        }

        .field input:focus,
        .field select:focus,
        .field textarea:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139,92,246,.1);
          background: white;
        }

        .primary-button {
          border: none;
          background: #6d28d9;
          color: white;
          padding: 11px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          margin-top: 20px;
        }

        .primary-button:hover {
          background: #5b21b6;
        }

        .primary-button:disabled {
          background: #b7a8d7;
          cursor: not-allowed;
        }

        .blue-button {
          background: #2563eb;
        }

        .blue-button:hover {
          background: #1d4ed8;
        }

        .green-button {
          background: #16a34a;
        }

        .green-button:hover {
          background: #15803d;
        }

        .orange-button {
          background: #ea580c;
        }

        .orange-button:hover {
          background: #c2410c;
        }

        /* ITEM GRID */

        .item-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .item-card {
          border: 1px solid #e7e9ef;
          background: #fbfcfe;
          border-radius: 11px;
          padding: 17px;
        }

        .item-card h3 {
          margin: 0 0 8px;
          font-size: 15px;
        }

        .item-card p {
          margin: 7px 0;
          color: #707586;
          font-size: 12px;
          line-height: 1.5;
        }

        .item-card strong {
          color: #363b49;
        }

        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 800;
          background: #ede9fe;
          color: #6d28d9;
          margin-bottom: 9px;
        }

        .course-code {
          color: #2563eb;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .teacher-course {
          padding: 10px;
          background: white;
          border: 1px solid #e8e9ef;
          border-radius: 8px;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .remove-button {
          border: none;
          background: #fee2e2;
          color: #b91c1c;
          padding: 6px 9px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
        }

        .remove-button:hover {
          background: #fecaca;
        }

        .empty {
          text-align: center;
          padding: 30px;
          color: #9296a5;
          font-size: 13px;
          background: #fbfcfe;
          border: 1px dashed #dfe2e8;
          border-radius: 10px;
        }

        .divider {
          height: 1px;
          background: #edf0f4;
          margin: 28px 0;
        }

        /* LOADING */

        .loading-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f6f7fb;
          color: #777;
        }

        .loading-spinner {
          width: 35px;
          height: 35px;
          border: 3px solid #e5e7eb;
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: spin .8s linear infinite;
          margin-bottom: 15px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* RESPONSIVE */

        @media (max-width: 1100px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .item-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 800px) {
          .sidebar {
            width: 70px;
          }

          .brand {
            padding: 20px 14px;
          }

          .brand h2,
          .brand span,
          .nav-item span:not(.nav-icon),
          .nav-label,
          .logout-button span {
            display: none;
          }

          .brand-row {
            justify-content: center;
          }

          .nav-item {
            justify-content: center;
          }

          .logout-button {
            justify-content: center;
          }

          .main-content {
            margin-left: 70px;
            width: calc(100% - 70px);
          }

          .topbar {
            padding: 0 20px;
          }

          .content {
            padding: 25px 20px 50px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .field.full {
            grid-column: auto;
          }
        }

        @media (max-width: 600px) {
          .stats-grid,
          .item-grid {
            grid-template-columns: 1fr;
          }

          .welcome {
            align-items: flex-start;
          }

          .welcome h1 {
            font-size: 23px;
          }

          .profile-name,
          .profile-role {
            display: none;
          }

          .section-body {
            padding: 17px;
          }

          .section-header {
            padding: 17px;
          }
        }
      `}</style>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-row">
            <div className="brand-icon">S</div>

            <div>
              <h2>Smart School</h2>
              <span>School Management</span>
            </div>
          </div>
        </div>

        <nav className="nav">
          <div className="nav-label">
            Main Menu
          </div>

          <button className="nav-item active">
            <span className="nav-icon">⌂</span>
            <span>Dashboard</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">•</span>
            <span>Students</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">•</span>
            <span>Teachers</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">•</span>
            <span>Classes</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">•</span>
            <span>Courses</span>
          </button>

          <button className="nav-item">
            <span className="nav-icon">•</span>
            <span>Assignments</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            className="logout-button"
            onClick={logout}
          >
            <span>↪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Smart School /{" "}
            <strong>Admin Dashboard</strong>
          </div>

          <div className="admin-profile">
            <div className="avatar">A</div>

            <div>
              <div className="profile-name">
                Administrator
              </div>

              <span className="profile-role">
                School Administrator
              </span>
            </div>
          </div>
        </header>

        <main className="content">
          <div className="welcome">
            <div>
              <h1>Good afternoon, Administrator 👋</h1>

              <p>
                Here's an overview of your school management
                system.
              </p>
            </div>
          </div>

          {message && (
            <div className="alert success-alert">
              ✓ {message}
            </div>
          )}

          {error && (
            <div className="alert error-alert">
              {error}
            </div>
          )}

          {/* STATISTICS */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon purple">
                👨‍•
              </div>

              <div>
                <div className="stat-label">
                  Total Students
                </div>

                <div className="stat-number">
                  {students.length}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue">
                •
              </div>

              <div>
                <div className="stat-label">
                  Total Teachers
                </div>

                <div className="stat-number">
                  {teachers.length}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                •
              </div>

              <div>
                <div className="stat-label">
                  Total Classes
                </div>

                <div className="stat-number">
                  {classes.length}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                •
              </div>

              <div>
                <div className="stat-label">
                  Total Courses
                </div>

                <div className="stat-number">
                  {courses.length}
                </div>
              </div>
            </div>
          </div>

          {/* CLASS MANAGEMENT */}
          <section className="section">
            <div className="section-header">
              <div className="section-title">
                <h2>Class Management</h2>
                <p>
                  Create classes and assign teachers.
                </p>
              </div>
            </div>

            <div className="section-body">
              <form onSubmit={createClass}>
                <div className="form-grid">
                  <div className="field">
                    <label>CLASS NAME</label>

                    <input
                      name="name"
                      value={classForm.name}
                      onChange={handleClassChange}
                      placeholder="e.g. SS 2A"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>LEVEL</label>

                    <input
                      name="level"
                      value={classForm.level}
                      onChange={handleClassChange}
                      placeholder="e.g. Secondary"
                    />
                  </div>

                  <div className="field">
                    <label>ASSIGN TEACHER</label>

                    <select
                      name="teacherId"
                      value={classForm.teacherId}
                      onChange={handleClassChange}
                    >
                      <option value="">
                        No teacher
                      </option>

                      {teachers.map((teacher) => (
                        <option
                          key={teacher.id}
                          value={teacher.id}
                        >
                          {teacher.user.firstName}{" "}
                          {teacher.user.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  className="primary-button orange-button"
                  type="submit"
                  disabled={creatingClass}
                >
                  {creatingClass
                    ? "Creating..."
                    : "+ Create Class"}
                </button>
              </form>

              <div className="divider"></div>

              <div className="item-grid">
                {classes.length === 0 ? (
                  <div className="empty">
                    No classes found.
                  </div>
                ) : (
                  classes.map((classItem) => (
                    <div
                      className="item-card"
                      key={classItem.id}
                    >
                      <span className="badge">
                        CLASS
                      </span>

                      <h3>{classItem.name}</h3>

                      <p>
                        <strong>Level:</strong>{" "}
                        {classItem.level ||
                          "Not specified"}
                      </p>

                      <p>
                        <strong>Teacher:</strong>{" "}
                        {classItem.teacher
                          ? `${classItem.teacher.user.firstName} ${classItem.teacher.user.lastName}`
                          : "Not assigned"}
                      </p>

                      <p>
                        <strong>Students:</strong>{" "}
                        {classItem._count?.students ?? 0}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* COURSE MANAGEMENT */}
          <section className="section">
            <div className="section-header">
              <div className="section-title">
                <h2>Course Management</h2>
                <p>
                  Create courses and connect them to
                  classes and teachers.
                </p>
              </div>
            </div>

            <div className="section-body">
              <form onSubmit={createCourse}>
                <div className="form-grid">
                  <div className="field">
                    <label>COURSE TITLE</label>

                    <input
                      name="title"
                      value={courseForm.title}
                      onChange={handleCourseChange}
                      placeholder="e.g. Mathematics"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>COURSE CODE</label>

                    <input
                      name="code"
                      value={courseForm.code}
                      onChange={handleCourseChange}
                      placeholder="e.g. MTH101"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>CLASS</label>

                    <select
                      name="classId"
                      value={courseForm.classId}
                      onChange={handleCourseChange}
                    >
                      <option value="">
                        No class
                      </option>

                      {classes.map((classItem) => (
                        <option
                          key={classItem.id}
                          value={classItem.id}
                        >
                          {classItem.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>TEACHER</label>

                    <select
                      name="teacherId"
                      value={courseForm.teacherId}
                      onChange={handleCourseChange}
                    >
                      <option value="">
                        No teacher
                      </option>

                      {teachers.map((teacher) => (
                        <option
                          key={teacher.id}
                          value={teacher.id}
                        >
                          {teacher.user.firstName}{" "}
                          {teacher.user.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field full">
                    <label>DESCRIPTION</label>

                    <textarea
                      name="description"
                      value={courseForm.description}
                      onChange={handleCourseChange}
                      placeholder="Describe the course..."
                    />
                  </div>
                </div>

                <button
                  className="primary-button blue-button"
                  type="submit"
                  disabled={creatingCourse}
                >
                  {creatingCourse
                    ? "Creating..."
                    : "+ Create Course"}
                </button>
              </form>

              <div className="divider"></div>

              <div className="item-grid">
                {courses.length === 0 ? (
                  <div className="empty">
                    No courses found.
                  </div>
                ) : (
                  courses.map((course) => (
                    <div
                      className="item-card"
                      key={course.id}
                    >
                      <div className="course-code">
                        {course.code}
                      </div>

                      <h3>{course.title}</h3>

                      <p>
                        {course.description ||
                          "No description provided."}
                      </p>

                      <p>
                        <strong>Class:</strong>{" "}
                        {course.class?.name ||
                          "Not assigned"}
                      </p>

                      <p>
                        <strong>Teacher:</strong>{" "}
                        {course.teacher
                          ? `${course.teacher.user.firstName} ${course.teacher.user.lastName}`
                          : "Not assigned"}
                      </p>

                      <p>
                        <strong>Students:</strong>{" "}
                        {course._count?.enrollments ?? 0}
                      </p>

                      <p>
                        <strong>Assignments:</strong>{" "}
                        {course._count?.assignments ?? 0}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* REGISTER STUDENT */}
          <section className="section">
            <div className="section-header">
              <div className="section-title">
                <h2>Register Student</h2>
                <p>
                  Create a student account and assign
                  them to a class.
                </p>
              </div>
            </div>

            <div className="section-body">
              <form onSubmit={createStudent}>
                <div className="form-grid">
                  <div className="field">
                    <label>FIRST NAME</label>
                    <input
                      name="firstName"
                      value={studentForm.firstName}
                      onChange={handleStudentChange}
                      placeholder="First name"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>LAST NAME</label>
                    <input
                      name="lastName"
                      value={studentForm.lastName}
                      onChange={handleStudentChange}
                      placeholder="Last name"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>EMAIL</label>
                    <input
                      name="email"
                      type="email"
                      value={studentForm.email}
                      onChange={handleStudentChange}
                      placeholder="student@example.com"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>TEMPORARY PASSWORD</label>
                    <input
                      name="password"
                      type="password"
                      value={studentForm.password}
                      onChange={handleStudentChange}
                      placeholder="Temporary password"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>ADMISSION NUMBER</label>
                    <input
                      name="admissionNo"
                      value={studentForm.admissionNo}
                      onChange={handleStudentChange}
                      placeholder="Admission number"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>PHONE</label>
                    <input
                      name="phone"
                      value={studentForm.phone}
                      onChange={handleStudentChange}
                      placeholder="Phone number"
                    />
                  </div>

                  <div className="field">
                    <label>DATE OF BIRTH</label>
                    <input
                      name="dateOfBirth"
                      type="date"
                      value={studentForm.dateOfBirth}
                      onChange={handleStudentChange}
                    />
                  </div>

                  <div className="field">
                    <label>GENDER</label>
                    <select
                      name="gender"
                      value={studentForm.gender}
                      onChange={handleStudentChange}
                    >
                      <option value="">
                        Select gender
                      </option>
                      <option value="MALE">
                        Male
                      </option>
                      <option value="FEMALE">
                        Female
                      </option>
                      <option value="OTHER">
                        Other
                      </option>
                    </select>
                  </div>

                  <div className="field">
                    <label>CLASS</label>
                    <select
                      name="classId"
                      value={studentForm.classId}
                      onChange={handleStudentChange}
                    >
                      <option value="">
                        Select class
                      </option>

                      {classes.map((classItem) => (
                        <option
                          key={classItem.id}
                          value={classItem.id}
                        >
                          {classItem.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>ADDRESS</label>
                    <input
                      name="address"
                      value={studentForm.address}
                      onChange={handleStudentChange}
                      placeholder="Student address"
                    />
                  </div>
                </div>

                <button
                  className="primary-button green-button"
                  type="submit"
                  disabled={creatingStudent}
                >
                  {creatingStudent
                    ? "Creating..."
                    : "+ Register Student"}
                </button>
              </form>
            </div>
          </section>

          {/* REGISTER TEACHER */}
          <section className="section">
            <div className="section-header">
              <div className="section-title">
                <h2>Register Teacher</h2>
                <p>
                  Create a teacher account and profile.
                </p>
              </div>
            </div>

            <div className="section-body">
              <form onSubmit={createTeacher}>
                <div className="form-grid">
                  <div className="field">
                    <label>FIRST NAME</label>
                    <input
                      name="firstName"
                      value={teacherForm.firstName}
                      onChange={handleTeacherChange}
                      placeholder="First name"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>LAST NAME</label>
                    <input
                      name="lastName"
                      value={teacherForm.lastName}
                      onChange={handleTeacherChange}
                      placeholder="Last name"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>EMAIL</label>
                    <input
                      name="email"
                      type="email"
                      value={teacherForm.email}
                      onChange={handleTeacherChange}
                      placeholder="teacher@example.com"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>TEMPORARY PASSWORD</label>
                    <input
                      name="password"
                      type="password"
                      value={teacherForm.password}
                      onChange={handleTeacherChange}
                      placeholder="Temporary password"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>EMPLOYEE NUMBER</label>
                    <input
                      name="employeeNo"
                      value={teacherForm.employeeNo}
                      onChange={handleTeacherChange}
                      placeholder="Employee number"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>DEPARTMENT</label>
                    <input
                      name="department"
                      value={teacherForm.department}
                      onChange={handleTeacherChange}
                      placeholder="e.g. Mathematics"
                    />
                  </div>
                </div>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={creatingTeacher}
                >
                  {creatingTeacher
                    ? "Creating..."
                    : "+ Register Teacher"}
                </button>
              </form>
            </div>
          </section>

          {/* ASSIGN COURSE */}
          <section className="section">
            <div className="section-header">
              <div className="section-title">
                <h2>Assign Course to Teacher</h2>
                <p>
                  Manage teacher course assignments.
                </p>
              </div>
            </div>

            <div className="section-body">
              <form onSubmit={assignCourse}>
                <div className="form-grid">
                  <div className="field">
                    <label>TEACHER</label>

                    <select
                      value={selectedTeacher}
                      onChange={(event) =>
                        setSelectedTeacher(
                          event.target.value
                        )
                      }
                    >
                      <option value="">
                        Select teacher
                      </option>

                      {teachers.map((teacher) => (
                        <option
                          key={teacher.id}
                          value={teacher.id}
                        >
                          {teacher.user.firstName}{" "}
                          {teacher.user.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>COURSE</label>

                    <select
                      value={selectedCourse}
                      onChange={(event) =>
                        setSelectedCourse(
                          event.target.value
                        )
                      }
                    >
                      <option value="">
                        Select course
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
                  </div>
                </div>

                <button
                  className="primary-button blue-button"
                  type="submit"
                  disabled={assigningCourse}
                >
                  {assigningCourse
                    ? "Assigning..."
                    : "Assign Course"}
                </button>
              </form>
            </div>
          </section>

          {/* TEACHERS */}
          <section className="section">
            <div className="section-header">
              <div className="section-title">
                <h2>Teachers</h2>
                <p>
                  View teachers and their assigned courses.
                </p>
              </div>
            </div>

            <div className="section-body">
              {teachers.length === 0 ? (
                <div className="empty">
                  No teachers found.
                </div>
              ) : (
                <div className="item-grid">
                  {teachers.map((teacher) => (
                    <div
                      className="item-card"
                      key={teacher.id}
                    >
                      <span className="badge">
                        TEACHER
                      </span>

                      <h3>
                        {teacher.user.firstName}{" "}
                        {teacher.user.lastName}
                      </h3>

                      <p>
                        <strong>Email:</strong>{" "}
                        {teacher.user.email}
                      </p>

                      <p>
                        <strong>Employee No:</strong>{" "}
                        {teacher.employeeNo}
                      </p>

                      <p>
                        <strong>Department:</strong>{" "}
                        {teacher.department ||
                          "Not specified"}
                      </p>

                      <div className="divider"></div>

                      <strong
                        style={{
                          fontSize: "12px",
                        }}
                      >
                        Assigned Courses
                      </strong>

                      {!teacher.courses ||
                      teacher.courses.length === 0 ? (
                        <p>
                          No courses assigned.
                        </p>
                      ) : (
                        teacher.courses.map(
                          (course) => (
                            <div
                              className="teacher-course"
                              key={course.id}
                            >
                              <div>
                                <strong>
                                  {course.title}
                                </strong>

                                <div
                                  style={{
                                    color: "#9296a5",
                                    fontSize: "10px",
                                    marginTop: "3px",
                                  }}
                                >
                                  {course.code}
                                </div>
                              </div>

                              <button
                                className="remove-button"
                                onClick={() =>
                                  unassignCourse(
                                    course.id
                                  )
                                }
                              >
                                Remove
                              </button>
                            </div>
                          )
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;

