// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// // import { toast } from "react-toastify";

// export const userApi = createApi({
//   reducerPath: "userApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: "http://localhost:8000/api/v1",
//     credentials: "include",
//   }),
//   tagTypes: ["User"],
//   endpoints: (builder) => ({
//     signup: builder.mutation({
//       query: (userData) => ({
//         url: "/users/signup",
//         method: "POST",
//         body: userData,
//       }),

//       invalidatesTags: ["User"],
//     }),

//     login: builder.mutation({
//       query: (credentials) => ({
//         url: "/users/login",
//         method: "POST",
//         body: credentials,
//       }),
//       invalidatesTags: ["User"],
//     }),

//     logout: builder.mutation({
//       query: () => ({
//         url: "/users/logout",
//         method: "POST",
//       }),
//       async onQueryStarted(arg, { dispatch, queryFulfilled }) {
//         try {
//           await queryFulfilled;
//           dispatch({ type: "GLOBAL_LOGOUT" });
//           // toast.success("Logged out successfully");
//         } catch (err) {
//           console.log(err);
//           // toast.error(err.error?.data?.message || "Logout failed");
//         }
//       },
//       invalidatesTags: ["User"],
//     }),

//     getMe: builder.query({
//       query: () => "/users/me",
//       providesTags: ["User"],
//     }),

//     // updateMe: builder.mutation({
//     //   query: (userData) => ({
//     //     url: "/users/updateMe",
//     //     method: "PATCH",
//     //     body: userData,
//     //   }),
//     //   async onQueryStarted(userData, { dispatch, queryFulfilled }) {
//     //     const patchResult = dispatch(
//     //       userApi.util.updateQueryData("getMe", undefined, (draft) => {
//     //         if (draft?.data?.user) {
//     //           Object.assign(draft.data.user, userData);
//     //         }
//     //       })
//     //     );
//     //     try {
//     //       await queryFulfilled;
//     //       // toast.success("Profile updated!");
//     //     } catch (err) {
//     //       patchResult.undo();
//     //       // toast.error(err.error?.data?.message || "Update failed");
//     //     }
//     //   },
//     //   invalidatesTags: ["User"],
//     // }),

//     updateMe: builder.mutation({
//       query: (userData) => ({
//         url: "/users/updateMe",
//         method: "PATCH",
//         body: userData,
//       }),
//       async onQueryStarted(userData, { dispatch, queryFulfilled }) {
//         const patchResult = dispatch(
//           userApi.util.updateQueryData("getMe", undefined, (draft) => {
//             if (draft?.data?.user) {
//               // 1. Logic for Avatar (Matches Controller)
//               let optimisticAvatar = draft.data.user.avatar;

//               if (userData.avatar && userData.avatar.startsWith("data:image")) {
//                 optimisticAvatar = {
//                   ...draft.data.user.avatar,
//                   url: userData.avatar, // Temporary base64 preview
//                 };
//               } else if (userData.avatar === "") {
//                 optimisticAvatar = {
//                   public_id: "temp",
//                   url: "/images/default-avatar.jpg",
//                 };
//               }

//               // 2. Apply updates (Only for fields the controller allows: name, email)
//               // This mimics your 'filteredObj' logic
//               if (userData.name) draft.data.user.name = userData.name;
//               if (userData.email) draft.data.user.email = userData.email;

//               // Apply the avatar update
//               draft.data.user.avatar = optimisticAvatar;
//             }
//           })
//         );
//         try {
//           await queryFulfilled;
//         } catch (err) {
//           console.log(err);
//           patchResult.undo();
//         }
//       },
//       invalidatesTags: ["User"],
//     }),

//     updateMyPassword: builder.mutation({
//       query: (credentials) => ({
//         url: "users/updateMyPassword",
//         method: "PATCH",
//         body: credentials,
//       }),
//       invalidatesTags: ["User"],
//     }),

//     forgotPassword: builder.mutation({
//       query: (email) => ({
//         url: "users/forgotPassword",
//         method: "POST",
//         body: email,
//       }),
//       invalidatesTags: ["User"],
//     }),

