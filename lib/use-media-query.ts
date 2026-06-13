import { useSyncExternalStore } from "react";

function subscribe(query: string, callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => window.matchMedia(query).matches,
    () => false,
  );
}
