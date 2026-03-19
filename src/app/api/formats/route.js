import ytdlp from "yt-dlp-exec";

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400 }
      );
    }

    // 🔥 Fetch data using yt-dlp-exec
    const data = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noPlaylist: true,
    });

    const formats = data.formats || [];

    const video = [];
    const videoOnly = [];
    const audio = [];

    for (const f of formats) {
      const size = f.filesize || f.filesize_approx || 0;

      const obj = {
        id: f.format_id,
        ext: f.ext,
        resolution: f.height ? `${f.height}p` : null,
        height: f.height || 0,
        fps: f.fps || 0,
        size,
        vcodec: f.vcodec,
        acodec: f.acodec,
        abr: f.abr || null,
      };

      if (f.vcodec !== "none" && f.acodec !== "none") {
        video.push(obj);
      } else if (f.vcodec !== "none" && f.acodec === "none") {
        videoOnly.push(obj);
      } else if (f.acodec !== "none" && f.vcodec === "none") {
        audio.push(obj);
      }
    }

    // Best audio
    const bestAudio = [...audio].sort(
      (a, b) => (b.abr || 0) - (a.abr || 0)
    )[0];

    const bestAudioSize = bestAudio?.size || 0;

    const videoOnlyMerged = videoOnly.map((v) => ({
      ...v,
      size: (v.size || 0) + bestAudioSize,
    }));

    video.sort((a, b) => b.height - a.height);
    videoOnlyMerged.sort((a, b) => b.height - a.height);
    audio.sort((a, b) => (b.abr || 0) - (a.abr || 0));

    return new Response(
      JSON.stringify({
        metadata: {
          title: data.title,
          thumbnail: data.thumbnail,
          duration: data.duration,
          channel: data.uploader,
          views: data.view_count,
          uploadDate: data.upload_date,
        },
        formats: {
          video,
          videoOnly: videoOnlyMerged,
          audio,
        },
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("yt-dlp error:", error);

    return new Response(
      JSON.stringify({ error: "Failed to extract info" }),
      { status: 500 }
    );
  }
}





// import { execFile } from "child_process";
// import path from "path";

// export async function POST(req) {
//   const { url } = await req.json();

//   const ytDlpPath = path.join(process.cwd(), "bin", "yt-dlp.exe");

//   return new Promise((resolve) => {
//     execFile(
//       ytDlpPath,
//       [
//         "-J",
//         "--no-playlist",
//         "--no-warnings",
//         url
//       ],
//       (error, stdout, stderr) => {

//         if (error) {
//           console.error(stderr);
//           resolve(
//             new Response(
//               JSON.stringify({ error: "Failed to extract info" }),
//               { status: 500 }
//             )
//           );
//           return;
//         }

//         let data;

//         try {
//           data = JSON.parse(stdout);
//         } catch {
//           resolve(
//             new Response(
//               JSON.stringify({ error: "Invalid JSON from yt-dlp" }),
//               { status: 500 }
//             )
//           );
//           return;
//         }

//         const formats = data.formats || [];

//         const video = [];
//         const videoOnly = [];
//         const audio = [];

//         // ------------------------
//         // First pass: classify
//         // ------------------------

//         for (const f of formats) {

//           const size = f.filesize || f.filesize_approx || 0;

//           const obj = {
//             id: f.format_id,
//             ext: f.ext,
//             resolution: f.height ? `${f.height}p` : null,
//             height: f.height || 0,
//             fps: f.fps || 0,
//             size,
//             vcodec: f.vcodec,
//             acodec: f.acodec,
//             abr: f.abr || null
//           };

//           if (f.vcodec !== "none" && f.acodec !== "none") {
//             video.push(obj);
//           }

//           else if (f.vcodec !== "none" && f.acodec === "none") {
//             videoOnly.push(obj);
//           }

//           else if (f.acodec !== "none" && f.vcodec === "none") {
//             audio.push(obj);
//           }
//         }

//         // ------------------------
//         // Find best audio
//         // ------------------------

//         const bestAudio = [...audio].sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

//         const bestAudioSize = bestAudio?.size || 0;

//         // ------------------------
//         // Fix videoOnly size
//         // ------------------------

//         const videoOnlyMerged = videoOnly.map(v => ({
//           ...v,
//           size: (v.size || 0) + bestAudioSize
//         }));

//         // ------------------------
//         // Sort formats
//         // ------------------------

//         video.sort((a, b) => b.height - a.height);

//         videoOnlyMerged.sort((a, b) => b.height - a.height);

//         audio.sort((a, b) => (b.abr || 0) - (a.abr || 0));

//         // ------------------------
//         // Return response
//         // ------------------------

//         resolve(
//           new Response(
//             JSON.stringify({
//               metadata: {
//                 title: data.title,
//                 thumbnail: data.thumbnail,
//                 duration: data.duration,
//                 channel: data.uploader,
//                 views: data.view_count,
//                 uploadDate: data.upload_date
//               },
//               formats: {
//                 video,
//                 videoOnly: videoOnlyMerged,
//                 audio
//               }
//             }),
//             { status: 200 }
//           )
//         );

//       }
//     );
//   });
// }