import { router, type Href } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type AuthFooterProps = {
  footerText: string;
  footerLinkText: string;
  footerLinkHref: Href;
};

const AuthFooter = ({
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthFooterProps) => {
  return (
    <View className="gap-6">
      {/* Divider */}
      <View className="flex-row items-center">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-3 text-gray-400">Ose</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      {/* Social logins */}
      <View className="gap-3">
        <TouchableOpacity className="flex-row items-center justify-center border border-[#CBD5E1] rounded-md py-4">
          <Image
            source={require("../../assets/images/google.png")}
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
          <Text className="text-[#64748B] ml-2">Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-center border border-[#CBD5E1] rounded-md py-4">
          <Image
            source={require("../../assets/images/apple.png")}
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
          <Text className="text-[#64748B] ml-2">Continue with Apple</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View className="items-center">
        <Text className="text-gray-500">
          {footerText}{" "}
          <Text
            className="text-blue-600 font-semibold"
            onPress={() => router.push(footerLinkHref)}
          >
            {footerLinkText}
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default AuthFooter;
