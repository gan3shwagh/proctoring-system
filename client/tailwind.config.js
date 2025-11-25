/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#137fec",
                "background-light": "#f6f7f8",
                "background-dark": "#101922",
                "warning": "#FFC107",
                "danger": "#DC3545",
                "success": "#28A745",
                "surface-light": "#ffffff",
                "surface-dark": "#1a242e",
                "border-light": "#e0e0e0",
                "border-dark": "#3b4754",
                "text-light-primary": "#111418",
                "text-light-secondary": "#6b7280",
                "text-dark-primary": "#ffffff",
                "text-dark-secondary": "#9dabb9",
            },
            fontFamily: {
                "display": ["Lexend", "sans-serif"]
            },
        },
    },
    plugins: [],
}
