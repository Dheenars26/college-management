// Base API URL: points to local backend on port 8083, or relative if served directly from Spring Boot
const API_BASE_URL = window.API_BASE_URL || 
    (window.location.protocol.startsWith("http") && window.location.port === "8083" 
        ? "" 
        : "http://localhost:8083");

// Default starter data if backend is offline and no local cache exists
const DEFAULT_STUDENTS = [
    { id: 1, name: "Aarav Sharma", email: "aarav.sharma@college.edu", department: "Computer Science", year: 3 },
    { id: 2, name: "Priya Patel", email: "priya.patel@college.edu", department: "Information Technology", year: 2 },
    { id: 3, name: "Dheena Dhayalan", email: "dheena@college.edu", department: "Electronics & Communication", year: 4 },
    { id: 4, name: "Sneha Reddy", email: "sneha.reddy@college.edu", department: "Mechanical Engineering", year: 3 },
    { id: 5, name: "Vikram Singh", email: "vikram.singh@college.edu", department: "Civil Engineering", year: 1 }
];

// Local state tracking for attendance dropdowns
let attendanceState = {};

// Helper function for API requests with 3-second timeout
async function apiRequest(path = "", options = {}, timeoutMs = 3000) {
    const formattedPath = path.startsWith("/") ? path : `/${path}`;
    const url = API_BASE_URL ? `${API_BASE_URL}${formattedPath}` : formattedPath;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timer);

        const responseText = await response.text();

        if (!response.ok) {
            console.error("API Error Response:", responseText);
            throw new Error(`API request failed (${response.status}): ${responseText || response.statusText}`);
        }

        return responseText ? JSON.parse(responseText) : null;
    } catch (err) {
        clearTimeout(timer);
        throw err;
    }
}

// Update DB connection status badge dynamically
function updateStatusBadge(isOnline) {
    const badge = document.getElementById("dbStatusBadge");
    if (!badge) return;
    if (isOnline) {
        badge.innerText = "● Backend Online";
        badge.classList.remove("offline");
        badge.title = "Connected to Spring Boot REST API & Database on port 8083";
    } else {
        badge.innerText = "● Offline Mode (Local)";
        badge.classList.add("offline");
        badge.title = "Backend is not running. Running in offline mode using Browser LocalStorage. Run run.bat to start Spring Boot.";
    }
}

// Toast Notification
function showToast(message, isError = false) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerText = message;
    toast.className = `toast ${isError ? "toast-error" : ""}`;
    toast.classList.remove("hidden");
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
        toast.classList.add("hidden");
    }, 3800);
}

// Current student cache and delete target
let currentStudents = [];
let studentIdToDelete = null;

// Open Form Modal Logic
function openStudentModal() {
    const modal = document.getElementById("studentModal");
    if (modal) {
        modal.classList.remove("hidden");
    } else {
        console.error("Target #studentModal was not found in DOM.");
    }
}

// Close Form Modal Logic
function closeStudentModal() {
    const modal = document.getElementById("studentModal");
    if (modal) {
        modal.classList.add("hidden");
    }
    const form = document.getElementById("studentForm");
    if (form) form.reset();
}

// Open Delete Confirmation Modal
function openDeleteModal(id) {
    studentIdToDelete = id;
    const student = currentStudents.find(s => s.id === id);
    const msgEl = document.getElementById("deleteModalMessage");
    if (msgEl) {
        if (student && student.name) {
            msgEl.innerHTML = `Are you sure you want to delete <strong>${student.name}</strong>?<br>This action cannot be undone.`;
        } else {
            msgEl.innerText = "Are you sure you want to delete this student? This action cannot be undone.";
        }
    }
    const modal = document.getElementById("deleteModal");
    if (modal) modal.classList.remove("hidden");
}

// Close Delete Confirmation Modal
function closeDeleteModal() {
    studentIdToDelete = null;
    const modal = document.getElementById("deleteModal");
    if (modal) modal.classList.add("hidden");
}

