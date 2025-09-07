import path from "node:path";
import unpluginDts from "unplugin-dts/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const tsconfig = path.resolve(import.meta.dirname, "tsconfig.json");

export default defineConfig({
	plugins: [
		tsconfigPaths({ projects: [tsconfig] }),
		unpluginDts({
			tsconfigPath: tsconfig,
		}),
	],
	test: {
		environment: "node",
		globals: true,
		coverage: {
			reporter: ["text", "html", "lcov"],
		},
		watch: false,
	},
});
