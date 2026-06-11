import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api/v1",    credentials: "include",
  }),
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    // 1. GET ALL PRODUCTS
    // 1. GET ALL PRODUCTS
    // getProducts: builder.query({
    //   query: (params) => {
    //     // Force clean conversion of the object into standard query strings
    //     const searchParams = new URLSearchParams();

    //     if (params.category) searchParams.append("category", params.category);
    //     if (params.search) searchParams.append("search", params.search);
    //     if (params.limit) searchParams.append("limit", params.limit.toString());
    //     if (params.page) searchParams.append("page", params.page.toString());
    //     return {
    //       url: "/products",
    //       method: "GET",
    //       params: Object.fromEntries(searchParams), // Ensures a flat, clean object layout
    //     };
    //   },
    //   providesTags: (result) =>
    //     result?.data
    //       ? [
    //           ...result.data.map(({ id, _id }) => ({
    //             type: "Products",
    //             id: id || _id,
    //           })),
    //           { type: "Products", id: "LIST" },
    //         ]
    //       : [{ type: "Products", id: "LIST" }],
    // }),
    // 1. GET ALL PRODUCTS
    getProducts: builder.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.category) searchParams.append("category", params.category);
        if (params?.search) searchParams.append("search", params.search);
        if (params?.limit)
          searchParams.append("limit", params.limit.toString());
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.sort) searchParams.append("sort", params.sort);

        return {
          url: "/products",
          method: "GET",
          params: Object.fromEntries(searchParams),
        };
      },
      providesTags: (result) => {
        return result?.data
          ? [
              ...result.data.map(({ id, _id }) => ({
                type: "Products",
                id: id || _id,
              })),
              { type: "Products", id: "LIST" },
            ]
          : [{ type: "Products", id: "LIST" }];
      },
    }),

    getProductCategories: builder.query({
      query: () => "/products/categories",
    }),

    // 2. GET SINGLE PRODUCT
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Products", id }],
      // async onQueryStarted(arg, { queryFulfilled }) {
      //   try {
      //     await queryFulfilled;
      //   } catch (err) {
      //     toast.error(err.error?.data.message || "Product not found.");
      //   }
      // },
    }),

    // 3. UPDATE PRODUCT (Admin Only)
    // updateProduct: builder.mutation({
    //   query: ({ id, ...formData }) => ({
    //     url: `/products/${id}`,
    //     method: "PATCH",
    //     body: formData,
    //   }),
    //   async onQueryStarted({ id, ...formData }, { dispatch, queryFulfilled }) {
    //     const patchResult = dispatch(
    //       productsApi.util.updateQueryData("getProduct", id, (draft) => {
    //         if (draft) Object.assign(draft, formData);
    //       })
    //     );
    //     try {
    //       await queryFulfilled;
    //       // toast.success("Product updated successfully!");
    //     } catch (err) {
    //       console.log(err);
    //       patchResult.undo();
    //       // const errorMsg = err.error?.data.message || "Update failed.";
    //       // toast.error(errorMsg);
    //     }
    //   },
    //   invalidatesTags: (result, error, { id }) => [{ type: "Products", id }],
    // }),

    // 3. UPDATE PRODUCT (Admin Only)
    // updateProduct: builder.mutation({
    //   // FIX: Destructure id and body correctly from your payload arguments
    //   query: ({ id, body }) => ({
    //     url: `/products/${id}`,
    //     method: "PATCH",
    //     body: body, // Sends the FormData stream cleanly
    //   }),
    //   async onQueryStarted({ id, body }, { dispatch, queryFulfilled }) {
    //     // Safely parse out standard text data from FormData entries for a safe optimistic update
    //     const patchData = {};
    //     if (body && typeof body.entries === "function") {
    //       for (let [key, value] of body.entries()) {
    //         // Do not copy binary files over to state cache manually
    //         if (!(value instanceof File)) {
    //           patchData[key] = value;
    //         }
    //       }
    //     }

    //     const patchResult = dispatch(
    //       productsApi.util.updateQueryData("getProduct", id, (draft) => {
    //         if (draft) {
    //           Object.assign(draft, patchData);
    //         }
    //       })
    //     );
    //     try {
    //       await queryFulfilled;
    //     } catch (err) {
    //       console.error(err);
    //       patchResult.undo();
    //     }
    //   },
    //   // Invalidate list view cache tags to trigger background screen updates smoothly
    //   invalidatesTags: (result, error, { id }) => [
    //     { type: "Products", id },
    //     { type: "Products", id: "LIST" },
    //   ],
    // }),
    // 3. UPDATE PRODUCT (Admin Only)
    updateProduct: builder.mutation({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body: body, // Pass the raw FormData directly here
      }),
      async onQueryStarted({ id, body }, { dispatch, queryFulfilled }) {
        // 1. Create a safe plain object for the optimistic cache update
        const patchData = {};
        if (body && typeof body.entries === "function") {
          for (let [key, value] of body.entries()) {
            if (!(value instanceof File) && key !== "imagesOrder") {
              patchData[key] = value;
            }
          }
        }

        // 2. Apply the optimistic update to GET SINGLE PRODUCT view
        const patchResultSingle = dispatch(
          productsApi.util.updateQueryData("getProduct", id, (draft) => {
            if (draft) Object.assign(draft, patchData);
          })
        );

        // 3. Apply the optimistic update to GET ALL PRODUCTS list view
        const patchResultList = dispatch(
          productsApi.util.updateQueryData(
            "getProducts",
            undefined,
            (draft) => {
              if (draft && draft.data) {
                const product = draft.data.find((p) => (p._id || p.id) === id);
                if (product) Object.assign(product, patchData);
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch (err) {
          console.error("Optimistic update failed, rolling back:", err);
          patchResultSingle.undo();
          patchResultList.undo();
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Products", id },
        { type: "Products", id: "LIST" },
      ],
    }),

    // 4. DELETE PRODUCT (Admin Only)
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Products", id },
        { type: "Products", id: "LIST" },
      ],
    }),

    // 5. CREATE PRODUCT (Admin Only)
    createProduct: builder.mutation({
      query: (newProduct) => ({
        url: "/products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateProductMutation,
  useGetProductCategoriesQuery,
} = productsApi;
