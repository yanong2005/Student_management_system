import { esc } from "./html.js";

const attrs = values => Object.entries(values).filter(([, value]) => value !== undefined && value !== false).map(([key, value]) => value === true ? key : `${key}="${esc(value)}"`).join(" ");

export const Button = ({ label = "Button", icon = "", variant = "primary", type = "button", ...options } = {}) => `<button class="ui-button ui-button-${esc(variant)}" type="${esc(type)}" ${attrs(options)}>${icon ? `<span aria-hidden="true">${esc(icon)}</span>` : ""}<span>${esc(label)}</span></button>`;

export const StatCard = ({ label = "", value = "", note = "", tone = "blue" } = {}) => `<article class="stat" aria-label="${esc(label)}"><span class="stat-icon ${esc(tone)}" aria-hidden="true"></span><div><strong>${esc(value)}</strong><span>${esc(label)}</span><small>${esc(note)}</small></div></article>`;

export const Panel = ({ title = "", eyebrow = "", action = "", content = "", className = "" } = {}) => `<section class="panel ${esc(className)}"><div class="panel-head"><div>${eyebrow ? `<span class="section-label">${esc(eyebrow)}</span>` : ""}${title ? `<h3>${esc(title)}</h3>` : ""}</div>${action}</div>${content}</section>`;

export const EmptyState = ({ title = "Nothing here yet", message = "There are no records to display." } = {}) => `<div class="ui-state ui-empty" role="status"><strong>${esc(title)}</strong><span>${esc(message)}</span></div>`;

export const LoadingState = ({ message = "Loading workspace..." } = {}) => `<div class="ui-state ui-loading" role="status" aria-live="polite"><span class="loading-spinner" aria-hidden="true"></span><span>${esc(message)}</span></div>`;

export const ErrorState = ({ message = "Something went wrong.", action = "Try again", actionId = "retry" } = {}) => `<div class="ui-state ui-error" role="alert"><strong>Unable to load this view</strong><span>${esc(message)}</span>${Button({ label: action, variant: "quiet", "data-action": actionId })}</div>`;

export const DataTable = ({ headers = [], rows = "", empty = EmptyState({}), label = "Data table" } = {}) => `<div class="table-wrap"><table aria-label="${esc(label)}"><thead><tr>${headers.map(header => `<th scope="col">${esc(header)}</th>`).join("")}</tr></thead><tbody>${rows || `<tr><td colspan="${headers.length}">${empty}</td></tr>`}</tbody></table></div>`;
