const API_URL = "http://localhost:808/api/students";

// 1. Fetch and Display All Students
async function loadStudents() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();
        
        const tableBody = document.getElementById("studentTableBody");
        tableBody.innerHTML = "";

        students.forEach(student => {
            const row = `
                <tr>
                    <td>${student.id}</td>
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                    <td>${student.department}</td>
                    <td>${student.year}</td>
                    <td>
                        <button onclick="deleteStudent(${student.id})">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error fetching students:", error);
    }
}

// 2. Add a New Student (POST)
async function addStudent(event) {
    event.preventDefault();

    const newStudent = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        department: document.getElementById("department").value,
        year: parseInt(document.getElementById("year").value)
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newStudent)
        });

        if (response.ok) {
            alert("Student added successfully!");
            document.getElementById("studentForm").reset();
            loadStudents(); // Refresh the list
        }
    } catch (error) {
        console.error("Error adding student:", error);
    }
}

// 3. Delete a Student (DELETE)
async function deleteStudent(id) {
    if (confirm("Are you sure you want to delete this student?")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                loadStudents(); // Refresh the list
            }
        } catch (error) {
            console.error("Error deleting student:", error);
        }
    }
}

// Call loadStudents when the page loads
window.onload = loadStudents;