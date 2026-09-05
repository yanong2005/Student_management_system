
import { calculateAge } from "../../shared/age.js";
import { SESSION_KEY, STORAGE_KEY } from "../../shared/constants.js";
import { remoteAuthStateReady, authenticate, getState, saveRemoteState } from "./auth-service.js";

const show = panelId => {
    document.querySelectorAll("[data-auth]").forEach(button => button.classList.toggle("active", button.dataset.auth === panelId));
    document.querySelectorAll(".auth-panel").forEach(panel => panel.classList.toggle("active", panel.id === panelId));
};
document.querySelectorAll("[data-auth]").forEach(button => button.addEventListener("click", () => show(button.dataset.auth)));

const authMessage = message => {
    const node = document.querySelector("#auth-message");
    node.textContent = message;
    node.classList.add("visible");
};

const roleSelect = document.querySelector("#account-role");
const studentFields = document.querySelector("#student-fields");
const department = document.querySelector("#department-field select");
const registrationDateOfBirth = document.querySelector("[name='dateOfBirth']");
const registrationAge = document.querySelector("#registration-age");
const updateRegistrationFields = () => {
    const isStudent = roleSelect.value === "student";
    studentFields.classList.toggle("hidden", !isStudent);
    studentFields.querySelectorAll("input:not(#registration-age), select").forEach(field => {
        field.disabled = !isStudent;
    });
    registrationAge.disabled = !isStudent;
    department.required = roleSelect.value !== "admin";
    department.disabled = false;
    const username = document.querySelector("#username-field input");
    const usernameHelp = document.querySelector("#username-help");
    username.placeholder = isStudent ? "e.g. ST-004" : "Choose any username";
    if (isStudent) {
        username.setAttribute("pattern", "ST-[0-9]{3,}");
        username.title = "Use your student ID, such as ST-004.";
    } else {
        username.removeAttribute("pattern");
        username.title = "You may choose any available username.";
    }
    usernameHelp.textContent = isStudent ? "Students use their student ID." : "Teachers and administrators can choose their own username.";
};
roleSelect.addEventListener("change", updateRegistrationFields);
const updateRegistrationAge = () => {
    if (!registrationDateOfBirth.value) {
        registrationAge.value = "";
        return;
    }
    registrationAge.value = calculateAge(registrationDateOfBirth.value);
};
registrationDateOfBirth.addEventListener("input", updateRegistrationAge);
updateRegistrationFields();
document.querySelector("#login-form").addEventListener("submit", async event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const user = await authenticate(data.username.trim(), data.password);
    if (!user) return authMessage("We couldn't match those details. Try one of the demo accounts below.");
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, role: user.role }));
    window.location.href = "dashboard.html";
});
document.querySelector("#register-form").addEventListener("submit", async event => {
    event.preventDefault();
    await remoteAuthStateReady;
    const data = Object.fromEntries(new FormData(event.target));
    const state = getState();
    const role = data.role;
    const name = [data.firstName, data.middleName, data.lastName, data.extension].filter(Boolean).join(" ");
    if (!data.firstName || !data.lastName) {
        return authMessage("First name and last name are required.");
    }
    if (!data.email || !data.username || !data.password) {
        return authMessage("Email, username, and password are required.");
    }
    if (state.users.some(user => user.email.toLowerCase() === data.email.toLowerCase())) {
        return authMessage("An account with that email already exists.");
    }
    if (state.users.some(user => user.username.toLowerCase() === data.username.toLowerCase())) {
        return authMessage("That username is already in use.");
    }
    const userId = `u-${Date.now()}`;
    const fullName = name || `${data.firstName} ${data.lastName}`;
    const newUser = {
        id: userId,
        name: fullName,
        username: data.username,
        email: data.email,
        password: data.password,
        role: role
    };
    if (role === "student") {
        newUser.studentId = data.username.toUpperCase();
    }
    state.users.push(newUser);
    if (role !== "student") {
        const teacherId = `T-${Date.now()}`;
        state.teachers.push({
            id: teacherId,
            name: fullName,
            username: data.username,
            email: data.email,
            password: data.password,
            department: data.department || "General",
            subjects: []
        });
    } else {
        const studentId = data.username.toUpperCase();
        state.students.push({
            id: studentId,
            user_id: userId,
            username: data.username,
            name: fullName,
            firstName: data.firstName,
            middleName: data.middleName || "",
            lastName: data.lastName,
            extension: data.extension || "",
            email: data.email,
            course: data.department || "General",
            year: "1st Year",
            academicYear: "2026-2027",
            firstSemesterEnrolled: true,
            secondSemesterEnrolled: false,
            status: "Active",
            teacherId: "",
            guardian: data.guardian || "",
            guardianContact: data.guardianContact || "",
            contact: data.contact || "",
            dateOfBirth: data.dateOfBirth || "",
            placeOfBirth: data.placeOfBirth || "",
            currentAddress: data.currentAddress || "",
            maritalStatus: data.maritalStatus || "",
            elementary: data.elementary || "",
            highSchool: data.highSchool || "",
            seniorHighSchool: data.seniorHighSchool || ""
        });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    authMessage("Creating your account...");
    const result = await saveRemoteState(state);
    if (!result.ok) {
        const rollbackState = JSON.parse(localStorage.getItem(STORAGE_KEY));
        rollbackState.users = rollbackState.users.filter(u => u.id !== userId);
        if (role !== "student") {
            rollbackState.teachers = rollbackState.teachers.filter(t => t.user_id !== userId);
        } else {
            const studentId = data.username.toUpperCase();
            rollbackState.students = rollbackState.students.filter(s => s.id !== studentId);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rollbackState));
        return authMessage(result.error || "Failed to save to database. Please check your connection.");
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId, role }));
    window.location.href = "dashboard.html";
});
document.querySelector("#register-form").addEventListener("invalid", () => {
    authMessage("Please complete the required account fields before creating your account.");
}, true);
document.querySelectorAll("[data-demo]").forEach(button => button.addEventListener("click", () => {
    const user = getState().users.find(item => item.role === button.dataset.demo);
    document.querySelector("#login-username").value = user.username;
    document.querySelector("#login-password").value = user.password;
    show("login-panel");
}));