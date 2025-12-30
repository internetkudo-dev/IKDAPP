import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import * as Device from "expo-device";
import {
  useGetPackageDetailsQuery,
  CountryOperator,
} from "../../../store/esimApi.slice";
import {
  regionPrettyName,
  regionFlagCode,
  buildFlagUrl,
} from "../../../utils/esim";
import { getCountryFlagUrl } from "../../../utils/esimUtils";

const { width, height } = Dimensions.get("window");

type EsimDetails = {
  id: string;
  title: string;
  countryCode: string;
  isoCode: string;
  flagUrl: string; // Changed from emoji to URL
  data: string;
  price: string;
  validity: string;
  countries: number;
  isRegional: boolean;
  availableCountries?: string[];
  networks: string[];
  description: string;
  features: string[];
  coverage: string;
  speed: string;
  activationType: "QR" | "Manual";
};

type EsimDetailsModalProps = {
  visible: boolean;
  onClose: () => void;
  onBuy: () => void;
  packageId: string; // UUID or packageTemplateId
  esimDetails?: EsimDetails;
};

export default function EsimDetailsModal({
  visible,
  onClose,
  onBuy,
  packageId,
  esimDetails,
}: EsimDetailsModalProps) {
  const { t } = useTranslation();
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const [isCompatible, setIsCompatible] = useState<boolean | null>(null);
  const [isCheckingCompatibility, setIsCheckingCompatibility] = useState(false);

  // Fetch package details from API
  const {
    data: packageDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useGetPackageDetailsQuery(packageId, {
    skip: !visible || !packageId,
  });

  // Helper function to safely format price
  const formatPrice = (price: any): string => {
    if (price == null) return "—";
    const numPrice = typeof price === "number" ? price : parseFloat(price);
    return !isNaN(numPrice) ? numPrice.toFixed(2) : price.toString();
  };

  // Convert API data to component format - use exact same logic as regions component
  const currentEsimDetails = React.useMemo(():
    | (EsimDetails & {
        countryOperators: CountryOperator[];
      })
    | null => {
    if (!packageDetails) return null;

    const isRegional = packageDetails.numberOfCountries > 1;
    const firstCountry = packageDetails.countries[0];

    // Use the exact same logic as regions component for title and flag
    const title = isRegional
      ? regionPrettyName(packageDetails.packageName)
      : firstCountry?.countryName ||
        regionPrettyName(packageDetails.packageName);

    const flagUrl = isRegional
      ? buildFlagUrl(regionFlagCode(packageDetails.packageName))
      : getCountryFlagUrl(firstCountry?.countryIso2);

    const countryNames = packageDetails.countries.map(
      (c: any) => c.countryName
    );
    const operatorNames = Array.from(
      new Set(packageDetails.countries.flatMap((c: any) => c.operatorNames))
    ) as string[];

    return {
      id: packageDetails.packageTemplateId,
      title,
      countryCode: firstCountry?.countryIso2?.toUpperCase() || "EU",
      isoCode: firstCountry?.countryIso2?.toUpperCase() || "EU",
      flagUrl,
      data: packageDetails.usageAllowed || "—",
      price: formatPrice(packageDetails.price),
      validity: packageDetails.validityDays
        ? `${packageDetails.validityDays} ${t("common.days")}`
        : "—",
      countries: packageDetails.numberOfCountries,
      isRegional,
      availableCountries: isRegional ? countryNames : undefined,
      networks: operatorNames,
      description: `${t("modal.package.description")} ${
        packageDetails.usageAllowed || "eSIM"
      } ${
        isRegional
          ? packageDetails.numberOfCountries +
            " " +
            t("modal.package.countries")
          : title
      }.`,
      features: [
        t("modal.package.features.speed"),
        t("modal.package.features.activation"),
        t("modal.package.features.support"),
        t("modal.package.features.noContract"),
        ...(isRegional
          ? [
              `${t("modal.package.features.roaming")} ${
                packageDetails.numberOfCountries
              } ${t("modal.package.countries")}`,
            ]
          : []),
      ],
      coverage: isRegional
        ? `${packageDetails.numberOfCountries} ${t("modal.package.countries")}`
        : title,
      speed: t("modal.package.speedText"),
      activationType: "QR" as const,
      countryOperators: packageDetails.countries, // Keep the full country-operator data
    };
  }, [packageDetails, t]);

  // Function to check eSIM compatibility
  const checkESimCompatibility = async () => {
    setIsCheckingCompatibility(true);

    try {
      // Get real device information
      const deviceInfo = await Device.getDeviceTypeAsync();
      const isPhysicalDevice = Device.isDevice;
      const modelName = Device.modelName || "";
      const brand = Device.brand || "";
      const osVersion = Device.osVersion || "";

      let compatible = false;

      if (Platform.OS === "ios") {
        // iOS devices with eSIM support (iPhone XS and newer, iPad Pro, etc.)
        const isNeweriPhone =
          modelName.includes("iPhone") &&
          (modelName.includes("XS") ||
            modelName.includes("11") ||
            modelName.includes("12") ||
            modelName.includes("13") ||
            modelName.includes("14") ||
            modelName.includes("15") ||
            modelName.includes("16") ||
            modelName.includes("Pro") ||
            modelName.includes("SE"));
        const isNeweriPad =
          modelName.includes("iPad") &&
          (modelName.includes("Pro") ||
            modelName.includes("Air") ||
            modelName.includes("mini"));

        compatible = isNeweriPhone || isNeweriPad;

        // If we can't determine from model name, check iOS version (iOS 12.1+)
        if (!compatible && osVersion) {
          const versionParts = osVersion.split(".").map(Number);
          if (
            versionParts[0] > 12 ||
            (versionParts[0] === 12 && versionParts[1] >= 1)
          ) {
            compatible = true; // Assume compatible for newer iOS versions
          }
        }
      } else if (Platform.OS === "android") {
        // Android devices with eSIM support
        const isPixel =
          brand.toLowerCase().includes("google") &&
          (modelName.includes("Pixel 3") ||
            modelName.includes("Pixel 4") ||
            modelName.includes("Pixel 5") ||
            modelName.includes("Pixel 6") ||
            modelName.includes("Pixel 7") ||
            modelName.includes("Pixel 8"));

        const isSamsung =
          brand.toLowerCase().includes("samsung") &&
          (modelName.includes("Galaxy S20") ||
            modelName.includes("Galaxy S21") ||
            modelName.includes("Galaxy S22") ||
            modelName.includes("Galaxy S23") ||
            modelName.includes("Galaxy S24") ||
            modelName.includes("Galaxy Note20") ||
            modelName.includes("Galaxy Z") ||
            modelName.includes("Galaxy A"));

        const isOnePlus =
          brand.toLowerCase().includes("oneplus") &&
          (modelName.includes("8") ||
            modelName.includes("9") ||
            modelName.includes("10") ||
            modelName.includes("11") ||
            modelName.includes("12"));

        const isXiaomi =
          brand.toLowerCase().includes("xiaomi") &&
          (modelName.includes("Mi 10") ||
            modelName.includes("Mi 11") ||
            modelName.includes("Mi 12") ||
            modelName.includes("Mi 13") ||
            modelName.includes("Redmi Note 11") ||
            modelName.includes("Redmi Note 12"));

        compatible = isPixel || isSamsung || isOnePlus || isXiaomi;

        // If we can't determine from model, check Android version (Android 10+)
        if (!compatible && osVersion) {
          const versionParts = osVersion.split(".").map(Number);
          if (versionParts[0] >= 10) {
            compatible = true; // Assume compatible for Android 10+
          }
        }
      } else {
        // Web or other platforms - assume not compatible
        compatible = false;
      }

      // Simulate API call delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setIsCompatible(compatible);
    } catch (error) {
      console.log("Error checking eSIM compatibility:", error);
      // Default to compatible if check fails
      setIsCompatible(true);
    } finally {
      setIsCheckingCompatibility(false);
    }
  };

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Check compatibility when modal opens
      checkESimCompatibility();
    } else {
      scaleValue.setValue(0);
      // Reset compatibility state when modal closes
      setIsCompatible(null);
      setIsCheckingCompatibility(false);
    }
  }, [visible]);

  const renderFeatureItem = (feature: string, index: number) => (
    <View key={index} className="flex-row items-center mb-3">
      <View className="w-2 h-2 bg-[#004FFE] rounded-full mr-3" />
      <Text className="text-[#202020] text-[14px] flex-1">{feature}</Text>
    </View>
  );

  const renderCountryItem = (country: string, index: number) => (
    <View key={index} className="bg-[#f8f9fa] px-3 py-2 rounded-lg mr-2 mb-2">
      <Text className="text-[#202020] text-[12px] font-medium">{country}</Text>
    </View>
  );

  const renderNetworkItem = (network: string, index: number) => (
    <View key={index} className="bg-[#e3f2fd] px-3 py-2 rounded-lg mr-2 mb-2">
      <Text className="text-[#004FFE] text-[12px] font-medium">{network}</Text>
    </View>
  );

  const renderCountryWithNetworks = (
    countryOperator: CountryOperator,
    index: number
  ) => (
    <View
      key={index}
      className="mb-4 bg-white border border-gray-100 rounded-2xl p-4"
    >
      {/* Country Header */}
      <View className="flex-row items-center mb-3">
        <Image
          source={{ uri: getCountryFlagUrl(countryOperator.countryIso2) }}
          style={{
            width: 24,
            height: 16,
            borderRadius: 2,
            marginRight: 8,
          }}
          resizeMode="cover"
          defaultSource={{ uri: "https://flagcdn.com/w160/xx.png" }}
        />
        <Text className="text-[#202020] text-[16px] font-semibold flex-1">
          {countryOperator.countryName}
        </Text>
        <View className="bg-[#f0f9ff] px-2 py-1 rounded-full">
          <Text className="text-[#004FFE] text-[11px] font-medium">
            {countryOperator.operatorNames.length}{" "}
            {countryOperator.operatorNames.length === 1
              ? t("modal.network")
              : t("modal.networks")}
          </Text>
        </View>
      </View>

      {/* Networks for this country */}
      <View className="flex-row flex-wrap">
        {countryOperator.operatorNames.map((network, networkIndex) => (
          <View
            key={networkIndex}
            className="bg-[#e3f2fd] px-3 py-2 rounded-lg mr-2 mb-2"
          >
            <Text className="text-[#004FFE] text-[12px] font-medium">
              {network}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <Animated.View
          style={{
            transform: [{ scale: scaleValue }],
            backgroundColor: "white",
            borderRadius: 24,
            height: height * 0.65,
            width: width * 0.95,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 10,
            },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
            <Text className="text-[#202020] text-[20px] font-bold">
              {t("modal.title")}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Loading State */}
          {isLoadingDetails ? (
            <View className="flex-1 justify-center items-center p-6">
              <ActivityIndicator size="large" color="#004FFE" />
              <Text className="text-[#6B7280] text-[16px] mt-4">
                {t("modal.loading")}
              </Text>
            </View>
          ) : detailsError ? (
            <View className="flex-1 justify-center items-center p-6">
              <Ionicons name="alert-circle" size={48} color="#ef4444" />
              <Text className="text-[#ef4444] text-[16px] mt-4 text-center">
                {t("modal.error")}
              </Text>
            </View>
          ) : !currentEsimDetails ? (
            <View className="flex-1 justify-center items-center p-6">
              <Ionicons name="alert-circle" size={48} color="#ef4444" />
              <Text className="text-[#ef4444] text-[16px] mt-4 text-center">
                {t("modal.noData")}
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Main Info Section */}
              <View className="p-6">
                {/* Title and Flag */}
                <View className="flex-row items-center mb-4">
                  <Image
                    source={{ uri: currentEsimDetails.flagUrl }}
                    style={{
                      width: 48,
                      height: 32,
                      borderRadius: 4,
                      marginRight: 12,
                    }}
                    resizeMode="cover"
                    defaultSource={{ uri: "https://flagcdn.com/w160/xx.png" }}
                  />
                  <View className="flex-1">
                    <Text className="text-[#202020] text-[24px] font-bold">
                      {currentEsimDetails.title}
                    </Text>
                    <Text className="text-[#004FFE] text-[16px] font-semibold">
                      {currentEsimDetails.countryCode}
                    </Text>
                  </View>
                </View>

                {/* Price and Main Details */}
                <View className="bg-[#f8f9fa] rounded-2xl p-4 mb-6">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-[#202020] text-[32px] font-bold">
                      {currentEsimDetails.price} €
                    </Text>
                    <View className="bg-[#004FFE] px-3 py-1 rounded-full">
                      <Text className="text-white text-[12px] font-semibold">
                        {currentEsimDetails.validity}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="wifi" size={18} color="#004FFE" />
                      <Text className="text-[#202020] text-[16px] ml-2 font-medium">
                        {currentEsimDetails.data}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="location" size={18} color="#004FFE" />
                      <Text className="text-[#202020] text-[16px] ml-2 font-medium">
                        {currentEsimDetails.countries}{" "}
                        {currentEsimDetails.countries === 1
                          ? t("common.country")
                          : t("common.countries")}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Phone Compatibility Check */}
                <View
                  className={`rounded-2xl p-4 mb-6 border ${
                    isCompatible === true
                      ? "bg-[#f0f9ff] border-[#10B981]/30"
                      : isCompatible === false
                      ? "bg-[#fef2f2] border-[#ef4444]/30"
                      : "bg-[#f8f9fa] border-[#6b7280]/30"
                  }`}
                >
                  <View className="flex-row items-center">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                        isCompatible === true
                          ? "bg-[#10B981]"
                          : isCompatible === false
                          ? "bg-[#ef4444]"
                          : "bg-[#6b7280]"
                      }`}
                    >
                      {isCheckingCompatibility ? (
                        <Ionicons name="hourglass" size={16} color="white" />
                      ) : isCompatible === true ? (
                        <Ionicons name="checkmark" size={18} color="white" />
                      ) : isCompatible === false ? (
                        <Ionicons name="close" size={18} color="white" />
                      ) : (
                        <Ionicons name="help" size={16} color="white" />
                      )}
                    </View>
                    <View className="flex-1">
                      {isCheckingCompatibility ? (
                        <Text className="text-[#6b7280] text-[14px]">
                          {t("modal.compatibility.checking")}
                        </Text>
                      ) : isCompatible === true ? (
                        <Text className="text-[#10B981] text-[14px] font-medium">
                          {t("modal.compatibility.compatible")}
                        </Text>
                      ) : isCompatible === false ? (
                        <Text className="text-[#ef4444] text-[14px] font-medium">
                          {t("modal.compatibility.notCompatible")}
                        </Text>
                      ) : (
                        <Text className="text-[#6b7280] text-[14px] font-medium">
                          {t("modal.compatibility.unknown")}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Countries with Networks */}
                <View className="mb-6">
                  <Text className="text-[#202020] text-[18px] font-bold mb-4">
                    {t("modal.operators")}
                  </Text>
                  <View>
                    {currentEsimDetails.countryOperators?.map(
                      renderCountryWithNetworks
                    )}
                  </View>
                </View>
              </View>
            </ScrollView>
          )}

          {/* Bottom Action Buttons */}
          <View
            className="p-6 border-t border-gray-100 bg-white"
            style={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
          >
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-gray-100 py-4 rounded-2xl items-center"
                activeOpacity={0.8}
              >
                <Text className="text-[#202020] text-[16px] font-semibold">
                  {t("modal.close")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onBuy}
                className="flex-1 bg-[#004FFE] py-4 rounded-2xl items-center"
                activeOpacity={0.8}
                disabled={!currentEsimDetails}
                style={{ opacity: !currentEsimDetails ? 0.5 : 1 }}
              >
                <Text className="text-white text-[16px] font-semibold">
                  {t("modal.buyNow")} - {currentEsimDetails?.price || "—"} €
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
