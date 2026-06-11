import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api/v1",
    credentials: "include",
  }),
  tagTypes: ["Payment", "Cart"],
  endpoints: (builder) => ({
    processPayment: builder.mutation({
      query: (orderData) => ({
        url: "/payments/process",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Payment"],
    }),
    getKey: builder.query({
      query: () => "/payments/getKey",
    }),
    verifyPayment: builder.mutation({
      query: (paymentDetails) => ({
        url: "/payments/verify", // This will be your verification route on backend
        method: "POST",
        body: paymentDetails,
      }),
      invalidatesTags: ["Payment", "Cart"],
    }),
  }),
});

export const {
  useProcessPaymentMutation,
  useGetKeyQuery,
  useVerifyPaymentMutation,
} = paymentApi;
