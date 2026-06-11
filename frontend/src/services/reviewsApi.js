import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const reviewsApi = createApi({
  reducerPath: "reviewsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api/v1",
    // prepareHeaders: (headers) => {
    //   headers.set("Accept", "application/json");
    //   return headers;
    // },
    credentials: "include",
  }),
  tagTypes: ["Reviews", "MyReview"],
  endpoints: (builder) => ({
    getMyReview: builder.query({
      query: (productId) => `/products/${productId}/reviews/my-review`,
      providesTags: (result, error, productId) => [
        { type: "MyReview", id: productId },
      ],
    }),
    getAllReviews: builder.query({
      query: ({ productId, limit, page = 1 }) =>
        `/products/${productId}/reviews?limit=${limit}&page=${page}`,
      providesTags: (result, error, { productId }) => [
        { type: "Reviews", id: productId },
      ],
    }),
    createReview: builder.mutation({
      query: ({ productId, reviewData }) => ({
        url: `/products/${productId}/reviews`,
        method: "POST",
        body: reviewData,
      }),
      // Automatically refetches both the list and individual status for this specific product
      invalidatesTags: (result, error, { productId }) => [
        { type: "Reviews", id: productId },
        { type: "MyReview", id: productId },
      ],
    }),
    updateReview: builder.mutation({
      query: ({ productId, reviewId: id, reviewData }) => ({
        url: `/products/${productId}/reviews/${id}`,
        method: "PATCH",
        body: reviewData,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Reviews", id: productId },
        { type: "MyReview", id: productId },
      ],
    }),
    deleteReview: builder.mutation({
      query: ({ productId, reviewId: id }) => ({
        url: `/products/${productId}/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Reviews", id: productId },
        { type: "MyReview", id: productId },
      ],
    }),
  }),
});

export const {
  useGetMyReviewQuery,
  useLazyGetAllReviewsQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useUpdateReviewMutation,
} = reviewsApi;
