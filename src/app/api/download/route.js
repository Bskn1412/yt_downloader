import { spawn } from "child_process";
import path from "path";
import {
  createReadStream,
  unlinkSync,
  existsSync,
  readdirSync,
  statSync,
} from "fs";
import { tmpdir } from "os";

import pLimit from "p-limit";

const limit = pLimit(2);

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const url = searchParams.get("url");
  const formatId = searchParams.get("formatId");
  const title = searchParams.get("title");

  const forceMp3 = searchParams.get("forceMp3") === "true";
  const mp3Bitrate = searchParams.get("mp3Bitrate");

  // ✅ Linux / HF compatible
  const ytDlp = "yt-dlp";

  const tmpDir = tmpdir();

  const uniqueId =
    Date.now() + "_" + Math.random().toString(36).slice(2, 8);

  const base = `yt_${uniqueId}`;

  const outputTemplate = path.join(
    tmpDir,
    `${base}.%(ext)s`
  );

  try {
    await limit(() =>
      runYtDlp({
        url,
        formatId,
        outputTemplate,
        ytDlp,
        forceMp3,
        mp3Bitrate,
      })
    );

    const finalFile = findDownloadedFile(outputTemplate);

    const ext = path
      .extname(finalFile)
      .replace(".", "");

    const stream = createReadStream(finalFile);

    const safeTitle = (title || "video")
      .replace(/[<>:"/\\|?*]+/g, "")
      .replace(/[^\x00-\x7F]/g, "")
      .slice(0, 120);

    const filename = `${safeTitle}.${ext}`;

    // cleanup after stream closes
    stream.on("close", () => {
      setTimeout(() => {
        try {
          if (existsSync(finalFile)) {
            unlinkSync(finalFile);
          }
        } catch (e) {
          console.error("Cleanup error:", e);
        }
      }, 1500);
    });

    return new Response(stream, {
      headers: {
        "Content-Type": getMimeType(ext),

        "Content-Disposition": `attachment; filename="${filename}"`,

        "Content-Length": statSync(finalFile).size.toString(),
      },
    });
  } catch (err) {
    console.error("Download error:", err);

    return new Response(
      JSON.stringify({
        error: err.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

function runYtDlp({
  url,
  formatId,
  outputTemplate,
  ytDlp,
  forceMp3,
  mp3Bitrate,
}) {
  return new Promise((resolve, reject) => {
    // ✅ smart fallback
    const formatSelector = forceMp3
      ? `${formatId || "bestaudio"}/bestaudio/best`
      : `${formatId}+bestaudio/${formatId}/best`;

    const args = [
      "-f",
      formatSelector,

      "--cookies",
        "/app/cookies.txt",
        "--geo-bypass",
      
      "--extractor-args",
      "youtube:player_client=android,web",

      "--no-playlist",

      "--newline",

      "--js-runtimes",
      "node",

      "--ffmpeg-location",
      "/usr/bin",

      "-o",
      outputTemplate,

      url,
    ];

    // ✅ MP3 conversion
    if (forceMp3) {
      args.unshift(
        "--extract-audio",

        "--audio-format",
        "mp3",

        "--audio-quality",
        mp3Bitrate
          ? `${mp3Bitrate}K`
          : "0"
      );
    }

    console.log("YT-DLP ARGS:");
    console.log(args.join(" "));

    const proc = spawn(ytDlp, args);

    proc.stdout.on("data", (d) => {
      console.log(
        "yt-dlp:",
        d.toString()
      );
    });

    proc.stderr.on("data", (d) => {
      console.error(
        "yt-dlp:",
        d.toString()
      );
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `yt-dlp exited with code ${code}`
          )
        );
      }
    });

    proc.on("error", reject);
  });
}

function findDownloadedFile(template) {
  const dir = path.dirname(template);

  const base = path
    .basename(template)
    .replace(".%(ext)s", "");

  const files = readdirSync(dir);

  const match = files.find((f) =>
    f.startsWith(base)
  );

  if (!match) {
    throw new Error(
      "Downloaded file not found"
    );
  }

  return path.join(dir, match);
}

function getMimeType(ext) {
  switch (ext) {
    case "mp4":
      return "video/mp4";

    case "webm":
      return "video/webm";

    case "mkv":
      return "video/x-matroska";

    case "mp3":
      return "audio/mpeg";

    case "m4a":
      return "audio/mp4";

    default:
      return "application/octet-stream";
  }
}
