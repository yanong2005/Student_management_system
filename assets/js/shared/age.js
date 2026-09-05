export const calculateAge = dateOfBirth => {
    if (!dateOfBirth) return "";
    const today = new Date();
    const birthDate = new Date(`${dateOfBirth}T00:00:00`);
    let age = today.getFullYear() - birthDate.getFullYear();
    const birthdayNotReached = today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
    if (birthdayNotReached) age -= 1;
    return age >= 0 ? age : "";
};