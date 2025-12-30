import { setCredentials } from "@/store/auth.slice";
import { useLoginMutation } from "@/store/authApi.slice";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { createLoginSchema } from "../../utils/schemas/loginSchema";
import AuthFooter from "../components/auth/authFooter";
import Header from "../components/header";
import Input from "../components/input";

const LoginForm = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const loginSchema = useMemo(() => createLoginSchema(t), [t]);
  type LoginForm = {
    email: string;
    password: string;
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoginError("");

    try {
      const response = await login(data).unwrap();
      dispatch(setCredentials({ token: response.accessToken }));
      router.replace("/");
    } catch (error: any) {
      let message = t("auth.login.tryAgain");

      if (Array.isArray(error?.data?.message)) {
        message = error.data.message.join("\n");
      } else if (typeof error?.data?.message === "string") {
        message = error.data.message;
      }

      setLoginError(message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 40 }}
      className="px-6 pt-4"
    >
      <View className="gap-8">
        <Text className="text-[24px] font-medium text-[#202020]">
          {t("auth.login.title")}
        </Text>

        <View className="gap-3">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder={t("auth.login.emailPlaceholder")}
                keyboardType="email-address"
                value={value}
                onChangeText={(text) => {
                  setLoginError("");
                  onChange(text);
                }}
                errorMessage={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder={t("auth.login.passwordPlaceholder")}
                secureTextEntry={!showPassword}
                value={value}
                onChangeText={(text) => {
                  setLoginError("");
                  onChange(text);
                }}
                errorMessage={errors.password?.message}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="gray"
                    />
                  </TouchableOpacity>
                }
              />
            )}
          />
          {loginError ? (
            <Text className="text-red-500 text-sm">{loginError}</Text>
          ) : null}

          <View className="items-end">
            <Text
              className="text-[#004FFE] font-medium"
              onPress={() => router.push("/auth/forgotPassword")}
            >
              {t("auth.login.forgotPassword")}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-[#004FFE] rounded-full py-5"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-semibold">
            {isLoading
              ? t("auth.login.loginButtonLoading")
              : t("auth.login.loginButton")}
          </Text>
        </TouchableOpacity>

        <AuthFooter
          footerText={t("auth.login.noAccount")}
          footerLinkText={t("auth.login.signUp")}
          footerLinkHref="/auth/register"
        />
      </View>
    </ScrollView>
  );
};

const Login = () => {
  const { i18n } = useTranslation();

  return (
    <View className="flex-1 bg-white">
      <Header />
      <LoginForm key={i18n.language} />
    </View>
  );
};

export default Login;
