
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const esimApiSlice = createApi({
    reducerPath: 'esimApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getEsims: builder.query({
            query: () => 'esims',
        }),
        getPackageDetails: builder.query({
            query: (id) => `packages/${id}`,
        }),
        getRegions: builder.query({
            query: () => 'regions',
        }),
        getDestinations: builder.query({
            query: () => 'destinations',
        }),
        getZoneOffers: builder.query({
            query: (zoneId) => `zones/${zoneId}/offers`,
        }),
    }),
});

export const { useGetEsimsQuery, useGetPackageDetailsQuery, useGetRegionsQuery, useGetDestinationsQuery, useGetZoneOffersQuery } = esimApiSlice;

export type CountryOperator = {
    name: string;
    countryIso2: string;
    countryName: string;
    operatorNames: string[];
    networks: any[];
};
