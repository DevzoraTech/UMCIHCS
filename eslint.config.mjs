import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    files: ["src/domain/**/*.{ts,tsx}", "src/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          { group: ["react", "react/**", "next", "next/**", "@/app/**", "@/presentation/**", "@/infrastructure/**"], message: "Core logic must stay independent of frameworks, UI, and integrations." },
          { group: ["../**"], message: "Use @/ imports across core folders so architecture boundaries can be checked." }
        ]
      }]
    }
  },
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: ["react", "react/**", "next", "next/**", "@/app/**", "@/presentation/**", "@/infrastructure/**", "@/application/**", "@/config/**", "../**"]
      }]
    }
  },
  globalIgnores([".next/**", ".netlify/**", "out/**", "build/**", "next-env.d.ts"])
]);
