import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type FAQItem = {
  question: string;
  answer: string;
};

type Props = {
  items: FAQItem[];
  cardColor?: string;
};

export default function Accordion({ items, cardColor = "#EBF3FF" }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <View className="mt-3">
      {items.map((item, idx) => {
        const isOpen = idx === openIndex;
        return (
          <View
            key={idx}
            style={{
              backgroundColor: cardColor,
              borderRadius: 14,
              marginBottom: 10,
            }}
          >
            <Pressable
              onPress={() => toggle(idx)}
              android_ripple={{ color: "#dbeafe" }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#0F172A",
                  flex: 1,
                  paddingRight: 12,
                }}
              >
                {item.question}
              </Text>
              <Ionicons
                name={isOpen ? "chevron-up" : "chevron-down"}
                size={22}
                color="#0F172A"
              />
            </Pressable>

            {isOpen && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
                <Text
                  style={{ fontSize: 15, lineHeight: 22, color: "#334155" }}
                >
                  {item.answer}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
