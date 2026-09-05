export const dashboardSeed = {
    users: [
        { id: "u-admin", name: "Alex Morgan", username: "admin", email: "admin@school.test", password: "admin123", role: "admin" },
        { id: "u-teacher", name: "Jordan Lee", username: "teacher", email: "teacher@school.test", password: "teacher123", role: "teacher" },
        { id: "u-student", name: "Maria Santos", username: "ST-002", email: "student@school.test", password: "student123", role: "student", studentId: "ST-002" }
    ],
    students: [
        { id: "ST-001", name: "Juan Dela Cruz", email: "juan@student.test", course: "Information Systems", year: "1st Year", status: "Active", teacherId: "T-001", guardian: "Rosa Dela Cruz", guardianContact: "0917 555 0101", contact: "0917 555 0102" },
        { id: "ST-002", name: "Maria Santos", email: "maria@student.test", course: "Information Systems", year: "1st Year", status: "Active", teacherId: "T-001", guardian: "Elena Santos", guardianContact: "0917 555 0103", contact: "0917 555 0104" },
        { id: "ST-003", name: "Pedro Reyes", email: "pedro@student.test", course: "Computer Science", year: "2nd Year", status: "Active", teacherId: "T-002", guardian: "Ramon Reyes", guardianContact: "0917 555 0105", contact: "0917 555 0106" }
    ],
    teachers: [{ id: "T-001", name: "Jordan Lee", email: "teacher@school.test", department: "Information Systems", subjects: ["SUB-001", "SUB-002"] }, { id: "T-002", name: "Taylor Cruz", email: "taylor@school.test", department: "Computer Science", subjects: ["SUB-003"] }],
    subjects: [{ id: "SUB-001", name: "Web Systems", code: "IS 201", units: 3 }, { id: "SUB-002", name: "Database Management", code: "IS 202", units: 3 }, { id: "SUB-003", name: "Data Structures", code: "CS 203", units: 3 }],
    courses: [{ id: "C-001", name: "Information Systems", code: "BSIS", students: 2 }, { id: "C-002", name: "Computer Science", code: "BSCS", students: 1 }],
    grades: [{ id: "G-001", studentId: "ST-001", subjectId: "SUB-001", teacherId: "T-001", grade: 91, decision: "Pass" }, { id: "G-002", studentId: "ST-002", subjectId: "SUB-001", teacherId: "T-001", grade: 88, decision: "Pass" }, { id: "G-003", studentId: "ST-002", subjectId: "SUB-002", teacherId: "T-001", grade: 84, decision: "Pass" }]
};