// Base API URL pointing to your Spring Boot application on port 8083
const API_BASE_URL = "http://localhost:8083/api/students";

function showPage(pageName) {
    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.add("hidden");
    });

    document.getElementById(pageName).classList.remove("hidden");

    const titles = {
        dashboard: "Executive Campus Dashboard",
        students: "Student Management",
        attendance: "Attendance Management",
        bus: "Bus Tracking",
        canteen: "Canteen & Food",
        reminders: "Reminders"
    };

    document.getElementById("pageTitle").innerText = titles[pageName];

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });
}

// Replaced syncData: Fetches student records from Spring Boot & MySQL and renders them
async function syncData() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error("Failed to fetch students");

        const students = await response.json();
        renderStudentsTable(students);
        alert("Data synchronized successfully!");
    } catch (error) {
        console.error("Error syncing data:", error);
        alert("Sync failed: Make sure Spring Boot backend is running on port 8083.");
    }
}

// Replaced addStudent: Sends POST HTTP request to Spring Boot backend to save into MySQL
async function addStudent() {
    const name = prompt("Enter student name:");
    if (!name) return;

    const email = prompt("Enter student email:");
    if (!email) return;

    const department = prompt("Enter department (e.g., CSE, ECE):");
    if (!department) return;

    const yearStr = prompt("Enter year (e.g., 1, 2, 3, 4):");
    const year = parseInt(yearStr, 10);

    if (isNaN(year)) {
        alert("Invalid year entered!");
        return;
    }

    const newStudent = { name, email, department, year };

    try {
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newStudent)
        });

        if (response.ok) {
            const savedStudent = await response.json();
            alert("Student " + savedStudent.name + " added successfully!");
            // Refresh table list automatically after saving
            syncData();
        } else {
            alert("Failed to save student. Server status: " + response.status);
        }
    } catch (error) {
        console.error("Error saving student:", error);
        alert("Error connecting to backend API. Is Spring Boot running?");
    }
}

// Function to populate table rows in UI
function renderStudentsTable(students) {
    const tableBody = document.getElementById("studentTableBody");
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
        `;
        tableBody.appendChild(row);
    });
}

function addFood() {
    const food = prompt("Enter food item:");
    if (food) {
        alert(food + " added successfully!");
    }
}

function addReminder() {
    const reminder = prompt("Enter reminder:");
    if (reminder) {
        alert("Reminder added successfully!");
    }
}

function setDate() {
    const today = new Date();
    const options = {
        weekday: "short",
        month: "short",
        day: "numeric"
    };

    const dateElement = document.getElementById("currentDate");
    if (dateElement) {
        dateElement.innerText = today.toLocaleDateString("en-US", options);
    }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    setDate();
    syncData(); // Automatically load data from MySQL when page loads
});