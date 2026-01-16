import { useCurrentUser } from "@/hooks/useCurrentUser";
import { daysToLabel, regionPrettyName } from "@/utils/esim";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import {
  useGetCountryOffersQuery,
  useGetZoneOffersQuery,
} from "@/store/esimApi.slice";
import { useCreateOrderMutation } from "@/store/odersApi.slice";
import Header from "@/components/header";
import OfferCard from "@/components/offers/offerCard";

export const screenOptions = { headerShown: false };

export default function EsimOffers() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    name?: string;
    flag?: string;
    code?: string;
    zoneId?: string;
  }>();

  const iso2 = (params.code ?? "").toString().toLowerCase();
  const hasIso2 = !!iso2;
  const zoneIdNum = Number(params.zoneId);
  const hasZoneId = !Number.isNaN(zoneIdNum);
  const [createOrder, { isLoading: creatingOrder }] = useCreateOrderMutation();

  const country = useGetCountryOffersQuery(iso2, { skip: !hasIso2 });
  const region = useGetZoneOffersQuery(zoneIdNum, {
    skip: !hasZoneId || hasIso2,
  });

  const data = country.data ?? region.data;
  const isLoading = country.isLoading || region.isLoading;
  const isError = country.isError || region.isError;

  const { name: userName, email: userEmail } = useCurrentUser(); // make sure your hook returns email

  const handleBuy = async (offer: any, planTitle: string, dataText: string) => {
    try {
      // Don't create order yet - just navigate to Review & Rewards
      // Order will be created when user presses "Continue to Payment"
      const amountNum =
        typeof offer.price === "number" ? offer.price : Number(offer.price);

      router.push({
        pathname: "/review-rewards",
        params: {
          packageTemplateId: offer.packageTemplateId || offer.id,
          planName: `${planTitle} ${dataText}`,
          orderTotal: String(amountNum),
          currency: offer.currency || "EUR",
          email: userEmail || "",
          planTitle,
          dataText,
        },
      });
    } catch (e: any) {
      console.log(e);
      alert(e?.data?.message || e?.message || t("esimOffers.orderError"));
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Header userName={userName} showBackButton={true} />

      <View className="px-6 pt-4 pb-2 flex-row items-center gap-2">
        {params.flag ? (
          <Image
            source={{ uri: params.flag as string }}
            style={{ width: 20, height: 20, borderRadius: 10 }}
          />
        ) : null}
        <Text className="text-[24px] font-medium text-gray-900">
          {t("esimOffers.title")} {params.name}
        </Text>
      </View>

      <View className="px-6 pb-2">
        <Text className="text-[14px] text-[#64748B] italic">
          {t("esimOffers.clickForInfo")}
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="text-[#64748B] mt-2">{t("esimOffers.loading")}</Text>
        </View>
      ) : isError ? (
        <View className="px-6 py-4">
          <Text className="text-red-600">{t("esimOffers.error")}</Text>
        </View>
      ) : !data?.items?.length ? (
        <View className="px-6 py-4">
          <Text className="text-[#64748B]">{t("esimOffers.noOffers")}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 32,
            paddingTop: 16,
          }}
        >
          {data.items.map((offer: any) => {
            const title = params.name ?? regionPrettyName(offer.title);
            const dataText =
              typeof offer.data === "number"
                ? `${offer.data}GB`
                : String(offer.data ?? "—");
            const priceText =
              typeof offer.price === "number" && Number.isFinite(offer.price)
                ? offer.price.toFixed(2)
                : String(offer.price ?? "—");
            const countriesCount =
              typeof offer.countriesCount === "number"
                ? offer.countriesCount
                : Array.isArray(offer.countries)
                  ? offer.countries.length
                  : undefined;

            // Use packageTemplateId if available (for regions), otherwise use id (for countries)
            const packageId = offer.packageTemplateId || offer.id;

            return (
              <OfferCard
                key={offer.id}
                title={title}
                countryCode={(iso2 || "").toUpperCase()}
                data={dataText}
                price={priceText}
                validity={daysToLabel(offer.periodDays, t)}
                countries={countriesCount}
                packageId={packageId}
                onBuy={() => handleBuy(offer, title, dataText)} // <-- pass handler
              />
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
