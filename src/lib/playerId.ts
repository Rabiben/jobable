const PLAYER_ID_KEY = "atlas_player_id";

/**
 * Stable per-browser identifier used to upsert this player's results on the
 * server (so repeated submissions update one row instead of duplicating).
 */
export function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(PLAYER_ID_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `p_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(PLAYER_ID_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}
