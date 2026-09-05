import { DATABASE_API, DATABASE_STATE_ID } from "../shared/constants.js";
let databaseVersion = 0;

const parseJsonResponse = async response => {
    const text = await response.text();
    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        console.error("Failed to parse server response:", error, text);
        throw new Error("The backend returned invalid data. Start XAMPP MySQL, import xampp-schema.sql, and make sure the PHP server is running on http://127.0.0.1:8000.");
    }
};

export const loadRemoteState = async fallback => {
    try {
        const response = await fetch(`${DATABASE_API}?id=${DATABASE_STATE_ID}`);
        if (!response.ok) return fallback;
        const payload = await parseJsonResponse(response);
        databaseVersion = Number(payload.version) || 0;
        return payload.state || fallback;
    } catch (error) {
        console.error("Load error:", error);
        return fallback;
    }
};
export const refreshRemoteState = async fallback => {
    try {
        const response = await fetch(`${DATABASE_API}?id=${DATABASE_STATE_ID}&refresh=${Date.now()}`, {
            cache: "no-store"
        });
        if (!response.ok) return fallback;
        const payload = await parseJsonResponse(response);
        databaseVersion = Number(payload.version) || 0;
        return payload.state || fallback;
    } catch (error) {
        console.error("Refresh error:", error);
        return fallback;
    }
};
export const saveRemoteState = async state => {
    try {
        const requestBody = JSON.stringify({
            id: DATABASE_STATE_ID,
            state: state,
            expected_version: databaseVersion
        });
        const response = await fetch(DATABASE_API, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: requestBody
        });

        let payload = {};
        try {
            payload = await parseJsonResponse(response);
        } catch (error) {
            return {
                ok: false,
                error: error.message || "Invalid response from server. Please check your database connection."
            };
        }

        if (response.ok) {
            databaseVersion = Number(payload.version) || databaseVersion + 1;
            return { ok: true, version: databaseVersion };
        }
        if (response.status === 409) {
            return {
                ok: false,
                error: "Data conflict. Please refresh and try again.",
                version: payload.version
            };
        }
        if (response.status === 413) {
            return {
                ok: false,
                error: "Data is too large to save."
            };
        }
        return {
            ok: false,
            error: payload.error || `The server did not accept the request (${response.status}). Check your PHP API and database settings.`
        };
    } catch (error) {
        console.error("Save error:", error);
        return {
            ok: false,
            error: "Network error: unable to reach the PHP API. Start the backend server or configure a live API URL."
        };
    }
};