import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { selectUserId } from "../../store/auth.slice";
import { useResetPasswordMutation } from "../../store/authApi.slice";
import { createResetPasswordSchema } from "../../utils/schemas/resetPasswordSchema";
import Header from "@/components/header";
import Input from "@/components/input";

const ResetPasswordForm = () => {
  const { t } = useTranslation();
  const userId = useSelector(selectUserId);
  const [resetPassword, { isLoading, isError, error }] =
    useResetPasswordMutation();

  const resetPasswordSchema = useMemo(() => createResetPasswordSchema(t), [t]);
  type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    const { code, password, confirmPassword } = data;

    if (!userId) {
      Alert.alert("Error", t("auth.resetPassword.userIdMissing"));
      return;
    }

    try {
      const response = await resetPassword({
        userId,
        code,
        password,
        confirmPassword,
      }).unwrap();

      if (response) {
        router.push("/");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      Alert.alert("Error", t("auth.resetPassword.resetFailed"));
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 40 }}
      className="px-6 pt-4"
    >
      <View className="gap-8">
        <Text className="text-[24px] font-medium text-[#202020]">
          {t("auth.resetPassword.title")}
        </Text>

        <View className="gap-3">
          <Controller
            control={control}
            name="code"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder={t("auth.resetPassword.codePlaceholder")}
                value={value}
                onChangeText={onChange}
                errorMessage={errors.code?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder={t("auth.resetPassword.passwordPlaceholder")}
                secureTextEntry={true}
                value={value}
                onChangeText={onChange}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder={t("auth.resetPassword.confirmPasswordPlaceholder")}
                secureTextEntry={true}
                value={value}
                onChangeText={onChange}
                errorMessage={errors.confirmPassword?.message}
              />
            )}
          />
        </View>

        <TouchableOpacity
          className="bg-[#004FFE] rounded-full py-5"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-semibold">
            {isLoading
              ? t("auth.resetPassword.resetButtonLoading")
              : t("auth.resetPassword.resetButton")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const ResetPassword = () => {
  const { i18n } = useTranslation();

  return (
    <View className="flex-1 bg-white">
      <Header showBackButton={true} />
      <ResetPasswordForm key={i18n.language} />
    </View>
  );
};

export default ResetPassword;
