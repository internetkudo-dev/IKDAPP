import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import RoundedFlag from "./roundedFlag";

type Props = {
  flag: string;
  name: string;
  count?: number;
  onPress?: () => void;
};

const CountryCard = ({ flag, name, count, onPress }: Props) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.left}>
        <RoundedFlag flag={flag} />
        <Text style={styles.countryText}>{name}</Text>
      </View>

      <View style={styles.right}>
        {typeof count === "number" && (
          <Text style={styles.meta}>
            {count} {t("common.countries")}
          </Text>
        )}
        <Ionicons name="chevron-forward" size={20} color="#202020" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ebf3ff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countryText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#202020",
  },
  meta: {
    fontSize: 12,
    color: "#64748B",
  },
});

export default CountryCard;
