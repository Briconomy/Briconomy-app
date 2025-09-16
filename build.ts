import { build } from "https://deno.land/x/esbuild@v0.19.8/mod.js";

const result = await build({
  entryPoints: ["./src/main.tsx"],
  bundle: true,
  platform: "browser",
  target: "es2020",
  format: "esm",
  outdir: "./dist",
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
  external: [
    "react",
    "react-dom",
    "react-router-dom",
    "chart.js",
    "react-chartjs-2"
  ],
  minify: true,
  sourcemap: true,
  splitting: true,
  chunkNames: "[name]-[hash]",
});

console.log("Build completed successfully");
console.log(`Output: ${result.outputFiles?.length || 0} files generated`);

Deno.exit(0);