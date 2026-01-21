/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0f172a", // Slate 900
                foreground: "#f8fafc", // Slate 50
                primary: {
                    DEFAULT: "#3b82f6", // Blue 500
                    foreground: "#ffffff",
                },
                secondary: {
                    DEFAULT: "#1e293b", // Slate 800
                    foreground: "#f8fafc",
                },
                muted: {
                    DEFAULT: "#334155", // Slate 700
                    foreground: "#94a3b8", // Slate 400
                },
                accent: {
                    DEFAULT: "#8b5cf6", // Violet 500
                    foreground: "#ffffff",
                },
                destructive: {
                    DEFAULT: "#ef4444", // Red 500
                    foreground: "#ffffff",
                },
                border: "#1e293b", // Slate 800
            },
        },
    },
    darkMode: "class",
    plugins: [],
}
