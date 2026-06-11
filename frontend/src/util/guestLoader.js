import { redirect } from "react-router-dom";
import store from "../app/store.js";
import { userApi } from "../services/userApi";

export const guestLoader = async ({ request }) => {
  const result = await store.dispatch(
    userApi.endpoints.getMe.initiate(undefined, { forceRefetch: false })
  );

  const isAuthenticated = result.data?.status === "success";

  if (isAuthenticated) {
    const referrer = request.headers.get("Referer");

    if (referrer) {
      const referrerUrl = new URL(referrer);
      const currentHost = new URL(request.url).host;

      // 2. Only redirect back if the user came from our own site
      // This prevents redirecting them back to Google or a random site
      const blacklist = ["/login", "/signup"];
      if (
        referrerUrl.host === currentHost &&
        !blacklist.includes(referrerUrl.pathname)
      ) {
        return redirect(referrerUrl.pathname);
      }
    }

    // 3. Fallback to homepage if no referrer or external referrer
    return redirect("/");
  }

  return null;
};
