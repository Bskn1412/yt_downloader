import { spawn } from "child_process";
import path from "path";

export async function POST(req) {

  const { url, formatId, title } = await req.json();

  const ytDlp = path.join(process.cwd(), "bin", "yt-dlp.exe");
  const ffmpeg = path.join(process.cwd(), "bin");

  const filename = title.replace(/[^\w\d]+/g, "_") + ".webm";

  const args = [
    "-f",
    `${formatId}+bestaudio/best`,
    "--ffmpeg-location",
    ffmpeg,
    "-o",
    "-",
    url
  ];

  const proc = spawn(ytDlp, args);

  const stream = new ReadableStream({
    start(controller) {

      proc.stdout.on("data", (chunk) => {
        controller.enqueue(chunk);
      });

      proc.stdout.on("end", () => {
        controller.close();
      });

      proc.on("error", (err) => {
        controller.error(err);
      });

    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}