
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const esimApiSlice = createApi({
    reducerPath: 'esimApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getEsims: builder.query<any, void>({
            query: () => "esims",
        }),
        getPackageDetails: builder.query<any, string | number>({
            query: (id) => `packages/${id}`,
        }),
        getRegions: builder.query<any, void>({
            query: () => "regions",
        }),
        getDestinations: builder.query<any, void>({
            query: () => "destinations",
        }),
        getZoneOffers: builder.query<any, number | string>({
            query: (zoneId) => `zones/${zoneId}/offers`,
        }),
        getCountryOffers: builder.query<any, string>({
            query: (countryCode) => `countries/${countryCode}/offers`,
        }),
    }),
});

export const {
    useGetEsimsQuery,
    useGetPackageDetailsQuery,
    useGetRegionsQuery,
    useGetDestinationsQuery,
    useGetZoneOffersQuery,
    useGetCountryOffersQuery
} = esimApiSlice;

export type CountryOperator = {
    name: string;
    countryIso2: string;
    countryName: string;
    operatorNames: string[];
    networks: any[];
};
