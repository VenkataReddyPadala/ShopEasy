import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api/v1",
    credentials: "include",
  }),
  tagTypes: ["Orders", "DashboardStats"],
  endpoints: (builder) => ({
    // 1. Get All My Orders (Infinite Scroll - User Specific)
    getMyOrders: builder.query({
      query: (page = 1) => `/orders/me?page=${page}&limit=5`,
      providesTags: [{ type: "Orders", id: "ME_LIST" }],
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg }) => {
        if (arg === 1) return newItems;
        const existingData = currentCache?.data || [];
        const incomingData = newItems?.data || [];
        return {
          ...newItems,
          data: [...existingData, ...incomingData],
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),

    // getMyOrders: builder.query({
    //   query: ({ page = 1, limit = 5 } = {}) =>
    //     `/orders/me?page=${page}&limit=${limit}`,

    //   providesTags: [{ type: "Orders", id: "ME_LIST" }],
    // }),
    // 2. Get Single Order Details (User/Admin shared view)
    getOrder: builder.query({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: (result, error, orderId) => [
        { type: "Orders", id: orderId },
      ],
      transformResponse: (response) => response.data,
    }),

    // 3. Cancel an Order Item (User Action)
    cancelOrderItem: builder.mutation({
      query: ({ orderId, itemId }) => ({
        url: `/orders/${orderId}/items/${itemId}/cancel`,
        method: "PATCH",
      }),
      // Invalidates the specific single order data and resets the respective timeline lists
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Orders", id: orderId },
        { type: "Orders", id: "ME_LIST" },
        { type: "Orders", id: "ADMIN_LIST" },
      ],
    }),

    // 4. Cancel Whole Order (User Action)
    cancelOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, orderId) => [
        { type: "Orders", id: orderId },
        { type: "Orders", id: "ME_LIST" },
        { type: "Orders", id: "ADMIN_LIST" },
      ],
    }),

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    // 5. Get All System Orders (Infinite Scroll - Admin Exclusive Panel)
    // getAllOrders: builder.query({
    //   query: ({ page = 1, limit = 5 } = {}) =>
    //     `/orders?page=${page}&limit=${limit}`,
    //   providesTags: [{ type: "Orders", id: "ADMIN_LIST" }],
    //   serializeQueryArgs: ({ endpointName }) => endpointName,
    //   merge: (currentCache, newItems, { arg }) => {
    //     if (arg === 1) return newItems;
    //     const existingData = currentCache?.data || [];
    //     const incomingData = newItems?.data || [];
    //     return {
    //       ...newItems,
    //       data: [...existingData, ...incomingData],
    //     };
    //   },
    //   forceRefetch({ currentArg, previousArg }) {
    //     return currentArg !== previousArg;
    //   },
    // }),

    getAllOrderItems: builder.query({
      query: ({ page = 1, limit = 5 } = {}) =>
        `/orders/order-items?page=${page}&limit=${limit}`,

      providesTags: [{ type: "Orders", id: "ADMIN_LIST" }],
    }),

    // 6. Update Order Item Status (Admin Management Action)
    updateOrderItemStatus: builder.mutation({
      query: ({ orderId, itemId, status }) => ({
        url: `/orders/${orderId}/items/${itemId}/status`,
        method: "PATCH",
        body: { status },
      }),
      // Explicitly invalidates the exact modified data points
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Orders", id: orderId },
        { type: "Orders", id: "ME_LIST" },
        { type: "Orders", id: "ADMIN_LIST" },
      ],
    }),

    // Inside your frontend RTK API slice configurations
    getDashboardStats: builder.query({
      query: () => ({
        url: "/orders/dashboard-stats", // Appends cleanly to base "/api/v1"
        method: "GET",
      }),
      providesTags: ["DashboardStats"],
    }),
  }),
});

export const {
  useGetMyOrdersQuery,
  useGetOrderQuery,
  useCancelOrderItemMutation,
  useCancelOrderMutation,
  // Admin Hooks
  useGetAllOrdersQuery,
  useGetAllOrderItemsQuery,
  useUpdateOrderItemStatusMutation,
  useGetDashboardStatsQuery,
} = ordersApi;
