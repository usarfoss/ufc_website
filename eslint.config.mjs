import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "prisma/migrations/**", ".private/**", "src/generated/**", "next-env.d.ts", "public/**"] },
  ...coreWebVitals,
  ...typescript,
];

export default eslintConfig;
