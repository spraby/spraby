import {ImageResponse} from "next/og";
import {SITE_DESCRIPTION} from "@/lib/config";

export const runtime = "edge";
export const alt = "spraby — маркетплейс изделий ручной работы";
export const size = {
  width: 1200,
  height: 630,
};

const FONT_BOLD_URL = "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-cyrillic-800-normal.woff";
const FONT_MEDIUM_URL = "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-cyrillic-500-normal.woff";

const logoPath = "M268.09,139.3c2.4,39.09-19.92,76-56.2,95.93-31.29,17.23-70.79,19.46-103,2.64-35.4-18.52-56.67-57.43-45-94.29,10.49-32.94,45.53-59.66,84-53.8,16.58,2.58,32,10.84,42,23.44,14.35,18.23,17.63,41.9,4,61.3-4.1,5.68-11.49,10.66-18.4,13.18-13.07,4.87-33.05,2.7-45.3-8.38-4.51-4.1-8.09-12-7.27-18.34v-.06c.94-10.9,9.85-10.84,11.84-2.87a22.18,22.18,0,0,0,1.58,4.28A27.63,27.63,0,0,0,158.8,178.5c17.58,1.76,33-11.66,35.1-27.25,2.11-15.94-8.09-33-21.39-42.66-13.71-10-32.64-14-49.52-9-17.17,5-32.81,16.17-42.07,30.41-10.08,15.47-11.78,36.86-6.33,54,11.19,35.4,52.51,58.14,91.53,55.26,36.45-2.75,68.8-25.66,82.34-56.72,13.36-30.65,7.79-67.69-12.07-94.88-23.15-31.76-62.82-50.51-104-49.28C92.58,39.62,60.29,49.76,32.86,83.63,22.14,96.87,10,116,5.44,132.09c-8.62,30.42,14.47,46.41,26.08,9.67C37,124.47,44.7,107.24,57.65,93.41c27-28.89,69.21-39.67,109.06-29.53,32.17,8.2,56.55,30.94,65,60.77,7.67,27.19.76,58-22.39,77-24.79,20.45-60.77,24.61-89,7.56-14.24-8.61-25.19-22.33-27.36-38.15-2-15.29,2.58-30.65,14.82-41.25,10.14-8.85,24.32-13.36,38.39-10,13.71,3.22,24,12.3,26.78,25.08,2.93,13.83-13.89,22.09-18,8-1.82-6.22-4.75-12.25-9.26-16.24-4.34-3.75-8.32-4.86-14.24-4.51-15.29.94-26.9,17.52-26.25,30.94.82,17.17,8.61,26.31,20.92,34.58,27,18.16,66.1,10.31,84.21-14.89-.18.06-.3.06-.47.12a5.11,5.11,0,0,1,.35-.59,2.9,2.9,0,0,1,.18.53c16.17-25.9,15.7-57.31-4.11-81.51-15.11-18.46-37.85-29.54-62.76-31.41-48-3.58-90.65,31.46-101.09,73.36-11.31,45.25,16,92.89,60.54,113.52,41,18.92,90.3,18.57,127.63-5.57,39.09-25.26,69.45-72.32,64.29-116.44C292.18,112.46,266.74,116.68,268.09,139.3Z";

export default async function OpenGraphImage() {
  const [boldFont, mediumFont] = await Promise.all([
    fetch(FONT_BOLD_URL).then((res) => res.arrayBuffer()),
    fetch(FONT_MEDIUM_URL).then((res) => res.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#ffffff",
          display: "flex",
          fontFamily: "Inter",
          height: "100%",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #f6f1ff 0%, #ffffff 44%, #fff7ed 100%)",
            inset: 0,
            position: "absolute",
          }}
        />
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: 52,
            position: "relative",
          }}
        >
          <svg width="238" height="189" viewBox="0 0 291.95 231.91">
            <path fill="#111111" d={logoPath} transform="translate(-3.56 -38.33)"/>
          </svg>
          <div style={{display: "flex", flexDirection: "column", gap: 18}}>
            <div
              style={{
                color: "#111111",
                fontSize: 112,
                fontWeight: 800,
                letterSpacing: 0,
                lineHeight: 0.95,
              }}
            >
              spraby
            </div>
            <div
              style={{
                color: "#6b7280",
                fontSize: 34,
                fontWeight: 500,
                letterSpacing: 0,
                lineHeight: 1.25,
                maxWidth: 610,
              }}
            >
              {SITE_DESCRIPTION.replace(/^spraby\s—\s/, "").replace(/\.$/, "")}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {name: "Inter", data: boldFont, weight: 800, style: "normal"},
        {name: "Inter", data: mediumFont, weight: 500, style: "normal"},
      ],
    }
  );
}
