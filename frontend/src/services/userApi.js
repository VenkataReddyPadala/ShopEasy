import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api/v1",
    credentials: "include",
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // 1. Authenticate & Session Mutations
    signup: builder.mutation({
      query: (userData) => ({
        url: "/users/signup",
        method: "POST",
        body: userData,
      }),
      // Invalidates both individual states and admin lists upon a new user setup
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    login: builder.mutation({
      query: (credentials) => ({
        url: "/users/login",
        method: "POST",
        body: credentials,
      }),
      // Target specific cache invalidation rather than hitting the broad global tag
      invalidatesTags: [
        { type: "User", id: "ME" },
        { type: "User", id: "LIST" },
      ],
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/users/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({ type: "GLOBAL_LOGOUT" });
        } catch (err) {
          console.error(err);
        }
      },
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    // 2. Profile Details Queries & Mutations
    getMe: builder.query({
      query: () => "/users/me",
      providesTags: [{ type: "User", id: "ME" }],
    }),

    updateMe: builder.mutation({
      query: (userData) => ({
        url: "/users/updateMe",
        method: "PATCH",
        body: userData,
      }),
      async onQueryStarted(userData, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          userApi.util.updateQueryData("getMe", undefined, (draft) => {
            if (draft?.data?.user) {
              let optimisticAvatar = draft.data.user.avatar;

              if (userData.avatar && userData.avatar.startsWith("data:image")) {
                optimisticAvatar = {
                  ...draft.data.user.avatar,
                  url: userData.avatar,
                };
              } else if (userData.avatar === "") {
                optimisticAvatar = {
                  public_id: "temp",
                  url: "/images/default-avatar.jpg",
                };
              }

              if (userData.name) draft.data.user.name = userData.name;
              if (userData.email) draft.data.user.email = userData.email;

              draft.data.user.avatar = optimisticAvatar;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch (err) {
          console.error(err);
          patchResult.undo();
        }
      },
      // Safely invalidates only the current user profile cache and general list view
      invalidatesTags: (result) => [
        { type: "User", id: "ME" },
        { type: "User", id: result?.data?.user?._id || "LIST" },
      ],
    }),

    // 3. Password Management Mutations
    updateMyPassword: builder.mutation({
      query: (credentials) => ({
        url: "users/updateMyPassword",
        method: "PATCH",
        body: credentials,
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "users/forgotPassword",
        method: "POST",
        body: email,
      }),
      // No tags invalidated here; this is a stateless email-sending dispatch
    }),

    resetPassword: builder.mutation({
      query: ({ token, passwordData }) => ({
        url: `/users/resetPassword/${token}`,
        method: "POST",
        body: passwordData,
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    // 4. Address Mutations (Explicitly targets "ME" to avoid refetching Admin panels)
    addAddress: builder.mutation({
      query: (address) => ({
        url: "/users/address",
        method: "POST",
        body: address,
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    deleteAddress: builder.mutation({
      query: (addressId) => ({
        url: `/users/address/${addressId}`,
        method: "DELETE",
      }),
      async onQueryStarted(addressId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          userApi.util.updateQueryData("getMe", undefined, (draft) => {
            const index = draft?.data?.addresses?.findIndex(
              (addr) => addr._id === addressId
            );
            if (index !== -1 && index !== undefined) {
              draft.data.addresses.splice(index, 1);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    updateAddress: builder.mutation({
      query: ({ addressId, updatedAddress }) => ({
        url: `/users/address/${addressId}`,
        method: "PATCH",
        body: updatedAddress,
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    setDefaultAddress: builder.mutation({
      query: (addressId) => ({
        url: `/users/address/${addressId}/default`,
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    // 5. Admin Dashboard Queries & Mutations
    getUsers: builder.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.append("search", params.search);
        if (params?.limit)
          searchParams.append("limit", params.limit.toString());
        if (params?.page) searchParams.append("page", params.page.toString());

        return {
          url: "/users",
          method: "GET",
          params: Object.fromEntries(searchParams),
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id, _id }) => ({
                type: "User",
                id: id || _id,
              })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    updateUserRole: builder.mutation({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
        { type: "User", id: "ME" }, // If an admin accidentally demotes/promotes themselves
      ],
    }),
  }),
});

export const {
  useGetMeQuery,
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useUpdateMeMutation,
  useUpdateMyPasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useAddAddressMutation,
  useDeleteAddressMutation,
  useUpdateAddressMutation,
  useSetDefaultAddressMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserRoleMutation,
} = userApi;
