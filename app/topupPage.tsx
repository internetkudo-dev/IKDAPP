import { useCurrentUser } from "@/hooks/useCurrentUser";
import React from "react";
import { View } from "react-native";
import Header from "@/components/header";
import TopUp from "@/components/topup/topUp";

export default function TopUpPage() {
  const { name: userName } = useCurrentUser();
  return (
    <View className="flex-1 bg-white">
      <Header userName={userName} showBackButton={true} />

      <TopUp />
    </View>
  );
}
