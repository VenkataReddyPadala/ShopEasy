import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const geoApi = createApi({
  reducerPath: "geoApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://countriesnow.space/api/v0.1/countries/",
  }),
  endpoints: (builder) => ({
    // 1. Get all countries
    getCountries: builder.query({
      query: () => "",
      transformResponse: (response) =>
        response.data.map((c) => c.country).sort((a, b) => a.localeCompare(b)),
    }),

    // 2. Get states of a country (POST endpoint)
    getStates: builder.query({
      query: (countryName) => ({
        url: "states",
        method: "POST",
        body: { country: countryName },
      }),
      transformResponse: (response) =>
        response.data?.states.map((s) => s.name) || [],
    }),

    // 3. Get cities of a state/country (POST endpoint)
    getCities: builder.query({
      query: ({ country, state }) => ({
        url: "state/cities",
        method: "POST",
        body: { country, state },
      }),
      transformResponse: (response) => response.data || [],
    }),
  }),
});

export const { useGetCountriesQuery, useGetStatesQuery, useGetCitiesQuery } =
  geoApi;
