import { useNavigate as useTanstackNavigate } from "@tanstack/react-router";

/**
 * Adapter that mirrors the react-router `useNavigate()` string signature on top
 * of TanStack Router, so ported screens can keep calling `navigate("/game")`.
 */
export function useNavigate() {
  const navigate = useTanstackNavigate();
  return (to: string) => navigate({ to });
}
