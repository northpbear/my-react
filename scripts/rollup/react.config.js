import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import path from "path";

const pathToReact = path.resolve(__dirname, "../../packages/react");

export default [
  {
    input: path.resolve(pathToReact, "./index.ts"),
    output: {
      file: path.resolve(pathToReact, "./dist/index.js"),
      format: "umd",
      name: "React", // 添加 UMD 模块名称
      sourcemap: true, // 添加 sourcemap 支持
    },
    plugins: [
      commonjs(),
      typescript({
        tsconfig: path.resolve(__dirname, "../../tsconfig.json"), // 指定 tsconfig 路径
        sourceMap: true,
      }),
    ],
  },
  {
    input: path.resolve(pathToReact, "./src/jsx.ts"),
    output: [
      {
        file: path.resolve(pathToReact, "./dist/jsx-runtime.js"),
        name: "React",
        format: "umd",
      },
      {
        file: path.resolve(pathToReact, "./dist/jsx-dev-runtime.js"),
        name: "React",
        format: "umd",
      },
    ],
    plugins: [
      commonjs(),
      typescript({
        tsconfig: path.resolve(__dirname, "../../tsconfig.json"), // 指定 tsconfig 路径
        sourceMap: true,
      }),
    ],
  },
];