// Confirm Delete Execution (Works with both Backend & LocalStorage)
async function confirmDeleteStudent() {
    if (!studentIdToDelete) return;
    const id = studentIdToDelete;
    closeDeleteModal();

    try {
        await apiRequest(`/api/students/${id}`, { method: "DELETE" });
        delete attendanceState[id];
        await syncData();
        showToast("🗑️ Student deleted successfully!");
    } catch (error) {
        console.warn("Backend delete unavailable, deleting from local storage:", error.message);
        
        currentStudents = currentStudents.filter(s => s.id !== id);
        delete attendanceState[id];

        // Also clean from unsynced list if present
        try {
            const unsynced = JSON.parse(localStorage.getItem("cms_unsynced") || "[]").filter(s => s.id !== id);
            localStorage.setItem("cms_unsynced", JSON.stringify(unsynced));
            localStorage.setItem("cms_cached_students", JSON.stringify(currentStudents));
        } catch (e) {}

        renderStudentsTable(currentStudents);
        renderDashboardRecent(currentStudents);
        renderAttendanceTable(currentStudents);
        recalculateAttendanceCounters(currentStudents);

        showToast("🗑️ Student removed from local storage!");
    }
}

// Save Student Form Submit (Supports Backend with seamless LocalStorage fallback)
async function saveStudent(event) {
    if (event) event.preventDefault();

    const nameEl = document.getElementById("studentName");
    const emailEl = document.getElementById("studentEmail");
    const deptEl = document.getElementById("studentDept");
    const yearEl = document.getElementById("studentYear");

    const name = nameEl ? nameEl.value.trim() : "";
    const email = emailEl ? emailEl.value.trim() : "";
    const department = deptEl ? deptEl.value.trim() : "";
    const year = yearEl ? parseInt(yearEl.value, 10) : NaN;

    if (!name || !email || !department || isNaN(year)) {
        showToast("Please fill in all input fields accurately.", true);
        return;
    }

    const newStudent = { name, email, department, year };

    try {
        // Attempt saving to Spring Boot REST backend
        await apiRequest("/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newStudent)
        });

        closeStudentModal();
        await syncData();
        showToast("✅ Student added successfully!");
    } catch (error) {
        console.warn("Backend unavailable, saving student to local storage:", error.message);

        // Fallback: Save locally so user is NEVER blocked
        newStudent.id = Date.now();
        currentStudents.push(newStudent);
        attendanceState[newStudent.id] = "Present";

        try {
            const unsynced = JSON.parse(localStorage.getItem("cms_unsynced") || "[]");
            unsynced.push(newStudent);
            localStorage.setItem("cms_unsynced", JSON.stringify(unsynced));
            localStorage.setItem("cms_cached_students", JSON.stringify(currentStudents));
        } catch (e) {}

        closeStudentModal();
        updateStatusBadge(false);
        renderStudentsTable(currentStudents);
        renderDashboardRecent(currentStudents);
        renderAttendanceTable(currentStudents);
        recalculateAttendanceCounters(currentStudents);

        showToast("⚠️ Saved to Local Storage (Backend offline. Run run.bat for DB)");
    }
}

// Sync Data from Backend or LocalStorage fallback
async function syncData() {
    let students = null;

    try {
        students = await apiRequest("/api/students");
        updateStatusBadge(true);

        // Automatically sync any offline additions created previously
        try {
            const unsynced = JSON.parse(localStorage.getItem("cms_unsynced") || "[]");
            if (unsynced.length > 0) {
                for (const s of unsynced) {
                    try {
                        await apiRequest("/api/students", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ name: s.name, email: s.email, department: s.department, year: s.year })
                        });
                    } catch (e) {
                        console.warn("Could not sync student:", s, e);
                    }
                }
                localStorage.removeItem("cms_unsynced");
                students = await apiRequest("/api/students");
                showToast("🔄 Synced offline students to database!");
            }
        } catch (e) {}

        // Cache latest backend state
        try {
            localStorage.setItem("cms_cached_students", JSON.stringify(students));
        } catch (e) {}

    } catch (error) {
        console.warn("Backend connection offline, using cached or starter data:", error.message);
        updateStatusBadge(false);

        try {
            const cached = localStorage.getItem("cms_cached_students");
            if (cached) {
                students = JSON.parse(cached);
            }
        } catch (e) {}

        if (!Array.isArray(students) || students.length === 0) {
            students = DEFAULT_STUDENTS;
            try {
                localStorage.setItem("cms_cached_students", JSON.stringify(students));
            } catch (e) {}
        }
    }

    if (Array.isArray(students)) {
        currentStudents = students;

        // Set initial attendance to Present for new entries
        students.forEach(student => {
            if (!attendanceState[student.id]) {
                attendanceState[student.id] = "Present";
            }
        });

        renderStudentsTable(students);
        renderDashboardRecent(students);
        renderAttendanceTable(students);
        recalculateAttendanceCounters(students);
    }
}

