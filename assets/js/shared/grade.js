export const PASSING_GRADE = 75;

export const normalizeGrade = value => {
    const grade = Number(value);
    if (!Number.isFinite(grade) || grade < 0 || grade > 100) return null;
    return Math.round(grade * 100) / 100;
};

export const gradeDecision = grade => {
    const normalizedGrade = normalizeGrade(grade);
    return normalizedGrade !== null && normalizedGrade >= PASSING_GRADE ? "Pass" : "Fail";
};
