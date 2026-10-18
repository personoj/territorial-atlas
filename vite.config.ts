import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

// Optional local QA pages are deliberately excluded from the production build.
function localMapReview(): Plugin {
  return {
    name: "local-map-review",
    apply: "serve",
    configureServer(server) {
      if (process.env.ATLAS_QA !== "1") return;
      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url || "/", "http://localhost")
          .pathname;
        try {
          if (pathname === "/__geographic-review") {
            const html = await readFile(
              resolve(root, "qa/geographic-review.html"),
              "utf8",
            );
            response.setHeader("Content-Type", "text/html; charset=utf-8");
            response.end(html);
            return;
          }
          if (
            pathname === "/__geographic-results" &&
            request.method === "POST" &&
            process.env.ATLAS_QA_OUTPUT
          ) {
            const chunks: Buffer[] = [];
            let size = 0;
            for await (const chunk of request) {
              size += chunk.length;
              if (size > 100 * 1024 * 1024) {
                response.statusCode = 413;
                response.end();
                return;
              }
              chunks.push(Buffer.from(chunk));
            }
            const result = JSON.parse(Buffer.concat(chunks).toString("utf8"));
            const output = resolve(process.env.ATLAS_QA_OUTPUT);
            await mkdir(output, { recursive: true });
            await writeFile(
              resolve(
                output,
                result.kind === "screenshots"
                  ? "screenshots.json"
                  : result.capture
                    ? "captured.json"
                    : "benchmark.json",
              ),
              JSON.stringify(result),
            );
            response.setHeader("Content-Type", "application/json");
            response.end('{"saved":true}');
            return;
          }
        } catch (error) {
          next(error as Error);
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), localMapReview()],
  server: { host: "127.0.0.1", port: 4173, strictPort: true },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        main: resolve(root, "index.html"),
        geographic: resolve(root, "geographic.html"),
        embedMap: resolve(root, "geographic-embed.html"),
      },
    },
  },
});
