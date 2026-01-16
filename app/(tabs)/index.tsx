import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Dimensions, Text, TextInput, View } from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { useTranslation } from "react-i18next";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import Global from "@/components/global/gobal";
import Header from "@/components/header";
import Lokal from "@/components/lokal/lokal";
import Region from "@/components/regjionale/region";

const LokaleTab = ({ search }: { search: string }) => <Lokal search={search} />;
const RegjionaleTab = () => <Region />;
const GlobaleTab = () => <Global />;

const renderScene = ({ route, jumpTo, position }: any) => {
  switch (route.key) {
    case "lokale":
      return <LokaleTab search={(route.params?.search as string) ?? ""} />;
    case "regjionale":
      return <RegjionaleTab />;
    case "globale":
      return <GlobaleTab />;
    default:
      return null;
  }
};

export default function Index() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  // Make routes dynamic so they update when language changes
  const routes = [
    { key: "lokale", title: t("tabs.local") },
    { key: "regjionale", title: t("tabs.regional") },
    { key: "globale", title: t("tabs.global") },
  ];
  const [search, setSearch] = useState("");

  const { name: userName } = useCurrentUser();

  return (
    <View className="flex-1 bg-white">
      <Header userName={userName} />

      <View className="px-6 pt-4 pb-2">
        <Text className="text-[24px] text-gray-900 font-medium">
          {t("home.nextDestination")}
        </Text>
      </View>

      <View className="px-6 mt-2">
        <View className="w-full flex-row items-center bg-[#F1F5F9] rounded-xl px-4 py-[10px] ">
          <Ionicons name="search" size={22} color="#94A3B8" />
          <TextInput
            placeholder={t("home.searchPlaceholder")}
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            className="ml-3 text-[16px] leading-[22px] text-[#202020] flex-1"
            style={{ paddingVertical: 0 }}
          />
        </View>
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={SceneMap({
          lokale: () => <Lokal search={search} />,
          regjionale: () => <Region />,
          globale: () => <Global />,
        })}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get("window").width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: "#004FFE", height: 3 }}
            style={{ backgroundColor: "#fff", elevation: 0 }}
            activeColor="#004FFE"
            inactiveColor="#A0AEC0"
            pressColor="#E2E8F0"
          />
        )}
        style={{ marginBottom: 100 }}
      />
    </View>
  );
}
