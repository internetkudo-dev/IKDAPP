import { buildFlagUrl, regionFlagCode, regionPrettyName } from "@/utils/esim";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useGetDestinationsQuery } from "../../../store/esimApi.slice";
import CountryCard from "../lokal/countrycard";

type RegionItem = {
  id: number;
  name: string;
  flag: string;
  count: number;
};

export default function Regions() {
  const { data, isLoading, isError } = useGetDestinationsQuery();

  const regions = useMemo<RegionItem[]>(() => {
    const list = (data ?? []).filter((d) => d.type === "regional");
    return list
      .map((d) => ({
        id: d.key,
        name: regionPrettyName(d.title),
        flag: buildFlagUrl(regionFlagCode(d.title)),
        count: d.countries.length,
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );
  }, [data]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#004FFE" />
        <Text className="text-gray-500 mt-4">Loading regions...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="px-6 py-4">
        <Text className="text-red-600">
          S’munda ta ngarkoj listën e rajoneve.
        </Text>
      </View>
    );
  }

  if (!regions.length) {
    return (
      <View className="px-6 py-4">
        <Text className="text-[#64748B] mt-4">Asnjë rajon i gjetur.</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingBottom: 24,
        paddingTop: 16,
      }}
      data={regions}
      keyExtractor={(it) => String(it.id)}
      renderItem={({ item }) => (
        <CountryCard
          flag={item.flag}
          name={item.name}
          count={item.count}
          onPress={() =>
            router.push({
              pathname: "/esimOffers",
              params: {
                name: item.name,
                flag: item.flag,
                zoneId: String(item.id),
              },
            })
          }
        />
      )}
      initialNumToRender={15}
      windowSize={8}
      removeClippedSubviews
    />
  );
}
