// screens/TopUpScreen.tsx
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { daysToLabel, regionPrettyName } from "@/utils/esim";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import {
  useGetCountryOffersQuery,
  useGetZoneOffersQuery,
} from "../../../store/esimApi.slice";
import { useCreateOrderMutation } from "../../../store/odersApi.slice";
import DestinationDropdown, { DestinationItem } from "./DestinationDropdown";
import TopUpOfferCard from "./TopUpOfferCard";

export default function TopUp() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  // Handle subscriberId - it might come as string from the order data, but backend expects number
  const subscriberId = params.subscriberId
    ? Number(String(params.subscriberId))
    : null;
  const esimId = params.esimId ? String(params.esimId) : null;

  const [selectedDestination, setSelectedDestination] =
    useState<DestinationItem | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [createOrder, { isLoading: creatingOrder }] = useCreateOrderMutation();
  const { name: userName, email: userEmail } = useCurrentUser();

  // Fetch offers based on selected destination
  const countryQuery = useGetCountryOffersQuery(
    selectedDestination?.code || "",
    {
      skip: !selectedDestination?.code || selectedDestination.type !== "local",
    }
  );

  const regionQuery = useGetZoneOffersQuery(selectedDestination?.zoneId || 0, {
    skip:
      !selectedDestination?.zoneId || selectedDestination.type !== "regional",
  });

  const offersData =
    selectedDestination?.type === "local"
      ? countryQuery.data
      : regionQuery.data;
  const isLoadingOffers = countryQuery.isLoading || regionQuery.isLoading;
  const isErrorOffers = countryQuery.isError || regionQuery.isError;

  const handleDestinationSelect = (destination: DestinationItem) => {
    setSelectedDestination(destination);
    setSelectedOfferId(null); // Reset selection when changing destination
  };

  const handleBuy = async (offer: any) => {
    console.log("handleBuy called with:", { subscriberId, esimId, offer });

    if (!subscriberId || isNaN(subscriberId)) {
      Alert.alert(
        t("topup.error"),
        `${t(
          "topup.subscriberIdRequired"
        )}: ${subscriberId} (type: ${typeof subscriberId})`
      );
      return;
    }

    try {
      const amountNum =
        typeof offer.price === "number" ? offer.price : Number(offer.price);
      const planTitle =
        selectedDestination?.name || regionPrettyName(offer.title);
      const dataText =
        typeof offer.data === "number"
          ? `${offer.data}GB`
          : String(offer.data ?? "—");

      // Calculate validity period dates
      const now = new Date();
      const activePeriodStart = now.toISOString();
      const activePeriodEnd = new Date(
        now.getTime() + (offer.periodDays || 30) * 24 * 60 * 60 * 1000
      ).toISOString();

      // Use the OCS packageTemplateId (like "594247"), not the internal database UUID
      const ocsPackageTemplateId = offer.packageTemplateId || offer.id;

      console.log("TopUp Debug Info:", {
        subscriberId,
        subscriberIdType: typeof subscriberId,
        ocsPackageTemplateId,
        offerPackageTemplateId: offer.packageTemplateId,
        offerId: offer.id,
        selectedDestination: selectedDestination?.name,
        amountNum,
        currency: offer.currency || "EUR",
      });

      // Create order with orderType: "topup" and subscriberId
      // This follows the same flow as regular orders: create order → checkout → payment → processing
      const order = await createOrder({
        packageTemplateId: ocsPackageTemplateId,
        orderType: "topup",
        amount: amountNum,
        currency: offer.currency || "EUR",
        subscriberId: subscriberId,
        validityPeriod: offer.periodDays || 30,
        activePeriodStart: activePeriodStart,
        activePeriodEnd: activePeriodEnd,
      }).unwrap();

      console.log("Order created successfully:", order);

      // Navigate to checkout page for payment (same as regular orders)
      router.push({
        pathname: "/checkout",
        params: {
          orderId: order.id,
          amount: String(order.amount ?? amountNum),
          currency: order.currency || "EUR",
          email: userEmail || "",
          planTitle: `${planTitle} (Top-up)`,
          dataText,
        },
      });
    } catch (e: any) {
      console.log("Top-up order creation failed:", e);
      Alert.alert(
        t("topup.error"),
        e?.data?.message || e?.message || t("topup.couldNotCreateTopup")
      );
    }
  };

  return (
    <ScrollView className="flex-1 px-4 pt-4 py-6 bg-white">
      <Text className="text-2xl font-bold text-[#004FFE] mb-4">
        {t("topup.title")}
      </Text>

      {subscriberId ? (
        <View className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Text className="text-sm text-green-800 font-medium">
            {t("topup.topupMode")}
          </Text>
          <Text className="text-xs text-green-600 mt-1">
            {t("topup.subscriberId")}: {subscriberId}
          </Text>
          {esimId && (
            <Text className="text-xs text-green-600">
              {t("topup.esimId")}: {esimId}
            </Text>
          )}
        </View>
      ) : (
        <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <Text className="text-sm text-red-800 font-medium">
            {t("topup.noSubscriberId")}
          </Text>
          <Text className="text-xs text-red-600 mt-1">
            {t("topup.receivedParams")}: {JSON.stringify(params)}
          </Text>
        </View>
      )}

      {/* Destination Selection */}
      <View className="mb-6">
        <DestinationDropdown
          selectedDestination={selectedDestination}
          onSelect={handleDestinationSelect}
          placeholder={t("topup.selectDestination")}
        />
      </View>

      {/* eSIM Offers */}
      {selectedDestination && (
        <View className="mb-6">
          <Text className="text-base font-semibold text-[#202020] mb-2">
            {t("topup.availablePackages")}
          </Text>

          {isLoadingOffers ? (
            <View className="flex-1 items-center justify-center py-8">
              <ActivityIndicator size="large" color="#004FFE" />
              <Text className="text-gray-500 mt-2">
                {t("topup.loadingOffers")}
              </Text>
            </View>
          ) : isErrorOffers ? (
            <View className="py-4">
              <Text className="text-red-600">
                {t("topup.errorLoadingOffers")}
              </Text>
            </View>
          ) : !offersData?.items?.length ? (
            <View className="py-4">
              <Text className="text-[#64748B]">{t("topup.noOffersFound")}</Text>
            </View>
          ) : (
            offersData.items.map((offer: any) => {
              const dataText =
                typeof offer.data === "number"
                  ? `${offer.data}GB`
                  : String(offer.data ?? "—");
              const priceText =
                typeof offer.price === "number" && Number.isFinite(offer.price)
                  ? offer.price.toFixed(2)
                  : String(offer.price ?? "—");

              return (
                <TopUpOfferCard
                  key={offer.id}
                  data={dataText}
                  validity={daysToLabel(offer.periodDays, t)}
                  price={priceText}
                  currency="€"
                  selected={selectedOfferId === offer.id}
                  onSelect={() => setSelectedOfferId(offer.id)}
                  onBuy={() => handleBuy(offer)}
                  isProcessing={creatingOrder}
                />
              );
            })
          )}
        </View>
      )}

      {!selectedDestination && (
        <View className="flex-1 items-center justify-center py-12">
          <Text className="text-gray-500 text-center text-lg">
            {t("topup.selectDestinationMessage")}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
