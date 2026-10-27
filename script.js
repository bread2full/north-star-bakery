"use strict";
// Touchstone 4: two data structures organize the menu and validation rules.
const bakeryItems = [
  { id: "bread", name: "Handmade breads" },
  { id: "pastries", name: "Morning pastries" },
  { id: "cakes", name: "Celebration cakes" }
];
const fieldRules = {
  name: { label: "Full name", minLength: 2 },
  email: { label: "Email address" },
  type: { label: "Request type" },
  details: { label: "Item details", minLength: 10 }
};
const favoritesKey = "northStarBakeryFavorites";
const preferenceKey = "northStarBakeryRequestType";
function readFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(favoritesKey) || "[]");
    return Array.isArray(saved) ? saved.filter(id => bakeryItems.some(item => item.id === id)) : [];
  } catch (error) { return []; }
}
function saveFavorites(favorites) {
  try { localStorage.setItem(favoritesKey, JSON.stringify(favorites)); } catch (error) { /* Storage can be unavailable. */ }
}
function renderFavorites(favorites) {
  const options = document.getElementById("favorite-options");
  const summary = document.getElementById("favorite-summary");
  if (!options || !summary) return;
  options.replaceChildren();
  bakeryItems.forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "favorite-choice";
    button.textContent = item.name;
    button.setAttribute("aria-pressed", String(favorites.includes(item.id)));
    button.addEventListener("click", () => {
      favorites = favorites.includes(item.id) ? favorites.filter(id => id !== item.id) : [...favorites, item.id];
      saveFavorites(favorites);
      renderFavorites(favorites);
    });
    options.appendChild(button);
  });
  const names = favorites.map(id => bakeryItems.find(item => item.id === id).name);
  summary.textContent = names.length ? "Saved favorites: " + names.join(", ") + "." : "No favorites saved yet.";
  const clear = document.getElementById("clear-favorites");
  if (clear) clear.disabled = favorites.length === 0;
}
function initializeFavorites() {
  if (!document.getElementById("favorite-options")) return;
  renderFavorites(readFavorites());
  document.getElementById("clear-favorites").addEventListener("click", () => {
    saveFavorites([]); renderFavorites([]);
  });
}
function getFieldError(field) {
  const value = field.value.trim();
  const rule = fieldRules[field.id];
  if (!value) return rule.label + " is required.";
  if (rule.minLength && value.length < rule.minLength) return rule.label + " must be at least " + rule.minLength + " characters.";
  if (field.id === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address (example: name@example.com).";
  return "";
}
function validateField(field) {
  const error = getFieldError(field);
  document.getElementById(field.id + "-error").textContent = error;
  if (error) field.setAttribute("aria-invalid", "true");
  else field.removeAttribute("aria-invalid");
  return !error;
}
function initializeForm() {
  const form = document.getElementById("inquiry-form");
  if (!form) return;
  const type = document.getElementById("type");
  try {
    const remembered = localStorage.getItem(preferenceKey);
    if (["preorder", "question"].includes(remembered)) type.value = remembered;
  } catch (error) { /* Continue without stored preferences. */ }
  type.addEventListener("change", () => {
    try { localStorage.setItem(preferenceKey, type.value); } catch (error) {}
  });
  Object.keys(fieldRules).forEach(id => {
    const field = document.getElementById(id);
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(field);
    });
    field.addEventListener("change", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(field);
    });
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const fields = Object.keys(fieldRules).map(id => document.getElementById(id));
    const valid = fields.map(validateField).every(Boolean);
    const status = document.getElementById("form-status");
    if (!valid) {
      status.textContent = "Please correct the highlighted fields before reviewing your request.";
      fields.find(field => field.getAttribute("aria-invalid") === "true").focus();
      return;
    }
    status.textContent = "Your request looks ready to review. This is a demonstration form; no message has been sent.";
  });
}
document.addEventListener("DOMContentLoaded", () => { initializeFavorites(); initializeForm(); });
