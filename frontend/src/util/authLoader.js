import { redirect } from "react-router-dom";
import store from "../app/store.js";
import { userApi } from "../services/userApi";

// export const authLoader = async ({ request }) => {
//   const url = new URL(request.url);

//   const result = await store.dispatch(
//     userApi.endpoints.getMe.initiate(undefined, { forceRefetch: false })
//   );

//   const { data } = result;
//   const isAuthenticated = data?.status === "success";

//   if (!isAuthenticated) {
//     const params = new URLSearchParams();
//     params.set("from", url.pathname);

//     return redirect(`/login?${params.toString()}`);
//   }
//   return data?.data || null;
// };

export const authLoader = async ({ request }) => {
  const url = new URL(request.url);
  const state = store.getState();

  // ✅ Check RTK Query cache first — no network call if already fetched
  const cachedResult = userApi.endpoints.getMe.select()(state);

  let data = cachedResult?.data;

  // Only fetch if cache is genuinely empty
  if (!data) {
    const result = await store.dispatch(
      userApi.endpoints.getMe.initiate(undefined, { forceRefetch: false })
    );
    data = result?.data;
  }

  const isAuthenticated = data?.status === "success";

  if (!isAuthenticated) {
    const params = new URLSearchParams();
    params.set("from", url.pathname);
    return redirect(`/login?${params.toString()}`);
  }

  return data?.data || null;
};
