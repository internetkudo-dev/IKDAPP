import React from "react";
import { Image, Text, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import LanguageSwitcher from "./LanguageSwitcher";

type HeaderProps = {
  userName?: string; // e.g. "Drin Sadiku"
  showGreeting?: boolean; // show "Mirësevini" (default: only if userName exists)
  greetingText?: string; // default: "Mirësevini"
  showUserArea?: boolean; // hide right content entirely (default: true)
  showBackButton?: boolean; // show back arrow (default: false)
  showLanguageSwitcher?: boolean; // show language switcher (default: true)
  onBackPress?: () => void; // custom back handler
};

const Header = ({
  userName,
  showGreeting, // computed below
  greetingText,
  showUserArea = true,
  showBackButton = false,
  showLanguageSwitcher = true,
  onBackPress,
}: HeaderProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  // Use translation if no custom greeting text is provided
  const welcomeText = greetingText || t("header.welcome");

  // If not explicitly set, show greeting only when we actually have a name
  const shouldShowGreeting = showGreeting ?? Boolean(userName);
  const shouldShowRight = showUserArea && (userName || shouldShowGreeting);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View className="px-6 pt-20 pb-4 bg-white">
      {/* Top row: Back button and Language switcher (when present) */}
      {(showBackButton || showLanguageSwitcher) && (
        <View className="flex-row items-center justify-between mb-1">
          {/* LEFT: Back button */}
          <View className="flex-row items-center">
            {showBackButton && (
              <TouchableOpacity
                onPress={handleBackPress}
                className="p-1"
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={22} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* RIGHT: Language switcher */}
          <View className="flex-row items-center">
            {showLanguageSwitcher && <LanguageSwitcher variant="compact" />}
          </View>
        </View>
      )}

      {/* Main row: Logo and User greeting (always inline) */}
      <View className="flex-row items-center justify-between">
        {/* LEFT: Logo */}
        <Image
          source={require("../../assets/images/logo.png")}
          style={{ width: 120, height: 40 }}
          resizeMode="contain"
        />

        {/* RIGHT: User greeting */}
        {shouldShowRight && (
          <View className="flex-row items-center">
            {shouldShowGreeting && (
              <Text
                className="text-[#202020] text-[16px] font-semibold mr-2"
                numberOfLines={1}
              >
                {welcomeText},
              </Text>
            )}
            {userName && (
              <Text
                className="text-[#202020] text-[16px] font-semibold"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ maxWidth: 120 }}
              >
                {userName}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default Header;
