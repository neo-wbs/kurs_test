import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Basis-Regeln für alle JS-Dateien
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },

  // app.js ist ein ES Module (Vite, type="module") → import/export und import.meta erlaubt
  { files: ["app.js"], languageOptions: { sourceType: "module" } },

  // .cjs-Dateien und Test-Dateien sind CommonJS (Jest, Node.js) → require/module.exports erlaubt
  { files: ["**/*.cjs", "**/*.test.js"], languageOptions: { sourceType: "commonjs", globals: { ...globals.node } } },
]);