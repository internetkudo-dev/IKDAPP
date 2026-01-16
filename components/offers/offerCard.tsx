import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import EsimDetailsModal from "./EsimDetailsModal";

type OfferCardProps = {
  title: string;
  countryCode?: string;
  data: string;
  price: string;
  validity: string;
  countries?: number;
  packageId?: string; // UUID or packageTemplateId for details API (optional)
  onBuy?: () => void;
};

const OfferCard = ({
  title,
  countryCode,
  data,
  price,
  validity,
  countries = 1,
  packageId,
  onBuy,
}: OfferCardProps) => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCardPress = () => {
    // Only show modal if packageId is provided (for details functionality)
    // Don't open modal if processing
    if (packageId && !isProcessing) {
      setModalVisible(true);
    }
  };

  const handleBuy = async () => {
    if (isProcessing) return; // Prevent double-tap

    setIsProcessing(true);
    setModalVisible(false);
    onBuy?.();

    // Reset processing state after a short delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleCardPress}
        activeOpacity={0.9}
        className="bg-[#ebf3ff] rounded-2xl px-6 py-5 mb-6"
      >
        <View className="flex-row items-center gap-2">
          {countryCode && (
            <Text className="text-[#202020] font-medium text-[16px]">
              {countryCode}
            </Text>
          )}
          <Text className="text-[#004FFE] font-semibold text-[17px]">
            {title}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mt-4">
          <View className="flex-row items-center gap-1">
            <Ionicons name="wifi" size={18} color="#000" />
            <Text className="text-[#202020] text-[15px]">{data}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="location" size={18} color="#000" />
            <Text className="text-[#202020] text-[15px]">
              {countries}{" "}
              {countries === 1 ? t("common.country") : t("common.countries")}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar" size={18} color="#000" />
            <Text className="text-[#202020] text-[15px]">{validity}</Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mt-5">
          <Text className="text-[#202020] text-[24px] font-bold">
            {price} €
          </Text>
          <TouchableOpacity
            onPress={handleBuy}
            className={`px-6 py-2 rounded-xl ${
              isProcessing ? "bg-gray-400" : "bg-[#004FFE]"
            }`}
            activeOpacity={0.85}
            disabled={isProcessing}
          >
            <Text className="text-white font-semibold text-[16px]">
              {t("common.buyNow")}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {packageId && (
        <EsimDetailsModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onBuy={handleBuy}
          packageId={packageId}
        />
      )}
    </>
  );
};

export default OfferCard;
