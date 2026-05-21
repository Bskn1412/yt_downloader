import ytdlp from "yt-dlp-exec";

export async function GET() {
  try {

    const version = await ytdlp("--version");

    return Response.json({
      success: true,
      version
    });

  } catch (e) {

    console.error(e);

    return Response.json({
      success: false,
      error: e.message
    });
  }
}
