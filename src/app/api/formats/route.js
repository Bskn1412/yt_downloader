import { execFile } from "child_process";
import path from "path";

export async function POST(req) {
  const { url } = await req.json();

  const ytDlpPath = path.join(process.cwd(), "bin", "yt-dlp.exe");

  return new Promise((resolve) => {
    execFile(
      ytDlpPath,
      [
        "-J", // JSON output
        "--no-playlist",
        "--no-warnings",
        url,
      ],
      (error, stdout, stderr) => {
        if (error) {
          console.error(stderr);
          resolve(
            new Response(
              JSON.stringify({ error: "Failed to extract info" }),
              { status: 500 }
            )
          );
          return;
        }

        let data;
        try {
          data = JSON.parse(stdout);
        } catch {
          resolve(
            new Response(
              JSON.stringify({ error: "Invalid JSON from yt-dlp" }),
              { status: 500 }
            )
          );
          return;
        }

        const video = [];
        const videoOnly = [];
        const audio = [];

        for (const f of data.formats) {
          const obj = {
            id: f.format_id,
            ext: f.ext,
            resolution: f.height ? `${f.height}p` : null,
            height: f.height || 0, // useful for sorting high-res first
            fps: f.fps,
            size: f.filesize || f.filesize_approx,
            vcodec: f.vcodec,
            acodec: f.acodec,
            abr: f.abr || null, // audio bitrate
          };

          // Audio + video
          if (f.vcodec !== "none" && f.acodec !== "none") {
            video.push(obj);
          }
          // Video only
          else if (f.vcodec !== "none") {
            videoOnly.push(obj);
          }
          // Audio only (this now includes ALL audio formats)
          else if (f.acodec !== "none") {
            audio.push(obj);
          }
        }

        // Sort high-to-low
        videoOnly.sort((a, b) => b.height - a.height);
        video.sort((a, b) => b.height - a.height);
        audio.sort((a, b) => (b.abr || 0) - (a.abr || 0));

        resolve(
          new Response(
            JSON.stringify({
              metadata: {
                title: data.title,
                thumbnail: data.thumbnail,
                duration: data.duration,
                channel: data.uploader,
                views: data.view_count,
                uploadDate: data.upload_date,
              },
              formats: { video, videoOnly, audio },
            }),
            { status: 200 }
          )
        );
      }
    );
  });
}
