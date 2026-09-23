// Base API URL
const API_BASE_URL = window.API_BASE_URL || "https://college-management-production-408f.up.railway.app";

// Local state tracking for attendance dropdowns
let attendanceState = {};

// Helper function for API requests
async function apiRequest(path = "", options = {}) {
    const formattedPath = path.startsWith("/") ? path : `/${path}`;
    const response = await fetch(`${API_BASE_URL}${formattedPath}`, options);
    const responseText = await response.text();

    if (!response.ok) {
        console.error("API Error Response:", responseText);
        throw new Error(`API request failed (${response.status}): ${responseText || response.statusText}`);
    }

    return responseText ? JSON.parse(responseText) : null;
}

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

// Save Student Form Submit
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
        alert("Please fill in all input fields accurately.");
        return;
    }

    const newStudent = { name, email, department, year };

    try {
        await apiRequest("/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newStudent)
        });

        closeStudentModal();
        await syncData();
        alert("Student added successfully!");
    } catch (error) {
        console.error("Error saving student:", error);
        alert("Failed to save student. Check backend database logs on Railway.");
    }
}

// Delete Student
async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete student ID " + id + "?")) return;

    try {
        await apiRequest(`/api/students/${id}`, { method: "DELETE" });
        await syncData();
    } catch (error) {
        console.error("Error deleting student:", error);
    }
}

// Sync Data from Backend
async function syncData() {
    try {
        const students = await apiRequest("/api/students");
        if (Array.isArray(students)) {
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
    } catch (error) {
        console.error("Error syncing data:", error);
    }
}

// Render Table
function renderStudentsTable(students) {
    const tableBody = document.getElementById("studentTable");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    students.forEach(student => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.department}</td>
            <td>${student.year}</td>
            <td>
                <button class="delete-btn" onclick="deleteStudent(${student.id})">Delete</button>
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
    tbody.innerHTML = recent.map(student => `
        <tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.department}</td>
            <td><span class="status">Active</span></td>
        </tr>
    `).join("");
}

// Render Attendance Table with Interactive Selectors
function renderAttendanceTable(students) {
    const tbody = document.getElementById("attendanceTableBody");
    if (!tbody) return;

    tbody.innerHTML = students.map(student => {
        const status = attendanceState[student.id] || "Present";
        return `
            <tr>
                <td>${student.name}</td>
                <td>${student.department}</td>
                <td>
                    <select onchange="updateStudentAttendance(${student.id}, this.value)" style="padding: 4px 8px; border-radius: 4px; background: #1e293b; color: #fff; border: 1px solid #475569;">
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
    apiRequest("/api/students").then(students => {
        if (Array.isArray(students)) {
            recalculateAttendanceCounters(students);
        }
    });
}

// Real Attendance Recalculation
function recalculateAttendanceCounters(students) {
    const totalStudents = students.length;
    let presentCount = 0;
    let absentCount = 0;

    students.forEach(student => {
        const status = attendanceState[student.id] || "Present";
        if (status === "Present") {
            presentCount++;
        } else {
            absentCount++;
        }
    });

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
window.deleteStudent = deleteStudent;
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