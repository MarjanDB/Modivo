import path from "node:path";
import unpluginDts from "unplugin-dts/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const tsconfig = path.resolve(import.meta.dirname, "tsconfig.json");

export default defineConfig({
	plugins: [tsconfigPaths({ projects: [tsconfig] }), unpluginDts({ tsconfigPath: tsconfig })],
	build: {
		lib: {
			entry: "./src/index.ts",
			name: "DependencyInjectionLibrary",
			formats: ["es", "cjs", "umd"],
			fileName: (format) => `dependency-injection-library.${format}.js`,
		},
		rollupOptions: {
			// Externalize deps that shouldn't be bundled
			external: [],
			output: {
				globals: {},
			},
		},
		sourcemap: true,
		outDir: "dist",
		emptyOutDir: true,
		target: "esnext",
	},
	test: {
		environment: "node",
		globals: true,
		coverage: {
			reporter: ["text", "html"],
		},
		watch: false,
	},
});
