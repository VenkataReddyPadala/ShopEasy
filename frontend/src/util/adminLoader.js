import { redirect } from "react-router-dom";
import { authLoader } from "./authLoader";

export const adminLoader = async ({ request }) => {
  // 1. Run the standard auth check.
  // If they aren't logged in, authLoader automatically sends them to /login
  const user = await authLoader({ request });

  if (user instanceof Response) {
    return user;
  }

  const isAdmin = user?.role === "admin";

  if (!isAdmin) {
    return redirect("/");
  }

  return user;
};
