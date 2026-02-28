import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KidBuild Studio",
    short_name: "KidBuild",
    description: "Safe template-guided learning maker app for kids",
    start_url: "/",
    display: "standalone",
    background_color: "#f0f7ff",
    theme_color: "#5c8dff",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml"
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml"
      }
    ]
  };
}
