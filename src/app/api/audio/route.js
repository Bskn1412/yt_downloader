import { spawn } from "child_process";
import path from "path";

export async function POST(req) {

  const { url } = await req.json();

  const ytDlp = path.join(process.cwd(), "bin", "yt-dlp.exe");
  const ffmpeg = path.join(process.cwd(), "bin");

  const outputDir = path.join(process.cwd(), "downloads");

  const filename = `audio_${Date.now()}.mp3`;

  const args = [
    "-x",
    "--audio-format",
    "mp3",
    "--ffmpeg-location",
    ffmpeg,
    "-o",
    `${outputDir}/${filename}`,
    url
  ];

  return new Promise((resolve) => {

    const proc = spawn(ytDlp, args);

    proc.on("close", () => {

      resolve(Response.json({
        files: [
          {
            bitrate: "MP3",
            filename
          }
        ]
      }));

    });

  });

}