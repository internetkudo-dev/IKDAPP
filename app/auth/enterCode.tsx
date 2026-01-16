import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useVerifyUserMutation } from "../../store/authApi.slice";
import { RootState } from "../../store/store";
import Header from "@/components/header";
import Input from "@/components/input";

const EnterCodeForm = () => {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifyUser, { isLoading, isError, error }] = useVerifyUserMutation();

  useEffect(() => {
    if (!user) {
      Alert.alert("Error", t("auth.enterCode.userNotFound"));
      router.push("./register");
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <Text>{t("auth.enterCode.loading")}</Text>;

  const handleSubmit = async () => {
    if (!user || !user.id) {
      Alert.alert("Error", t("auth.enterCode.userIdMissing"));
      return;
    }
    setVerifyError("");

    try {
      const response = await verifyUser({
        userId: user.id,
        code,
      }).unwrap();

      if (response) {
        router.push("/");
      }
    } catch (error: any) {
      let message = t("auth.enterCode.invalidCode");
      if (Array.isArray(error?.data?.message)) {
        message = error.data.message.join("\n");
      } else if (typeof error?.data?.message === "string") {
        message = error.data.message;
      }
      setVerifyError(message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 40 }}
      className="px-6 pt-4"
    >
      <View className="gap-8">
        <Text className="text-[24px] font-medium text-[#202020]">
          {t("auth.enterCode.title")}
        </Text>
        <View className="gap-3">
          <Input
            placeholder={t("auth.enterCode.codePlaceholder")}
            value={code}
            onChangeText={setCode}
            style={{
              borderWidth: 1,
              borderColor: "#CBD5E1",
              borderRadius: 8,
              padding: 16,
              backgroundColor: "#f9f9f9",
            }}
          />
        </View>
        {verifyError ? (
          <Text className="text-red-500 text-sm">{verifyError}</Text>
        ) : null}
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-[#004FFE] rounded-full py-5"
          disabled={isLoading}
        >
          <Text className="text-white text-center font-semibold">
            {isLoading
              ? t("auth.enterCode.submitButtonLoading")
              : t("auth.enterCode.submitButton")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const EnterCode = () => {
  const { i18n } = useTranslation();

  return (
    <View className="flex-1 bg-white">
      <Header showBackButton={true} />
      <EnterCodeForm key={i18n.language} />
    </View>
  );
};

export default EnterCode;
