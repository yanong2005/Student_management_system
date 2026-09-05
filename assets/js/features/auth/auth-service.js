import { STORAGE_KEY } from "../../shared/constants.js";
import { defaultAuthState, seededPasswords } from "../../data/auth-seed.js";
import { loadRemoteState, refreshRemoteState, saveRemoteState } from "../../infrastructure/workspace-client.js";
if (!localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAuthState));
export const remoteAuthStateReady = loadRemoteState(JSON.parse(localStorage.getItem(STORAGE_KEY))).then(state => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
});
export const getState = () => {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultAuthState;
    state.users.forEach(user => {
        user.username ||= user.role === "student" ? user.studentId : user.email.split("@")[0];
    });
    return state;
};
export const authenticate = async (username, password) => {
    await remoteAuthStateReady;
    let state = getState();
    let user = state.users.find(item => item.username?.toLowerCase() === username.toLowerCase() && item.password === password);
    if (!user) {
        state = await refreshRemoteState(state);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        user = state.users.find(item => item.username?.toLowerCase() === username.toLowerCase() && (item.password === password || (!item.password && seededPasswords[item.username] === password)));
    }
    if (!user && seededPasswords[username] === password) user = state.users.find(item => item.username?.toLowerCase() === username.toLowerCase());
    return user;
};
export { saveRemoteState };