import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useState, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import * as z from "zod";

import { setCredentials } from "@/store/auth.slice";
import { useSignUpMutation } from "@/store/authApi.slice";
import { getRegisterFields } from "../../utils/auth/authTypes";
import { createRegisterSchema } from "../../utils/schemas/registerSchema";
import AuthFooter from "../components/auth/authFooter";
import Header from "../components/header";
import Input from "../components/input";

const RegisterForm = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [signUp, { isLoading }] = useSignUpMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const registerSchema = useMemo(() => createRegisterSchema(t), [t]);
  type RegisterForm = z.infer<typeof registerSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const {
        confirmPassword,
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
      } = data;

      const payload = {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        confirm_password: confirmPassword,
        phone_number: phoneNumber,
      };

      const res = await signUp(payload as any).unwrap();

      if (res && res.id && res.first_name && res.last_name) {
        dispatch(setCredentials({ token: res.accessToken, user: res }));
        router.replace("./enterCode");
      } else {
        alert(t("auth.register.userDataMissing"));
      }
    } catch (error: any) {
      let message = t("auth.register.tryAgain");
      if (Array.isArray(error?.data?.message)) {
        message = error.data.message.join("\n");
      } else if (typeof error?.data?.message === "string") {
        message = error.data.message;
      }
      alert(message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 40 }}
      className="px-6 pt-4"
    >
      <View className="gap-8">
        <Text className="text-[24px] font-medium text-[#202020]">
          {t("auth.register.title")}
        </Text>

        <View className="gap-3">
          {getRegisterFields(t).map(
            ({ name, placeholder, keyboardType, secureTextEntry }) => (
              <Controller
                key={name}
                control={control}
                name={name as keyof RegisterForm}
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChange}
                    errorMessage={errors[name as keyof RegisterForm]?.message}
                    keyboardType={keyboardType}
                    secureTextEntry={
                      name === "password" || name === "confirmPassword"
                        ? !showPassword
                        : undefined
                    }
                    rightIcon={
                      (name === "password" || name === "confirmPassword") && (
                        <TouchableOpacity
                          onPress={() =>
                            name === "password"
                              ? setShowPassword(!showPassword)
                              : setShowConfirm(!showConfirm)
                          }
                        >
                          <Ionicons
                            name={
                              showPassword || showConfirm ? "eye-off" : "eye"
                            }
                            size={20}
                            color="gray"
                          />
                        </TouchableOpacity>
                      )
                    }
                  />
                )}
              />
            )
          )}
        </View>

        <TouchableOpacity
          className="bg-[#004FFE] rounded-full py-5"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-semibold">
            {isLoading
              ? t("auth.register.registerButtonLoading")
              : t("auth.register.registerButton")}
          </Text>
        </TouchableOpacity>

        <AuthFooter
          footerText={t("auth.register.alreadyHaveAccount")}
          footerLinkText={t("auth.register.signIn")}
          footerLinkHref="/auth/login"
        />
      </View>
    </ScrollView>
  );
};

const Register = () => {
  const { i18n } = useTranslation();

  return (
    <View className="flex-1 bg-white">
      <Header showBackButton={true} />
      <RegisterForm key={i18n.language} />
    </View>
  );
};

export default Register;
