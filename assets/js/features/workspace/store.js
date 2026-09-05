import { SESSION_KEY, STORAGE_KEY } from "../../shared/constants.js";
import { dashboardSeed } from "../../data/dashboard-seed.js";
import { loadRemoteState, saveRemoteState } from "../../infrastructure/workspace-client.js";
export let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || dashboardSeed;
export let session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
export let activeView = "overview";
export let editing = null;
export const setState = next => { state = next; };
export const setActiveView = view => { activeView = view; };
export const setEditing = value => { editing = value; };
export const remoteStateReady = loadRemoteState(state).then(remoteState => {
    state = remoteState;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
});
export const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    saveRemoteState(state);
};
state.users.forEach(user => { user.username ||= user.role === "student" ? user.studentId : user.email.split("@")[0]; });
export const currentUser = () => state.users.find(user => user.id === session?.userId);
export const find = (collection, id) => state[collection].find(item => item.id === id);
export const currentTeacher = () => state.teachers.find(teacher => teacher.email === currentUser()?.email) || state.teachers[0];