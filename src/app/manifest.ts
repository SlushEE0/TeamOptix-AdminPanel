import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OptixToolkit",
    short_name: "Toolkit",
    description: "Optix Hours Management System",
    start_url: "/toolkit",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/favicon/favicon.ico",
        sizes: "512x512",
        type: "image/x-icon"
      }
    ]
  };
}
