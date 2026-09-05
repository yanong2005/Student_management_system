import { DATABASE_API, DATABASE_STATE_ID } from "../shared/constants.js";
let databaseVersion = 0;
export const loadRemoteState = async fallback => {
    try {
        const response = await fetch(`${DATABASE_API}?id=${DATABASE_STATE_ID}`);
        if (!response.ok) return fallback;
        const payload = await response.json();
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
        const payload = await response.json();
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
        console.log("Saving state with version:", databaseVersion);
        console.log("State keys:", Object.keys(state));
        const response = await fetch(DATABASE_API, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: requestBody
        });
        console.log("Response status:", response.status);
        let payload = {};
        try {
            const text = await response.text();
            console.log("Response text:", text);
            if (text) {
                payload = JSON.parse(text);
            }
        } catch (e) {
            console.error("Failed to parse response:", e);
            return {
                ok: false,
                error: "Invalid response from server. Please check your database connection."
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
            error: payload.error || `Server error (${response.status})`
        };
    } catch (error) {
        console.error("Save error:", error);
        return {
            ok: false,
            error: "Network error: " + error.message
        };
    }
};