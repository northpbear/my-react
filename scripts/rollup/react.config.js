import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import path from "path";

const pathToReact = path.resolve(__dirname, "../../packages/react");

export default [
  {
    input: path.resolve(pathToReact, "./index.ts"),
    output: {
      file: path.resolve(pathToReact, "./dist/index.js"),
      format: "es",
      sourcemap: true,
    },
    plugins: [
      commonjs(),
      typescript({
        tsconfig: path.resolve(__dirname, "../../tsconfig.json"),
        sourceMap: true,
        include: ["packages/**/*"],
      }),
    ],
  },
  {
    input: path.resolve(pathToReact, "./src/jsx.ts"),
    output: [
      {
        file: path.resolve(pathToReact, "./dist/jsx-runtime.js"),
        format: "es",
        sourcemap: true,
      },
      {
        file: path.resolve(pathToReact, "./dist/jsx-dev-runtime.js"),
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [
      commonjs(),
      typescript({
        tsconfig: path.resolve(__dirname, "../../tsconfig.json"), // 指定 tsconfig 路径
        sourceMap: true,
        include: ["packages/**/*"],
      }),
    ],
  },
];
