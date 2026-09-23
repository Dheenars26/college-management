// Base API URL (pointing directly to your Spring Boot endpoint)
const API_BASE_URL = window.API_BASE_URL || https://college-management-production-408f.up.railway.app;

// Helper function for API requests
async function apiRequest(path = "", options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    const responseText = await response.text();

    if (!response.ok) {
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
        await apiRequest("", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newStudent)
        });

        closeStudentModal();
        await syncData();
        alert("Student added successfully!");
    } catch (error) {
        console.error("Error saving student:", error);
        alert("Failed to save student. Please check network connection.");
    }
}

// Delete Student
async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete student ID " + id + "?")) return;

    try {
        await apiRequest(`/${id}`, { method: "DELETE" });
        await syncData();
    } catch (error) {
        console.error("Error deleting student:", error);
    }
}

// Sync Data from Backend
async function syncData() {
    try {
        const students = await apiRequest();
        if (Array.isArray(students)) {
            renderStudentsTable(students);
            renderDashboardRecent(students);
            renderAttendanceTable(students);
            updateCounters(students.length);
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

// Render Attendance Table
function renderAttendanceTable(students) {
    const tbody = document.getElementById("attendanceTableBody");
    if (!tbody) return;

    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${student.name}</td>
            <td>${student.department}</td>
            <td><span class="status">Present</span></td>
        </tr>
    `).join("");
}

// Update Badges
function updateCounters(total) {
    const badge = document.getElementById("studentCountBadge");
    const dashCount = document.getElementById("dashTotalStudents");
    const attTotal = document.getElementById("attendanceTotal");
    const attPresent = document.getElementById("attendancePresent");
    const attAbsent = document.getElementById("attendanceAbsent");
    const attPercentage = document.getElementById("attendancePercentage");

    if (badge) badge.innerText = total;
    if (dashCount) dashCount.innerText = total;

    const percentage = total > 0 ? "100%" : "0%";
    if (attTotal) attTotal.innerText = total;
    if (attPresent) attPresent.innerText = total;
    if (attAbsent) attAbsent.innerText = 0;
    if (attPercentage) attPercentage.innerText = percentage;
}

// Global scope bindings
window.openStudentModal = openStudentModal;
window.closeStudentModal = closeStudentModal;
window.saveStudent = saveStudent;
window.deleteStudent = deleteStudent;
window.syncData = syncData;

// Attach bindings safely after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    syncData();

    const studentForm = document.getElementById("studentForm");
    if (studentForm) {
        studentForm.addEventListener("submit", saveStudent);
    }
});