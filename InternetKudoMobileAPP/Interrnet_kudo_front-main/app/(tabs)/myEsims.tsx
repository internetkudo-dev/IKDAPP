import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import ActiveEsimCard from "../components/activeEsims/activeEsimCard";
import Header from "../components/header";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useEsimData } from "@/hooks/useEsimData";

export default function MyEsims() {
  const { t } = useTranslation();
  const { name: userName } = useCurrentUser();
  const { activeEsims, isLoading, error, refetch } = useEsimData();

  // Refetch data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <Header userName={userName} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#004FFE" />
          <Text className="text-gray-500 mt-4">{t("myEsims.loading")}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white">
        <Header userName={userName} />
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-500 text-center">{t("myEsims.error")}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Header userName={userName} />

      <View className="px-6 pt-4 pb-2">
        <Text className="text-[24px] text-[#202020] font-medium">
          {t("myEsims.title")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }} // Add extra padding to prevent content from being hidden under navbar
        showsVerticalScrollIndicator={false}
      >
        {activeEsims.length > 0 ? (
          activeEsims.map((item) => <ActiveEsimCard key={item.id} {...item} />)
        ) : (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-500 text-center">
              {t("myEsims.noEsims")}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
