#!/usr/bin/env node

import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const VIEWER_PATH = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../node_modules/@google/model-viewer/dist/model-viewer.min.js",
);
import { platform } from "node:os";
import { spawn } from "node:child_process";

const requestedModelPath = process.argv[2] ?? "artifacts/demo.gltf";
const modelPath = resolve(process.cwd(), requestedModelPath);

if (!existsSync(modelPath)) {
    console.error(`GLTF file not found: ${modelPath}`);
    process.exit(2);
}

if (extname(modelPath).toLowerCase() !== ".gltf") {
    console.error(`Expected a .gltf file, got: ${modelPath}`);
    process.exit(2);
}

const modelFile = basename(modelPath);

const rawPort = Number(process.env.PREVIEW_PORT ?? "4173");
if (!Number.isInteger(rawPort) || rawPort < 1 || rawPort > 65535) {
    console.error(
        `Invalid PREVIEW_PORT value: "${process.env.PREVIEW_PORT ?? ""}". Must be an integer between 1 and 65535.`,
    );
    process.exit(2);
}
const port = rawPort;

const html = `<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>cacad glTF preview</title>
        <style>
            html, body {
                margin: 0;
                width: 100%;
                height: 100%;
                background: #111;
                color: #eee;
                font-family: sans-serif;
            }
            .banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 10;
                padding: 8px 12px;
                background: rgba(0, 0, 0, 0.7);
                font-size: 14px;
            }
            model-viewer {
                width: 100%;
                height: 100%;
            }
        </style>
        <script type="module" src="/vendor/model-viewer.min.js"></script>
    </head>
    <body>
        <div class="banner">Previewing: ${modelFile.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
        <model-viewer src="/${encodeURIComponent(modelFile)}" camera-controls auto-rotate exposure="1"></model-viewer>
    </body>
</html>`;

const mime = {
    ".html": "text/html; charset=utf-8",
    ".gltf": "model/gltf+json",
    ".bin": "application/octet-stream",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
    res.writeHead(status, { "content-type": type });
    res.end(body);
}

const server = createServer((req, res) => {
    const url = req.url ?? "/";

    if (url === "/" || url === "/index.html") {
        send(res, 200, html, mime[".html"]);
        return;
    }

    if (url === "/vendor/model-viewer.min.js") {
        try {
            const data = readFileSync(VIEWER_PATH);
            res.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
            res.end(data);
        } catch (error) {
            send(res, 500, `Unable to read vendor script: ${String(error)}`);
        }
        return;
    }

    let requested;
    try {
        requested = decodeURIComponent(url.startsWith("/") ? url.slice(1) : url);
    } catch {
        send(res, 400, "Bad request: invalid URL encoding");
        return;
    }

    if (requested !== modelFile) {
        send(res, 404, `Not found: ${requested}`);
        return;
    }

    const ext = extname(requested).toLowerCase();
    const type = mime[ext] ?? "application/octet-stream";

    try {
        const data = readFileSync(modelPath);
        res.writeHead(200, { "content-type": type });
        res.end(data);
    } catch (error) {
        send(res, 500, `Unable to read model: ${String(error)}`);
    }
});

server.listen(port, "127.0.0.1", () => {
    const url = `http://127.0.0.1:${port}`;
    console.log(`glTF preview server running at ${url}`);
    console.log(`Serving model: ${modelPath}`);
    console.log("Press Ctrl+C to stop.");

    if (platform() === "darwin") {
        spawn("open", [url], { stdio: "ignore", detached: true }).unref();
    }
});
