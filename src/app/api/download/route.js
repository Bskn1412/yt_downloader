import { spawn } from "child_process";
import path from "path";
import { createReadStream, unlinkSync, existsSync, readdirSync, statSync} from "fs";
import { tmpdir } from "os";

import pLimit from "p-limit";
  
const limit = pLimit(3); // allow 3 downloads at once
export async function GET(req) {

  const { searchParams } = new URL(req.url);

  const url = searchParams.get("url");
  const formatId = searchParams.get("formatId");
  const title = searchParams.get("title");
  const forceMp3 = searchParams.get("forceMp3") === "true";
  const mp3Bitrate = searchParams.get("mp3Bitrate");

  const ytDlp = path.join(process.cwd(), "bin", "yt-dlp.exe");
  const ffmpegDir = path.join(process.cwd(), "bin");

  const tmpDir = tmpdir();
  
  const uniqueId = Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  const base = `yt_${uniqueId}`;

  const outputTemplate = path.join(tmpDir, `${base}.%(ext)s`);


  try {

    await limit(() => 
      runYtDlp({
      url,
      formatId,
      outputTemplate,
      ytDlp,
      ffmpegDir,
      forceMp3,
      mp3Bitrate
    })
  );

    const finalFile = findDownloadedFile(outputTemplate);
    const ext = path.extname(finalFile).replace(".", "");

    const stream = createReadStream(finalFile);

   const safeTitle =
    (title || "video")
    .replace(/[<>:"/\\|?*]+/g, "")
    .replace(/[^\x00-\x7F]/g, "")   // remove unicode
    .slice(0, 120);

    const filename = `${safeTitle}.${ext}`;

    stream.on("close", () => {
      setTimeout(() => {
        try {
          if (existsSync(finalFile)) unlinkSync(finalFile);
        } catch (e) {
          console.error("Cleanup error:", e);
        }
      }, 1000);
    });

    const mime = getMimeType(ext);

    return new Response(stream, {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": statSync(finalFile).size,
      },
    });

  } catch (err) {

    console.error("Download error:", err);

    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

function runYtDlp({
  url,
  formatId,
  outputTemplate,
  ytDlp,
  ffmpegDir,
  forceMp3,
  mp3Bitrate
}) {

  return new Promise((resolve, reject) => {

    const formatSelector = forceMp3
      ? `${formatId || "bestaudio"}/bestaudio/best`
      : `${formatId}+bestaudio/best`;

    const args = [
      "-f",
      formatSelector,

      "--no-playlist",
      "--newline",

      "--js-runtimes", "node",

      "--ffmpeg-location", ffmpegDir,

      "-o", outputTemplate,

      url
    ];

    if (forceMp3) {
      args.unshift(
        "--extract-audio",
        "--audio-format", "mp3",
        "--audio-quality", mp3Bitrate ? `${mp3Bitrate}K` : "0"
      );
    }

    const proc = spawn(ytDlp, args);

    proc.stdout.on("data", (d) =>
      console.log("yt-dlp:", d.toString())
    );

    proc.stderr.on("data", (d) =>
      console.error("yt-dlp:", d.toString())
    );

    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`yt-dlp exited with code ${code}`));
    });

    proc.on("error", reject);

  });
}



function findDownloadedFile(template) {

  const dir = path.dirname(template);
  const base = path.basename(template).replace(".%(ext)s", "");

  const files = readdirSync(dir);

  const match = files.find((f) => f.startsWith(base));

  if (!match) {
    throw new Error("Downloaded file not found");
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