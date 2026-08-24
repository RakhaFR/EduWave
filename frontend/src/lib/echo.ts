import Echo from "laravel-echo";
import Pusher from "pusher-js";

let echo: Echo<"reverb"> | null = null;

export function getEcho() {
  if (typeof window === "undefined") return null;
  if (echo) return echo;

  const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
  const host = process.env.NEXT_PUBLIC_REVERB_HOST;
  if (!key || !host) return null;

  (window as Window & { Pusher?: typeof Pusher }).Pusher = Pusher;
  echo = new Echo({
    broadcaster: "reverb",
    key,
    wsHost: host,
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT || 443),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT || 443),
    forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME !== "http",
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/v1\/?$/, "")}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        Accept: "application/json",
      },
    },
  });
  return echo;
}

export function disconnectEcho() {
  echo?.disconnect();
  echo = null;
}
