import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Zalando Sans Expanded"', 'sans-serif'],
            },
        },
    },
    darkMode: "class",
    plugins: [heroui()],
};
