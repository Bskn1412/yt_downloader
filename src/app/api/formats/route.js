import { execFile } from "child_process";

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({
          error: "URL is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // ✅ HF/Linux compatible
    const data = await new Promise((resolve, reject) => {
      execFile(
      "yt-dlp",
      [
        "-J",

        "--cookies",
        "/app/cookies.txt",
        "--geo-bypass",

        "--no-playlist",

        "--no-warnings",

        "--extractor-args",
        "youtube:player_client=android,web",

        url,
      ],
        (error, stdout, stderr) => {
          if (error) {
            console.error(stderr);

            reject(error);
            return;
          }

          try {
            resolve(JSON.parse(stdout));
          } catch (e) {
            reject(e);
          }
        }
      );
    });

    const formats = data.formats || [];

    const video = [];
    const videoOnly = [];
    const audio = [];

    // classify formats
    for (const f of formats) {
      const size =
        f.filesize ||
        f.filesize_approx ||
        0;

      const obj = {
        id: f.format_id,

        ext: f.ext,

        resolution: f.height
          ? `${f.height}p`
          : null,

        height: f.height || 0,

        fps: f.fps || 0,

        size,

        vcodec: f.vcodec,

        acodec: f.acodec,

        abr: f.abr || null,
      };

      // video + audio
      if (
        f.vcodec !== "none" &&
        f.acodec !== "none"
      ) {
        video.push(obj);
      }

      // video only
      else if (
        f.vcodec !== "none" &&
        f.acodec === "none"
      ) {
        videoOnly.push(obj);
      }

      // audio only
      else if (
        f.acodec !== "none" &&
        f.vcodec === "none"
      ) {
        audio.push(obj);
      }
    }

    // best audio for merged size estimation
    const bestAudio = [...audio].sort(
      (a, b) =>
        (b.abr || 0) -
        (a.abr || 0)
    )[0];

    const bestAudioSize =
      bestAudio?.size || 0;

    // estimate merged video size
    const videoOnlyMerged =
      videoOnly.map((v) => ({
        ...v,
        size:
          (v.size || 0) +
          bestAudioSize,
      }));

    // sorting
    video.sort(
      (a, b) =>
        (b.height || 0) -
        (a.height || 0)
    );

    videoOnlyMerged.sort(
      (a, b) =>
        (b.height || 0) -
        (a.height || 0)
    );

    audio.sort(
      (a, b) =>
        (b.abr || 0) -
        (a.abr || 0)
    );

    return new Response(
      JSON.stringify({
        metadata: {
          title: data.title,

          thumbnail: data.thumbnail,

          duration: data.duration,

          channel: data.uploader,

          views: data.view_count,

          uploadDate:
            data.upload_date,
        },

        formats: {
          video,

          videoOnly:
            videoOnlyMerged,

          audio,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "YT-DLP FORMATS ERROR:"
    );

    console.error(error);

    return new Response(
      JSON.stringify({
        error:
          error?.message ||
          "Failed to extract info",
      }),
      {
        status: 500,
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );
  }
}
