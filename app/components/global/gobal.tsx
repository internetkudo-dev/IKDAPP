import { ScrollView, Text, View, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import {
  useGetDestinationsQuery,
  useGetZoneOffersQuery,
} from "@/store/esimApi.slice";
import OfferCard from "../offers/offerCard";

export default function Global() {
  const { t } = useTranslation();
  const {
    data: destinations,
    isLoading: destinationsLoading,
    error: destinationsError,
  } = useGetDestinationsQuery();

  // Find global destinations
  const globalDestinations =
    destinations?.filter((dest: any) => dest.type === "global") || [];

  // Get offers for the first global destination if available
  const firstGlobalDest = globalDestinations[0];
  const {
    data: globalOffers,
    isLoading: offersLoading,
    error: offersError,
  } = useGetZoneOffersQuery(firstGlobalDest?.key || 0, {
    skip: !firstGlobalDest,
  });

  const isLoading = destinationsLoading || offersLoading;
  const hasError = destinationsError || offersError;
  const hasNoGlobalOffers =
    !isLoading && !hasError && globalDestinations.length === 0;

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#004FFE" />
        <Text className="text-[#64748B] text-sm mt-4">
          {t("global.loading")}
        </Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-6">
        <Text className="text-[#EF4444] text-center text-[16px] font-medium">
          {t("global.error")}
        </Text>
      </View>
    );
  }

  if (hasNoGlobalOffers) {
    return (
      <View className="flex-1 bg-white">
        <View className="px-6 pt-4">
          <Text className="text-[20px] font-semibold text-[#202020]">
            {t("global.title")}
          </Text>
          <Text className="text-[#64748B] text-sm mt-1">
            {t("global.subtitle")}
          </Text>
        </View>

        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-[#64748B] text-center text-[16px]">
            {t("global.noOffers")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-4">
        <Text className="text-[20px] font-semibold text-[#202020]">
          {t("global.title")}
        </Text>
        <Text className="text-[#64748B] text-sm mt-1">
          {t("global.subtitle")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 32,
          paddingTop: 16,
        }}
      >
        {globalOffers?.items?.map((offer: any, index: any) => (
          <OfferCard
            key={offer.id || index}
            title={offer.title}
            data={
              typeof offer.data === "number" ? `${offer.data}GB` : offer.data
            }
            price={offer.price?.toString() || "0"}
            validity={`${offer.periodDays} ${t("common.days")}`}
            countries={offer.countriesCount || offer.countries?.length || 1}
          />
        )) || []}
      </ScrollView>
    </View>
  );
}
