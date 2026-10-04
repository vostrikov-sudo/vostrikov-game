import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteChrome } from "@/components/site-chrome";
import "../styles.css";

const APP_NAME = "Vostrikov Game";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#0c0d10" },
      {
        name: "description",
        content: "Раннер и сражение: двор школы, танки, дроны, профиль героя.",
      },
    ],
    links: [
      // Keep SSR styled in dev without traversing Tailwind's watched files.
      // Production CSS links are emitted by the build manifest.
      ...(import.meta.env.DEV
        ? [{ rel: "stylesheet", href: `${import.meta.env.BASE_URL}src/styles.css?direct` }]
        : []),
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Unbounded:wght@500;600&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-bg text-fg antialiased">
        <PreviewHostBridge />
        <AuthProvider>
          <SiteChrome>
            <Outlet />
          </SiteChrome>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
