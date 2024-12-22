import { defineConfig } from "vite";

export default defineConfig({
    root: '', // Sets the source directory
    build: {
        outDir: './dist', // Build output directory
    },
    server: {
        open: true, // Automatically opens the browser
    },
});
