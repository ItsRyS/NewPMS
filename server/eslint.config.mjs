import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier"; // Import Prettier Config

export default [
  { ignores: ["dist", "node_modules"] },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
    },
    extends: [prettier], // ปิดกฎที่ขัดแย้งกับ Prettier
  },
];
