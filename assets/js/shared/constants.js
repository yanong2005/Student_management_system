export const STORAGE_KEY = "sms-demo-state";
export const SESSION_KEY = "sms-demo-session";
export const THEME_KEY = "sms-demo-theme";
export const SIDEBAR_KEY = "sms-demo-sidebar-collapsed";
export const DATABASE_STATE_ID = "main";
export const CURRENT_ACADEMIC_YEAR = "2026-2027";
export const CURRENT_SEMESTER = "1st Semester";

const normalizeApiUrl = url => typeof url === "string" ? url.trim().replace(/\/+$/, "") : "api.php";

export const getApiBaseUrl = () => {
    const override = window.PILOT_API_URL || window.__PILOT_API_URL__ || document.body?.dataset?.apiUrl || "";
    if (override) {
        return normalizeApiUrl(override);
    }

    const hostname = window.location.hostname || "";
    const isLocalDevelopmentHost = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(hostname)
        || /^10\./.test(hostname)
        || /^192\.168\./.test(hostname)
        || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);

    if (isLocalDevelopmentHost) {
        return "api.php";
    }

    return "api.php";
};

export const DATABASE_API = getApiBaseUrl();