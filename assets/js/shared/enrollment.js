import { CURRENT_ACADEMIC_YEAR, CURRENT_SEMESTER } from "./constants.js?v=2";

export const SEMESTERS = ["1st Semester", "2nd Semester"];
export const ENROLLMENT_STATES = ["Enrolled", "Not enrolled"];

export const enrollmentStatus = (student, semester = CURRENT_SEMESTER) => {
    if (student.academicYear && student.academicYear !== CURRENT_ACADEMIC_YEAR) return "Inactive";
    const enrolled = semester === "1st Semester" ? student.firstSemesterEnrolled : student.secondSemesterEnrolled;
    return enrolled === false || enrolled === "Not enrolled" ? "Inactive" : "Active";
};

export const enrollmentLabel = student => `${student.academicYear || CURRENT_ACADEMIC_YEAR} · ${CURRENT_SEMESTER}`;