//     resetPassword: builder.mutation({
//       query: ({ token, passwordData }) => ({
//         url: `/users/resetPassword/${token}`,
//         method: "POST",
//         body: passwordData,
//       }),
//       invalidatesTags: ["User"],
//     }),

//     addAddress: builder.mutation({
//       query: (address) => ({
//         url: "/users/address",
//         method: "POST",
//         body: address,
//       }),
//       invalidatesTags: ["User"],
//     }),

//     deleteAddress: builder.mutation({
//       query: (addressId) => ({
//         url: `/users/address/${addressId}`,
//         method: "DELETE",
//       }),
//       // This is the key part:
//       async onQueryStarted(addressId, { dispatch, queryFulfilled }) {
//         // 1. Manually update the 'getMe' cache immediately
//         const patchResult = dispatch(
//           userApi.util.updateQueryData("getMe", undefined, (draft) => {
//             // Find the index and remove it from the draft state
//             const index = draft.data.addresses.findIndex(
//               (addr) => addr._id === addressId
//             );
//             if (index !== -1) draft.data.addresses.splice(index, 1);
//           })
//         );
//         try {
//           await queryFulfilled;
//         } catch {
//           // 2. If the delete fails on the server, roll back the cache change
//           patchResult.undo();
//         }
//       },
//       invalidatesTags: ["User"],
//     }),

//     updateAddress: builder.mutation({
//       query: ({ addressId, updatedAddress }) => ({
//         url: `/users/address/${addressId}`,
//         method: "PATCH",
//         body: updatedAddress,
//       }),
//       invalidatesTags: ["User"],
//     }),

//     setDefaultAddress: builder.mutation({
//       query: (addressId) => ({
//         url: `/users/address/${addressId}/default`,
//         method: "PATCH",
//       }),
//       invalidatesTags: ["User"],
//     }),

//     getUsers: builder.query({
//       query: (params) => {
//         const searchParams = new URLSearchParams();

//         // Append typical user management filters if they exist
//         if (params?.search) searchParams.append("search", params.search);
//         if (params?.limit)
//           searchParams.append("limit", params.limit.toString());
//         if (params?.page) searchParams.append("page", params.page.toString());

//         return {
//           url: "/users",
//           method: "GET",
//           params: Object.fromEntries(searchParams),
//         };
//       },
//       providesTags: (result) => {
//         // Assuming your API response structure matches getProducts (e.g., result.data)
//         return result?.data
//           ? [
//               ...result.data.map(({ id, _id }) => ({
//                 type: "User",
//                 id: id || _id,
//               })),
//               { type: "User", id: "LIST" },
//             ]
//           : [{ type: "User", id: "LIST" }];
//       },
//     }),

//     deleteUser: builder.mutation({
//       query: (id) => ({
//         url: `/users/${id}`,
//         method: "DELETE",
//       }),
//       invalidatesTags: (result, error, id) => [
//         { type: "User", id },
//         { type: "User", id: "LIST" },
//       ],
//     }),

//     updateUserRole: builder.mutation({
//       query: ({ id, body }) => ({
//         url: `/users/${id}`,
//         method: "PATCH",
//         body,
//       }),
//       invalidatesTags: (result, error, { id }) => [
//         { type: "User", id },
//         { type: "User", id: "LIST" },
//       ],
//     }),
//   }),
// });

// export const {
//   useGetMeQuery,
//   useSignupMutation,
//   useLoginMutation,
//   useLogoutMutation,
//   useUpdateMeMutation,
//   useUpdateMyPasswordMutation,
//   useForgotPasswordMutation,
//   useResetPasswordMutation,
//   useAddAddressMutation,
//   useDeleteAddressMutation,
//   useUpdateAddressMutation,
//   useSetDefaultAddressMutation,
//   useGetUsersQuery,
//   useDeleteUserMutation,
//   useUpdateUserRoleMutation,
// } = userApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api/v1",
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
