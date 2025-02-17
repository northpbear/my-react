import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteExternalsPlugin } from "vite-plugin-externals";

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: true
  },
  plugins: [
    react({
      jsxRuntime: "classic",
    }),
    viteExternalsPlugin(
      {
        react: "React", // 映射react的全局变量为React
        "react-dom": "ReactDOM",
        "react-dom/client": "ReactDOM",
      },
      // {
      //   disableInServe: true,
      // }
    ),
  ],
});
