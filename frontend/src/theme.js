import { useSyncExternalStore } from "react";

// Light/dark theme. The choice is saved in localStorage; with no saved choice
// we follow the operating system. index.html applies it before React loads so
// the page never flashes the wrong theme.

const STORAGE_KEY = "theme";
const listeners = new Set();

function readSaved() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved === "dark" || saved === "light" ? saved : null;
    } catch {
        return null;
    }
}

function systemTheme() {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getTheme() {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function apply(theme) {
    document.documentElement.dataset.theme = theme;
    listeners.forEach((listener) => listener());
}

export function setTheme(theme) {
    try {
        localStorage.setItem(STORAGE_KEY, theme);
    } catch {
        // Storage blocked: the theme still applies for this visit
    }
    apply(theme);
}

export function toggleTheme() {
    setTheme(getTheme() === "dark" ? "light" : "dark");
}

export function initTheme() {
    apply(readSaved() || systemTheme());

    // Follow OS changes until the user picks a theme themselves
    window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", (event) => {
        if (!readSaved()) apply(event.matches ? "dark" : "light");
    });
}

function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function useTheme() {
    return useSyncExternalStore(subscribe, getTheme, () => "light");
}