// Render Table
function renderStudentsTable(students) {
    const tableBody = document.getElementById("studentTable");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    students.forEach((student, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${student.name}</strong></td>
            <td>${student.email}</td>
            <td>${student.department}</td>
            <td>Year ${student.year}</td>
            <td>
                <button class="delete-btn" onclick="openDeleteModal(${student.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Render Recent
function renderDashboardRecent(students) {
    const tbody = document.getElementById("recentStudentsBody");
    if (!tbody) return;

    const recent = students.slice(-5).reverse();
    tbody.innerHTML = recent.map((student, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${student.name}</strong></td>
            <td>${student.department}</td>
            <td><span class="status">Active</span></td>
        </tr>
    `).join("");
}

// Render Attendance Table with Interactive Selectors
function renderAttendanceTable(students) {
    const tbody = document.getElementById("attendanceTableBody");
    if (!tbody) return;

    if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #94a3b8; padding: 20px;">No students available</td></tr>`;
        return;
    }

    tbody.innerHTML = students.map(student => {
        const status = attendanceState[student.id] || "Present";
        return `
            <tr>
                <td><strong>${student.name}</strong></td>
                <td>${student.department}</td>
                <td>
                    <select onchange="updateStudentAttendance(${student.id}, this.value)" style="padding: 6px 10px; border-radius: 6px; background: #1e293b; color: #fff; border: 1px solid #475569; font-size: 13px;">
                        <option value="Present" ${status === "Present" ? "selected" : ""}>Present</option>
                        <option value="Absent" ${status === "Absent" ? "selected" : ""}>Absent</option>
                    </select>
                </td>
            </tr>
        `;
    }).join("");
}

// Handle Attendance Change
function updateStudentAttendance(studentId, newStatus) {
    attendanceState[studentId] = newStatus;
    recalculateAttendanceCounters(currentStudents);
}

// Real Attendance Recalculation (Defaults to 0% when 0 students exist)
function recalculateAttendanceCounters(students) {
    const totalStudents = students.length;
    let presentCount = 0;
    let absentCount = 0;

    if (totalStudents > 0) {
        students.forEach(student => {
            const status = attendanceState[student.id] || "Present";
            if (status === "Present") {
                presentCount++;
            } else {
                absentCount++;
            }
        });
    }

    const percentage = totalStudents > 0 
        ? Math.round((presentCount / totalStudents) * 100) + "%" 
        : "0%";

    const badge = document.getElementById("studentCountBadge");
    const dashCount = document.getElementById("dashTotalStudents");
    if (badge) badge.innerText = totalStudents;
    if (dashCount) dashCount.innerText = totalStudents;

    const dashAttendancePct = document.getElementById("dashAttendancePercentage");
    const attTotal = document.getElementById("attendanceTotal");
    const attPresent = document.getElementById("attendancePresent");
    const attAbsent = document.getElementById("attendanceAbsent");
    const attPercentage = document.getElementById("attendancePercentage");

    if (dashAttendancePct) dashAttendancePct.innerText = percentage;
    if (attTotal) attTotal.innerText = totalStudents;
    if (attPresent) attPresent.innerText = presentCount;
    if (attAbsent) attAbsent.innerText = absentCount;
    if (attPercentage) attPercentage.innerText = percentage;
}

// Global Scope Exports
window.openStudentModal = openStudentModal;
window.closeStudentModal = closeStudentModal;
window.saveStudent = saveStudent;
window.deleteStudent = openDeleteModal;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDeleteStudent = confirmDeleteStudent;
window.showToast = showToast;
window.syncData = syncData;
window.updateStudentAttendance = updateStudentAttendance;

// DOM Initialization
document.addEventListener("DOMContentLoaded", () => {
    syncData();

    const studentForm = document.getElementById("studentForm");
    if (studentForm) {
        studentForm.addEventListener("submit", saveStudent);
    }
});