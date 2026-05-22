import { execFile } from "child_process";

export async function GET() {
  return new Promise((resolve) => {

    execFile(
      "yt-dlp",
      ["--version"],
      (error, stdout, stderr) => {

        if (error) {
          resolve(
            Response.json({
              success: false,
              error: error.message,
              stderr,
            })
          );

          return;
        }

        resolve(
          Response.json({
            success: true,
            version: stdout.trim(),
          })
        );
      }
    );

  });
}