import { useCurrentUser } from "@/hooks/useCurrentUser";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Accordion, { FAQItem } from "../components/accordion";
import Header from "../components/header";

export default function HelpScreen() {
  const { name: userName } = useCurrentUser();
  const { t } = useTranslation();

  // Get FAQ data from translations
  const faqData: FAQItem[] = t("help.faq", {
    returnObjects: true,
  }) as FAQItem[];

  return (
    <View className="flex-1 bg-white">
      <Header userName={userName} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 100, // Add extra padding to prevent content from being hidden under navbar
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[24px] text-gray-900 font-medium mb-2">
          {t("help.title")}
        </Text>
        <Text className="mt-1 text-[#64748B] mb-4 text-[16px]">
          {t("help.subtitle")}
        </Text>

        <Accordion items={faqData} cardColor="#EBF3FF" />

        <View
          className="mt-6 p-4 rounded-2xl"
          style={{ backgroundColor: "#F1F5F9" }}
        >
          <Text className="text-[#0F172A] font-semibold text-base">
            {t("help.contactSection.title")}
          </Text>
          <Text className="text-[#475569] mt-1">
            {t("help.contactSection.subtitle")}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
