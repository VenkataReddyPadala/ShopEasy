import { redirect } from "react-router-dom";
import store from "../app/store.js";
import { userApi } from "../services/userApi";

export const authLoader = async ({ request }) => {
  const url = new URL(request.url);

  const result = await store.dispatch(
    userApi.endpoints.getMe.initiate(undefined, { forceRefetch: false })
  );

  const { data } = result;
  const isAuthenticated = data?.status === "success";

  if (!isAuthenticated) {
    const params = new URLSearchParams();
    params.set("from", url.pathname);

    return redirect(`/login?${params.toString()}`);
  }
  return data?.data || null;
};
