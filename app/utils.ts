import { useMatches } from "@remix-run/react";
import { useMemo } from "react";
import { User } from "./services/auth.server";

export function useMatchesData (
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  console.log(matchingRoutes);
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );


  return route?.data as Record<string, unknown>;
}

function isUser(user: unknown): user is User {
  return  user != null && typeof user === "object" && typeof (<User>user).email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  console.log("useOptionalUser: ", data);
  if (!data || !isUser(data)) {
    return undefined;
  }
  return data;
}