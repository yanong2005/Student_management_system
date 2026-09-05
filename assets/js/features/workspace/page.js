import { calculateAge } from "../../shared/age.js";
import { CURRENT_ACADEMIC_YEAR, SIDEBAR_KEY, SESSION_KEY, THEME_KEY } from "../../shared/constants.js";
import { gradeDecision, normalizeGrade, PASSING_GRADE } from "../../shared/grade.js";
import { enrollmentStatus } from "../../shared/enrollment.js";
import { esc, initials, studentDisplayName } from "../../shared/html.js";
import { recordConfig } from "./record-config.js";
import { currentTeacher, currentUser, find, remoteStateReady, save, session, setActiveView, setEditing, state, activeView, editing } from "./store.js";
import { ErrorState, LoadingState } from "../../shared/ui.js";
import { toast, view } from "./views.js";

const navItems = () => {
    if (session.role === "student") return [{ id: "overview", label: "Overview", icon: "⌂" }, { id: "my-record", label: "My record", icon: "◎" }, { id: "my-grades", label: "My grades", icon: "▤" }];
    if (session.role === "teacher") return [{ id: "overview", label: "Overview", icon: "⌂" }, { id: "class", label: "My class", icon: "◌" }, { id: "grades", label: "Gradebook", icon: "▤" }];
    return [{ id: "overview", label: "Overview", icon: "⌂" }, { id: "students", label: "Students", icon: "◌" }, { id: "teachers", label: "Teachers", icon: "♙" }, { id: "subjects", label: "Subjects", icon: "▥" }, { id: "courses", label: "Courses", icon: "▦" }, { id: "assignments", label: "Assignments", icon: "↔" }];
};
const navigate = nextView => {
    closeMobileSidebar();
    setActiveView(nextView);
    render();
};
const render = () => {
    const user = currentUser();
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    document.body.dataset.role = session.role;
    document.querySelector("#profile-name").textContent = user.name;
    document.querySelector("#profile-role").textContent = `${session.role[0].toUpperCase()}${session.role.slice(1)} account`;
    document.querySelector("#profile-avatar").textContent = initials(user.name);
    document.querySelector("#side-nav").innerHTML = navItems().map(item => `<button class="side-link ${activeView === item.id ? "active" : ""}" type="button" data-view="${item.id}" ${activeView === item.id ? "aria-current=page" : ""}><span class="side-icon" aria-hidden="true">${item.icon}</span><span class="side-label">${item.label}</span></button>`).join("");
    document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.view)));
    const item = navItems().find(nav => nav.id === activeView) || navItems()[0];
    document.querySelector("#page-kicker").textContent = session.role.toUpperCase() + " WORKSPACE";
    document.querySelector("#page-title").textContent = item.label;
    document.querySelector("#app-view").innerHTML = view(activeView);
    bindActions();
}
function openRecord(type, record = {}) {
    setEditing({ type, id: record.id });
    const definition = recordConfig[type];
    const nameParts = (record.name || "").split(" ");
    document.querySelector("#dialog-title").textContent = `${record.id ? "Edit" : "Add"} ${definition.singular}`;
    document.querySelector("#form-fields").innerHTML = definition.fields.map(field => {
        let value = field.key === "age" ? calculateAge(record.dateOfBirth) : record[field.key];
        if (field.key === "academicYear") value ||= CURRENT_ACADEMIC_YEAR;
        if (field.key === "firstSemesterEnrolled" || field.key === "secondSemesterEnrolled") value ||= "Enrolled";
        if (type === "students" && !value && field.key === "firstName") value = nameParts[0];
        if (type === "students" && !value && field.key === "lastName" && nameParts.length > 1) value = nameParts[nameParts.length - 1];
        const control = field.type === "select" ? `<select name="${field.key}" ${field.required ? "required" : ""}>${field.options.map(option => `<option ${value === option ? "selected" : ""}>${option}</option>`).join("")}</select>` : `<input name="${field.key}" type="${field.type}" value="${esc(value)}" ${field.required ? "required" : ""} ${field.readonly ? "readonly data-age-display" : ""}>`;
        return `<label>${field.label}${control}</label>`;
    }).join("");
    const dateInput = document.querySelector("#form-fields [name='dateOfBirth']");
    const ageDisplay = document.querySelector("#form-fields [data-age-display]");
    dateInput?.addEventListener("input", () => {
        ageDisplay.value = calculateAge(dateInput.value);
    });
    document.querySelector("#record-dialog").showModal();
}
function openGrade(record = {}) {
    const teacher = currentTeacher();
    setEditing({ type: "grades", id: record.id });
    document.querySelector("#dialog-title").textContent = `${record.id ? "Edit" : "Enter"} grade`;
    document.querySelector("#form-fields").innerHTML = `<label>Student<select name="studentId" required>${state.students.filter(s => s.teacherId === teacher?.id).map(s => `<option value="${s.id}" ${record.studentId === s.id ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select></label><label>Subject<select name="subjectId" required>${(teacher?.subjects || []).map(id => `<option value="${id}" ${record.subjectId === id ? "selected" : ""}>${esc(find("subjects", id)?.name)}</option>`).join("")}</select></label><label>Grade percentage<input name="grade" type="number" min="0" max="100" step="0.01" value="${record.grade ?? ""}" required><small class="field-help">${PASSING_GRADE}% or higher is a passing grade.</small></label><label>Decision<input name="decision" value="${record.grade === undefined ? "" : gradeDecision(record.grade)}" readonly data-grade-decision></label>`;
    document.querySelector("#record-dialog").showModal();
    const gradeInput = document.querySelector("#form-fields [name='grade']");
    const decisionInput = document.querySelector("#form-fields [data-grade-decision]");
    gradeInput?.addEventListener("input", () => {
        decisionInput.value = gradeInput.value === "" ? "" : gradeDecision(gradeInput.value);
    });
}
function bindActions() {
    document.querySelectorAll("[data-search]").forEach(input => input.addEventListener("input", () => {
        const term = input.value.toLowerCase();
        input.closest(".panel").querySelectorAll("tbody tr").forEach(row => row.hidden = !row.textContent.toLowerCase().includes(term));
    }));
    document.querySelectorAll("[data-add]").forEach(button => button.onclick = () => openRecord(button.dataset.add));
    document.querySelectorAll("[data-edit]").forEach(button => button.onclick = () => {
        const [type, id] = button.dataset.edit.split(":");
        openRecord(type, find(type, id));
    });
    document.querySelectorAll("[data-delete]").forEach(button => button.onclick = () => {
        const [type, id] = button.dataset.delete.split(":");
        if (confirm("Delete this record?")) {
            state[type] = state[type].filter(record => record.id !== id);
            save();
            render();
            toast("Record deleted");
        }
    });
    document.querySelectorAll("[data-view]").forEach(button => button.onclick = () => navigate(button.dataset.view));
    document.querySelectorAll("[data-assign-student]").forEach(button => button.onclick = () => {
        const teacher = document.querySelector(`[data-teacher-select='${button.dataset.assignStudent}']`).value;
        if (teacher) {
            find("students", button.dataset.assignStudent).teacherId = teacher;
            save();
            render();
            toast("Student assignment updated");
        }
    });
    document.querySelectorAll("[data-assign-teacher]").forEach(button => button.onclick = () => {
        const subject = document.querySelector(`[data-subject-select='${button.dataset.assignTeacher}']`).value;
        const teacher = find("teachers", button.dataset.assignTeacher);
        if (teacher && find("subjects", subject)) {
            if (!teacher.subjects.includes(subject)) teacher.subjects.push(subject);
            save();
            render();
            toast("Subject assignment updated");
        }
    });
    document.querySelector("[data-add-grade]")?.addEventListener("click", () => openGrade());
    document.querySelectorAll("[data-add-grade-student]").forEach(button => button.onclick = () => openGrade({ studentId: button.dataset.addGradeStudent }));
    document.querySelectorAll("[data-edit-grade]").forEach(button => button.onclick = () => openGrade(find("grades", button.dataset.editGrade)));
    document.querySelectorAll("#record-dialog [value='cancel']").forEach(button => button.onclick = () => document.querySelector("#record-dialog").close());
}
document.querySelector("#record-form").addEventListener("submit", event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.target));
    if (editing.type === "grades") {
        const teacher = currentTeacher();
        const grade = normalizeGrade(values.grade);
        if (grade === null) return toast("Enter a grade from 0 to 100.");
        const duplicate = state.grades.find(item => item.studentId === values.studentId && item.subjectId === values.subjectId && item.id !== editing.id);
        if (duplicate) return toast("This student already has a grade for that subject.");
        const calculated = { ...values, grade, decision: gradeDecision(grade), teacherId: teacher?.id };
        if (editing.id) Object.assign(find("grades", editing.id), calculated);
        else state.grades.push({ ...calculated, id: `G-${Date.now()}` });
    } else {
        const record = editing.id ? find(editing.type, editing.id) : { id: `${editing.type.slice(0, 1).toUpperCase()}-${Date.now()}` };
        Object.assign(record, values);
        if (editing.type === "students") {
            record.name = studentDisplayName(record);
            record.firstSemesterEnrolled = values.firstSemesterEnrolled === "Enrolled";
            record.secondSemesterEnrolled = values.secondSemesterEnrolled === "Enrolled";
            record.status = enrollmentStatus(record);
        }
        if (!editing.id) state[editing.type].push(record);
    }
    save();
    document.querySelector("#record-dialog").close();
    render();
    toast("Changes saved");
});
const signOut = () => {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "index.html";
};
const applyTheme = theme => {
    document.body.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    const button = document.querySelector("#theme-button");
    if (button) {
        button.textContent = theme === "dark" ? "☀" : "◐";
        button.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
        button.title = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
    }
};
document.querySelector("#top-logout-button").onclick = signOut;
document.querySelector("#theme-button").onclick = () => applyTheme(document.body.dataset.theme === "dark" ? "light" : "dark");
const shell = document.querySelector(".app-shell");
const sidebar = document.querySelector(".sidebar");
const menuButton = document.querySelector("#menu-button");
const isSmallScreen = () => window.matchMedia("(max-width: 800px)").matches;
const closeMobileSidebar = () => {
    sidebar.classList.remove("open");
    updateMenuState();
};
const updateMenuState = () => {
    const smallScreen = isSmallScreen();
    if (!smallScreen) sidebar.classList.remove("open");
    shell.classList.toggle("sidebar-collapsed", !smallScreen && localStorage.getItem(SIDEBAR_KEY) === "true");
    const isOpen = smallScreen ? sidebar.classList.contains("open") : !shell.classList.contains("sidebar-collapsed");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Collapse navigation" : "Expand navigation");
    menuButton.title = isOpen ? "Collapse navigation" : "Expand navigation";
};
if (localStorage.getItem(SIDEBAR_KEY) === "true" && !isSmallScreen()) shell.classList.add("sidebar-collapsed");
menuButton.onclick = () => {
    const sidebarEl = document.querySelector(".sidebar");
    if (isSmallScreen()) sidebarEl.classList.toggle("open");
    else {
        shell.classList.toggle("sidebar-collapsed");
        localStorage.setItem(SIDEBAR_KEY, String(shell.classList.contains("sidebar-collapsed")));
    }
    updateMenuState();
};
sidebar.addEventListener("mouseenter", () => {
    if (!isSmallScreen()) {
        shell.classList.remove("sidebar-collapsed");
        localStorage.setItem(SIDEBAR_KEY, "false");
        updateMenuState();
    }
});
sidebar.addEventListener("mouseleave", () => {
    if (!isSmallScreen()) {
        shell.classList.add("sidebar-collapsed");
        localStorage.setItem(SIDEBAR_KEY, "true");
        updateMenuState();
    }
});
window.addEventListener("resize", updateMenuState);
document.querySelector(".main-content").addEventListener("click", event => {
    if (isSmallScreen() && sidebar.classList.contains("open") && !event.target.closest("#menu-button")) closeMobileSidebar();
});
updateMenuState();
applyTheme(localStorage.getItem(THEME_KEY) || "light");
if (session) {
    document.querySelector("#app-view").innerHTML = LoadingState();
    remoteStateReady.then(render).catch(() => {
        document.querySelector("#app-view").innerHTML = ErrorState({ message: "The workspace could not be loaded. Check the server and try again." });
        document.querySelector("#app-view [data-action='retry']")?.addEventListener("click", () => window.location.reload());
    });
} else window.location.href = "index.html";