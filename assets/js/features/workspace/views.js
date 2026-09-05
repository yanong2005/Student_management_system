import { calculateAge } from "../../shared/age.js";
import { gradeDecision } from "../../shared/grade.js";
import { enrollmentStatus } from "../../shared/enrollment.js";
import { esc, initials, studentDisplayName } from "../../shared/html.js";
import { EmptyState, Panel, StatCard } from "../../shared/ui.js";
import { recordConfig } from "./record-config.js";
import { currentTeacher, currentUser, find, session, state } from "./store.js";
export const toast = message => {
    const node = document.querySelector("#toast");
    node.textContent = message;
    node.classList.add("show");
    setTimeout(() => node.classList.remove("show"), 2600);
};
const stat = (label, value, note, tone = "blue") => StatCard({ label, value, note, tone });
export function overview() {
    const isStudent = session.role === "student";
    const visibleStudents = session.role === "teacher" ? state.students.filter(student => student.teacherId === "T-001") : state.students;
    const recent = state.grades.slice(-4).reverse().map(grade => `<tr><td>${esc(find("students", grade.studentId)?.name)}</td><td>${esc(find("subjects", grade.subjectId)?.name)}</td><td><strong>${grade.grade}%</strong></td><td><span class="pill ${gradeDecision(grade.grade) === "Pass" ? "pass" : "fail"}">${gradeDecision(grade.grade)}</span></td></tr>`).join("");
    const activity = `<div class="table-wrap"><table aria-label="Latest grade decisions"><thead><tr><th scope="col">Student</th><th scope="col">Subject</th><th scope="col">Grade</th><th scope="col">Decision</th></tr></thead><tbody>${recent || `<tr><td colspan="4">${EmptyState({ title: "No grade entries yet", message: "Published grades will appear here." })}</td></tr>`}</tbody></table></div>`;
    return `<section class="welcome"><div><span class="section-label">${isStudent ? "YOUR ACADEMIC SNAPSHOT" : "LIVE CAMPUS SNAPSHOT"}</span><h2>${isStudent ? "Stay close to your progress." : "Keep every academic detail in view."}</h2><p>${isStudent ? "Your teachers' latest records, grades, and decisions are collected here." : "A clear command center for people, curriculum, assignments, and outcomes."}</p></div><div class="welcome-mark">${isStudent ? "MY" : session.role === "teacher" ? "TE" : "AD"}</div></section><div class="stats">${stat("Total students", isStudent ? 1 : visibleStudents.length, "Enrolled records", "blue")}${stat("Active courses", state.courses.length, "Programs running", "yellow")}${stat("Grade entries", isStudent ? state.grades.filter(g => g.studentId === currentUser().studentId).length : state.grades.length, "This workspace", "green")}${stat("Pass rate", `${Math.round((state.grades.filter(g => gradeDecision(g.grade) === "Pass").length / Math.max(state.grades.length, 1)) * 100)}%`, "Across recorded grades", "pink")}</div>${Panel({ eyebrow: "RECENT ACTIVITY", title: "Latest grade decisions", action: `<button class="text-button" data-view="${session.role === "student" ? "my-grades" : session.role === "teacher" ? "grades" : "students"}">View all →</button>`, content: activity })}`;
}
export function records(type) {
    const definition = recordConfig[type];
    let records = state[type];
    if (type === "students" && session.role === "teacher") records = records.filter(student => student.teacherId === currentTeacher()?.id);
    const rows = records.map(record => {
        const cells = definition.columns.map(column => {
            const value = column === "students" ? state.students.filter(student => student.course === record.name).length : column === "status" ? enrollmentStatus(record) : record[column];
            return column === "status" ? `<td><span class="pill ${String(value).toLowerCase()}">${esc(value)}</span></td>` : `<td>${esc(value)}</td>`;
        }).join("");
        const actions = session.role === "admin" ? `<button class="small-button" data-edit="${type}:${record.id}">Edit</button><button class="small-button danger" data-delete="${type}:${record.id}">Delete</button>` : `<span class="muted">View only</span>`;
        return `<tr>${cells}<td class="row-actions">${actions}</td></tr>`;
    }).join("");
    const addButton = session.role === "admin" ? `<button class="button" data-add="${type}">+ Add ${definition.singular}</button>` : "";
    const headings = definition.columns.map(column => `<th>${column.replace(/([A-Z])/g, " $1")}</th>`).join("");
    const emptyRow = `<tr><td colspan="${definition.columns.length + 1}">${EmptyState({ title: `No ${definition.title.toLowerCase()} found`, message: "Try a different search or add a new record." })}</td></tr>`;
    return `<section class="page-intro"><div><span class="section-label">DIRECTORY</span><h2>${definition.title}</h2><p>Manage and maintain the ${definition.title.toLowerCase()} directory.</p></div>${addButton}</section><section class="panel"><div class="toolbar"><input class="search-input" data-search="${type}" placeholder="Search ${definition.title.toLowerCase()}..." type="search"><span class="record-count">${records.length} records</span></div><div class="table-wrap"><table><thead><tr>${headings}<th>Actions</th></tr></thead><tbody>${rows || emptyRow}</tbody></table></div></section>`;
}
export function assignments() {
    return `<section class="page-intro"><div><span class="section-label">ADMIN CONTROL</span><h2>Assignments</h2><p>Connect teachers to subjects and enrolled students.</p></div></section><div class="assignment-grid"><section class="panel"><div class="panel-head"><div><span class="section-label">TEACHER SUBJECTS</span><h3>Teaching load</h3></div></div>${state.teachers.map(teacher => `<div class="assignment-row"><div class="avatar small">${initials(teacher.name)}</div><div><strong>${esc(teacher.name)}</strong><span>${teacher.subjects.map(id => find("subjects", id)?.name).join(" · ") || "No subjects assigned"}</span></div><select class="assignment-select" data-subject-select="${teacher.id}">${state.subjects.map(subject => `<option value="${subject.id}">${esc(subject.code)} · ${esc(subject.name)}</option>`).join("")}</select><button class="small-button" data-assign-teacher="${teacher.id}">Assign</button></div>`).join("")}</section><section class="panel"><div class="panel-head"><div><span class="section-label">STUDENT OWNERSHIP</span><h3>Class responsibility</h3></div></div>${state.students.map(student => `<div class="assignment-row"><div class="avatar small">${initials(student.name)}</div><div><strong>${esc(student.name)}</strong><span>${esc(find("teachers", student.teacherId)?.name || "Unassigned")}</span></div><select class="assignment-select" data-teacher-select="${student.id}"><option value="">Choose teacher</option>${state.teachers.map(teacher => `<option value="${teacher.id}" ${student.teacherId === teacher.id ? "selected" : ""}>${esc(teacher.name)}</option>`).join("")}</select><button class="small-button" data-assign-student="${student.id}">Assign</button></div>`).join("")}</section></div>`;
}
export function gradebook() {
    const teacher = currentTeacher();
    const teacherStudents = state.students.filter(student => student.teacherId === teacher?.id);
    const grades = state.grades.filter(grade => grade.teacherId === teacher?.id && teacherStudents.some(student => student.id === grade.studentId));
    const gradedStudentIds = new Set(grades.map(grade => grade.studentId));
    const rows = grades.map(grade => `<tr><td>${esc(find("students", grade.studentId)?.name)}</td><td>${esc(find("subjects", grade.subjectId)?.name)}</td><td><strong>${grade.grade}%</strong></td><td><span class="pill ${gradeDecision(grade.grade) === "Pass" ? "pass" : "fail"}">${gradeDecision(grade.grade)}</span></td><td><button class="small-button" data-edit-grade="${grade.id}">Edit</button></td></tr>`).join("") + teacherStudents.filter(student => !gradedStudentIds.has(student.id)).map(student => `<tr><td>${esc(student.name)}</td><td><span class="muted">Awaiting grade</span></td><td><span class="muted">Not entered</span></td><td><span class="pill">Pending</span></td><td><button class="small-button" data-add-grade-student="${student.id}">Enter grade</button></td></tr>`).join("");
    return `<section class="page-intro"><div><span class="section-label">TEACHER TOOL</span><h2>Gradebook</h2><p>Enter a grade and make a pass or fail decision for each student.</p></div><button class="button" data-add-grade>+ Enter grade</button></section><section class="panel"><div class="table-wrap"><table aria-label="Teacher gradebook"><thead><tr><th scope="col">Student</th><th scope="col">Subject</th><th scope="col">Grade</th><th scope="col">Decision</th><th scope="col">Action</th></tr></thead><tbody>${rows || `<tr><td colspan="5">${EmptyState({ title: "No students assigned", message: "Assign students to your class before entering grades." })}</td></tr>`}</tbody></table></div></section>`;
}
export function studentRecord() {
    const user = currentUser();
    const student = find("students", user.studentId);
    const displayName = studentDisplayName(student);
    const status = enrollmentStatus(student);
    return `<section class="profile-card"><div class="profile-hero"><div class="avatar large">${initials(displayName)}</div><div><span class="section-label">REGISTERED STUDENT INFORMATION</span><h2>${esc(displayName)}</h2><p>${esc(student.department || "Department not provided")} · ${esc(student.year || "Year level not provided")}</p></div><span class="pill ${status.toLowerCase()}">${status}</span></div><div class="detail-grid">${[["Username", user.username], ["Email", student.email], ["Academic year", student.academicYear], ["First semester", student.firstSemesterEnrolled === false ? "Not enrolled" : "Enrolled"], ["Second semester", student.secondSemesterEnrolled === false ? "Not enrolled" : "Enrolled"], ["Current status", status], ["First name", student.firstName], ["Middle name", student.middleName], ["Last name", student.lastName], ["Extension", student.extension], ["Department", student.department], ["Date of birth", student.dateOfBirth], ["Current age", calculateAge(student.dateOfBirth)], ["Place of birth", student.placeOfBirth], ["Current address", student.currentAddress], ["Marital status", student.maritalStatus], ["Elementary", student.elementary], ["High school", student.highSchool], ["Senior high school", student.seniorHighSchool], ["Contact", student.contact], ["Parent / guardian", student.guardian], ["Guardian contact", student.guardianContact], ["Assigned teacher", find("teachers", student.teacherId)?.name || "Unassigned"]].map(detail => `<div><span>${detail[0]}</span><strong>${esc(detail[1] || "Not provided")}</strong></div>`).join("")}</div></section>`;
}
export function studentGrades() {
    const grades = state.grades.filter(grade => grade.studentId === currentUser().studentId);
    return `<section class="page-intro"><div><span class="section-label">PRIVATE ACADEMIC VIEW</span><h2>My grades</h2><p>Only grades entered by your assigned teachers appear here.</p></div></section><section class="panel"><div class="table-wrap"><table><thead><tr><th>Subject</th><th>Teacher</th><th>Grade</th><th>Decision</th></tr></thead><tbody>${grades.map(grade => `<tr><td>${esc(find("subjects", grade.subjectId)?.name)}</td><td>${esc(find("teachers", grade.teacherId)?.name)}</td><td><strong>${grade.grade}%</strong></td><td><span class="pill ${gradeDecision(grade.grade) === "Pass" ? "pass" : "fail"}">${gradeDecision(grade.grade)}</span></td></tr>`).join("") || `<tr><td colspan="4" class="empty">No grades have been released yet.</td></tr>`}</tbody></table></div></section>`;
}
export function view(viewName) {
    if (viewName === "overview") return overview();
    if (viewName === "students" || viewName === "class") return records("students");
    if (viewName === "teachers") return records("teachers");
    if (viewName === "subjects") return records("subjects");
    if (viewName === "courses") return records("courses");
    if (viewName === "assignments") return assignments();
    if (viewName === "grades") return gradebook();
    if (viewName === "my-record") return studentRecord();
    if (viewName === "my-grades") return studentGrades();
    return overview();
}