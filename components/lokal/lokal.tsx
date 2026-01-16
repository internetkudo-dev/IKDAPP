import { buildFlagUrl } from "@/utils/esim";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useGetDestinationsQuery } from "@/store/esimApi.slice";
import CountryCard from "./countrycard";

type Props = { search?: string };

type FlatCountry = {
  name: string;
  code: string;
  flag: string;
  zoneId?: number | string;
  zoneName?: string;
};

export default function Lokal({ search = "" }: Props) {
  const { data, isLoading, isError } = useGetDestinationsQuery();

  const items = useMemo<FlatCountry[]>(() => {
    const q = search.trim().toLowerCase();
    const locals = (data ?? []).filter((d: any) => d.type === "local");

    const acc: Record<string, FlatCountry> = {};
    for (const d of locals) {
      const zoneId = d.key;
      const zoneName = d.title;
      d.countries.forEach((countryName: string, idx: number) => {
        const code = (d.iso2[idx] || "").toLowerCase();
        if (!code) return;
        if (q && !countryName.toLowerCase().includes(q)) return;
        acc[code] = {
          name: countryName,
          code,
          flag: buildFlagUrl(code),
          zoneId,
          zoneName,
        };
      });
    }

    return Object.values(acc).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }, [data, search]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#004FFE" />
        <Text className="text-gray-500 mt-4">Loading countries...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="px-6 py-4">
        <Text className="text-red-600">
          S’munda ta ngarkoj listën e shteteve. Provo përsëri.
        </Text>
      </View>
    );
  }

  if (!items.length) {
    return (
      <View className="px-6 py-4">
        <Text className="text-[#64748B]">Asnjë shtet i gjetur.</Text>
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
      data={items}
      keyExtractor={(it) => it.code}
      renderItem={({ item }) => (
        <CountryCard
          flag={item.flag}
          name={item.name}
          onPress={() =>
            router.push({
              pathname: "/esimOffers",
              params: {
                name: item.name,
                flag: item.flag,
                code: item.code,
                zoneId: item.zoneId ? String(item.zoneId) : "",
              },
            })
          }
        />
      )}
      initialNumToRender={20}
      windowSize={10}
      removeClippedSubviews
    />
  );
}
