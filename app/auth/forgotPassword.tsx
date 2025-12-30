import { createForgotPasswordSchema } from "@/utils/schemas/forgotPasswordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useState, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { setUserId } from "../../store/auth.slice";
import { useSendResetCodeMutation } from "../../store/authApi.slice";
import Header from "../components/header";
import Input from "../components/input";

const ForgotPasswordForm = () => {
  const { t } = useTranslation();
  const [sendResetCode, { isLoading }] = useSendResetCodeMutation();
  const dispatch = useDispatch();
  const [resetError, setResetError] = useState("");

  const forgotPasswordSchema = useMemo(
    () => createForgotPasswordSchema(t),
    [t]
  );
  type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setResetError("");
    try {
      const response = await sendResetCode({ email: data.email }).unwrap();
      if (response) {
        dispatch(setUserId(response.id));
        router.push("/auth/resetPassword");
      }
    } catch (error: any) {
      let message = t("auth.forgotPassword.tryAgain");
      if (Array.isArray(error?.data?.message)) {
        message = error.data.message.join("\n");
      } else if (typeof error?.data?.message === "string") {
        message = error.data.message;
      }
      setResetError(message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 40 }}
      className="px-6 pt-4"
    >
      <View className="gap-10">
        <Text className="text-[24px] font-medium text-[#202020]">
          {t("auth.forgotPassword.title")}
        </Text>

        <Text
          className="text-[14px] font-normal text-[#202020]"
          style={{ lineHeight: 20 }}
        >
          {t("auth.forgotPassword.description")}
        </Text>

        <View className="gap-3">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder={t("auth.forgotPassword.emailPlaceholder")}
                keyboardType="email-address"
                value={value}
                onChangeText={(text) => {
                  setResetError("");
                  onChange(text);
                }}
                errorMessage={errors.email?.message}
              />
            )}
          />

          {resetError ? (
            <Text className="text-red-500 text-sm">{resetError}</Text> // me ndreq errorrin ne back (email does not match)
          ) : null}
        </View>

        <TouchableOpacity
          className="bg-[#004FFE] rounded-full py-5"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-semibold">
            {isLoading
              ? t("auth.forgotPassword.sendButtonLoading")
              : t("auth.forgotPassword.sendButton")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const ForgotPassword = () => {
  const { i18n } = useTranslation();

  return (
    <View className="flex-1 bg-white">
      <Header showBackButton={true} />
      <ForgotPasswordForm key={i18n.language} />
    </View>
  );
};

export default ForgotPassword;
