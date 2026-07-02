import { useCallback, useEffect, useState } from "react";

interface LocalUser {
  name: string;
  role?: string;
}

const STORAGE_KEY = "atlas_local_user";

function readUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    return null;
  }
}

/**
 * Local-only auth shim. The original app used an external OAuth provider; this
 * version keeps a lightweight profile in localStorage so the game stays fully
 * self-contained (progress is saved locally).
 */
export function useAuth() {
  const [user, setUser] = useState<LocalUser | null>(null);

  useEffect(() => {
    setUser(readUser());
  }, []);

  const login = useCallback(() => {
    const name =
      (typeof window !== "undefined"
        ? window.prompt("Enter your investor name", "Investor")
        : null) || "Investor";
    const next: LocalUser = { name };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setUser(next);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return {
    user,
    isLoading: false,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    logout,
  };
}
