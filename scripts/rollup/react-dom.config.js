import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import path from "path";

const pathToReact = path.resolve(__dirname, "../../packages/react-dom");

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
      {
        name: "react-fiber-host-config-inject",
        resolveId(source, importer) {
          if (source === "./ReactFiberHostConfig") {
            // 返回对应平台的实现路径
            return {
              id: `./src/forks/ReactFiberHostConfig.dom.ts`,
              external: false,
            };
          }
          return null;
        },
      },
    ],
  },
];
