import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGetPurchasesQuery } from "@/store/profileApi.slice";
import {
  formatCurrencyEUR,
  formatDateTime,
  formatPackageName,
} from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Pressable, Text, View } from "react-native";
import Header from "@/components/header";

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return { bg: "#DCFCE7", text: "#16A34A" };
      case "PENDING":
        return { bg: "#FEF3C7", text: "#D97706" };
      case "FAILED":
        return { bg: "#FEE2E2", text: "#DC2626" };
      case "SUCCESS":
        return { bg: "#DCFCE7", text: "#16A34A" };
      case "ERROR":
        return { bg: "#FEE2E2", text: "#DC2626" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };

  const colors = getStatusColor();

  return (
    <View
      className="px-3 py-1 rounded-full"
      style={{ backgroundColor: colors.bg }}
    >
      <Text className="text-xs font-medium" style={{ color: colors.text }}>
        {status}
      </Text>
    </View>
  );
};

const PurchaseCard = ({
  item,
  price,
  date,
  status,
}: {
  item: string;
  price: number;
  date: string;
  status: string;
}) => {
  const getPaymentStatus = () => {
    const upperStatus = status?.toUpperCase();
    if (upperStatus === "CANCELED" || upperStatus === "PENDING") {
      return "Unpaid";
    }
    if (upperStatus === "COMPLETED") {
      return "Paid";
    }
    return "Paid"; // default for other statuses
  };

  return (
    <View
      className="rounded-xl p-4 mb-3"
      style={{
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#3B82F6",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-[16px] font-semibold text-gray-900 mb-1">
            {formatPackageName(item)}
          </Text>
          <Text className="text-[14px] text-gray-600">
            {formatDateTime(date)}
          </Text>
        </View>
        <StatusBadge status={status} />
      </View>
      <View className="flex-row items-center justify-between mt-2 pt-2 border-t-2 border-blue-200">
        <Text className="text-[14px] text-gray-600">{getPaymentStatus()}</Text>
        <Text className="text-[18px] font-bold text-blue-600">
          {formatCurrencyEUR(price)}
        </Text>
      </View>
    </View>
  );
};

const SkeletonCard = () => (
  <View
    className="rounded-xl p-4 mb-3"
    style={{
      backgroundColor: "#F8FAFC", // Slightly darker background for better contrast
      borderWidth: 2,
      borderColor: "#3B82F6", // Blue border for better visibility
    }}
  >
    <View className="flex-row justify-between mb-2">
      <View className="flex-1">
        <View className="w-40 h-5 bg-blue-200 rounded mb-2" />
        <View className="w-32 h-4 bg-blue-200 rounded" />
      </View>
      <View className="w-20 h-6 bg-blue-200 rounded-full" />
    </View>
    <View className="w-24 h-6 bg-blue-200 rounded mt-2" />
  </View>
);

export default function PurchasesList() {
  const { t } = useTranslation();
  const { user } = useCurrentUser();
  const userId = user?.id;

  const {
    data: purchasesData,
    isLoading,
    isError,
    refetch,
  } = useGetPurchasesQuery(userId!, {
    skip: !userId,
  });

  // Refetch data every time the user enters this page
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        refetch();
      }
    }, [userId, refetch])
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header Component */}
      <Header
        showBackButton={true}
        showUserArea={false}
        showLanguageSwitcher={true}
      />

      {/* Page Title */}
      <View className="bg-white px-5 py-4 border-b border-gray-100">
        <Text className="text-[24px] font-bold text-gray-900">
          {t("profile.purchases.title")}
        </Text>
        {purchasesData && !isLoading && (
          <Text className="text-gray-600 mt-1">
            {purchasesData.total}{" "}
            {purchasesData.total === 1 ? "purchase" : "purchases"}
          </Text>
        )}
      </View>

      {isLoading ? (
        <View className="px-5 pt-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-5">
          <View className="bg-red-50 rounded-2xl p-6 w-full">
            <Text className="text-red-600 text-center mb-4 text-[16px]">
              {t("profile.errors.loadError")}
            </Text>
            <Pressable
              onPress={refetch}
              className="bg-red-100 px-6 py-3 rounded-lg self-center"
            >
              <Text className="text-red-700 font-medium">
                {t("profile.errors.retry")}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : purchasesData && purchasesData.purchases.length > 0 ? (
        <FlatList
          data={purchasesData.purchases}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PurchaseCard
              item={item.item}
              price={item.price}
              date={item.date}
              status={item.status}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-5">
          <Ionicons name="bag-handle-outline" size={64} color="#D1D5DB" />
          <Text className="text-gray-600 text-center mt-4 text-[16px]">
            {t("profile.purchases.noPurchases")}
          </Text>
        </View>
      )}
    </View>
  );
}
