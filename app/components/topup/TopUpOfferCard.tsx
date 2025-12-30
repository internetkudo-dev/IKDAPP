import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

interface TopUpOfferCardProps {
  data: string;
  validity: string;
  price: string;
  currency?: string;
  selected: boolean;
  onSelect: () => void;
  onBuy: () => void;
  isProcessing?: boolean;
}

export default function TopUpOfferCard({
  data,
  validity,
  price,
  currency = "€",
  selected,
  onSelect,
  onBuy,
  isProcessing = false,
}: TopUpOfferCardProps) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selectedCard]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        {/* Selection Radio Button */}
        <View style={styles.leftSection}>
          <Ionicons
            name={selected ? "radio-button-on" : "radio-button-off"}
            size={22}
            color={selected ? "#004FFE" : "#888"}
            style={styles.radioIcon}
          />

          {/* Data and Validity Info */}
          <View style={styles.infoSection}>
            <View style={styles.dataRow}>
              <Ionicons name="wifi" size={16} color="#004FFE" />
              <Text style={styles.dataText}>{data}</Text>
            </View>
            <View style={styles.validityRow}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.validityText}>{validity}</Text>
            </View>
          </View>
        </View>

        {/* Price Section */}
        <View style={styles.rightSection}>
          <Text style={styles.priceText}>
            {price} {currency}
          </Text>
          <TouchableOpacity
            style={[
              styles.buyButton,
              selected && styles.selectedBuyButton,
              isProcessing && styles.processingButton,
              !selected && styles.disabledButton,
            ]}
            onPress={onBuy}
            disabled={isProcessing || !selected}
            activeOpacity={selected ? 0.8 : 1}
          >
            <Text
              style={[
                styles.buyButtonText,
                selected && styles.selectedBuyButtonText,
                isProcessing && styles.processingButtonText,
                !selected && styles.disabledButtonText,
              ]}
            >
              {isProcessing ? t("topup.topupProcessing") : t("topup.topup")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    backgroundColor: "#ebf3ff",
    borderColor: "#004FFE",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  radioIcon: {
    marginRight: 12,
  },
  infoSection: {
    flex: 1,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dataText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#202020",
    marginLeft: 6,
  },
  validityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  validityText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#202020",
    marginBottom: 8,
  },
  buyButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 20, // Made bigger
    paddingVertical: 10, // Made bigger
    borderRadius: 8, // More rectangular
    minWidth: 80, // Made bigger
  },
  selectedBuyButton: {
    backgroundColor: "#004FFE",
  },
  processingButton: {
    backgroundColor: "#9ca3af",
  },
  disabledButton: {
    backgroundColor: "#f3f4f6",
    opacity: 0.6,
  },
  buyButtonText: {
    fontSize: 15, // Slightly bigger text
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
  },
  selectedBuyButtonText: {
    color: "white",
  },
  processingButtonText: {
    color: "white",
  },
  disabledButtonText: {
    color: "#9ca3af",
  },
});
