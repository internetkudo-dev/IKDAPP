import { useCurrentUser } from "@/hooks/useCurrentUser";
import { logOut } from "@/store/auth.slice";
import { useGetCreditsBalanceQuery } from "@/store/odersApi.slice";
import {
  useGetEsimStatsQuery,
  useLogoutMutation,
} from "@/store/profileApi.slice";
import { formatCurrencyEUR, formatPackageName } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import Header from "../components/header";

const Row = ({ label, onPress }: { label: string; onPress?: () => void }) => (
  <Pressable
    onPress={onPress}
    className="flex-row items-center justify-between px-4 py-4 active:opacity-70"
  >
    <Text className="text-[16px] text-[#202020]">{label}</Text>
    <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
  </Pressable>
);

const Divider = () => <View className="h-[1px] bg-[#ebf3ff]" />;

const Dot = ({ color = "#22C55E" }: { color?: string }) => (
  <View
    style={{
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 8,
      backgroundColor: color,
    }}
  />
);

const Status = ({
  status,
  isVerified,
}: {
  status?: string;
  isVerified?: boolean;
}) => {
  const color =
    status === "ACTIVE"
      ? "#22C55E"
      : status === "BLOCKED"
      ? "#EF4444"
      : "#F59E0B";
  const verifiedText = isVerified ? "Verified" : "Not Verified";
  const text = `${status ?? "—"} · ${verifiedText}`;
  return (
    <View className="flex-row items-center mt-2">
      <Dot color={color} />
      <Text className="text-[14px] text-[#202020]">{text}</Text>
    </View>
  );
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = "#3B82F6",
  isBlue = false,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  isBlue?: boolean;
}) => (
  <View
    className={`${
      isBlue ? "bg-blue-50" : "bg-white"
    } rounded-2xl p-5 flex-1 mx-1 border border-blue-200`}
    style={{
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    }}
  >
    <View className="items-center">
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
        style={{ backgroundColor: isBlue ? "#3B82F6" : "#F1F5F9" }}
      >
        <Ionicons
          name={icon as any}
          size={24}
          color={isBlue ? "white" : iconColor}
        />
      </View>
      <Text
        className={`text-2xl font-bold ${
          isBlue ? "text-blue-900" : "text-gray-900"
        } mb-1`}
      >
        {value}
      </Text>
      <Text
        className={`text-sm ${
          isBlue ? "text-blue-700" : "text-gray-600"
        } text-center`}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          className={`text-xs ${
            isBlue ? "text-blue-600" : "text-gray-500"
          } text-center mt-1`}
        >
          {subtitle}
        </Text>
      )}
    </View>
  </View>
);

const SquareCard = ({
  title,
  value,
  icon,
  color = "#3B82F6",
}: {
  title: string;
  value: string;
  icon: string;
  color?: string;
}) => (
  <View
    className="bg-white rounded-2xl p-4 flex-1 mx-1 aspect-square justify-center border border-blue-200"
    style={{
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    }}
  >
    <View className="items-center">
      <View
        className="w-10 h-10 rounded-2xl items-center justify-center mb-3"
        style={{ backgroundColor: `${color}15` }}
      >
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text className="text-sm font-bold text-gray-900 text-center mb-1">
        {value}
      </Text>
      <Text className="text-[10px] text-gray-600 text-center leading-tight">
        {title}
      </Text>
    </View>
  </View>
);

const SkeletonCard = ({ isSquare = false }: { isSquare?: boolean }) => (
  <View
    className={`bg-white rounded-2xl border border-blue-200 ${
      isSquare ? "p-4 flex-1 mx-1 aspect-square" : "p-5 flex-1 mx-1"
    }`}
    style={{
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    }}
  >
    <View className="items-center">
      <View className="w-12 h-12 rounded-2xl bg-gray-200 mb-3" />
      <View className="w-16 h-6 bg-gray-200 rounded mb-1" />
      <View className="w-20 h-4 bg-gray-200 rounded" />
    </View>
  </View>
);

export default function Profile() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, name, email, isLoading, isError, refetch } = useCurrentUser();
  const userId = user?.id;

  // Get eSIM stats from backend
  const {
    data: esimStats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useGetEsimStatsQuery(userId!, {
    skip: !userId,
    refetchOnMountOrArgChange: true,
  });

  // Get Credits balance
  const {
    data: creditsData,
    isLoading: creditsLoading,
    refetch: refetchCredits,
  } = useGetCreditsBalanceQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Refetch all data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        refetch();
        refetchStats();
        refetchCredits();
      }
    }, [userId, refetch, refetchStats, refetchCredits])
  );

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    refetch();
    refetchStats();
    refetchCredits();
  }, [refetch, refetchStats, refetchCredits]);

  const isRefreshing = isLoading || statsLoading || creditsLoading;

  const handleLogout = () => {
    Alert.alert(
      t("profile.menu.logout"),
      t("profile.logoutConfirm"),
      [
        {
          text: t("modal.close"),
          style: "cancel",
        },
        {
          text: t("profile.menu.logout"),
          style: "destructive",
          onPress: async () => {
            try {
              await logout().unwrap();
              // Clear Redux auth state
              dispatch(logOut());
              router.replace("/auth/login");
            } catch (error) {
              console.error("Logout error:", error);
              // Still clear state and redirect even if API fails
              dispatch(logOut());
              router.replace("/auth/login");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="flex-1 bg-white">
      <Header />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <Text className="text-[28px] text-gray-900 font-medium mb-6">
          My Account
        </Text>

        {/* User Profile Card */}
        <View
          className="bg-white rounded-2xl p-5 mb-6 border border-blue-200"
          style={{
            shadowOpacity: 0.1,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-[20px] text-gray-900 font-bold mb-1">
                {name}
              </Text>
              <Text className="text-[15px] text-gray-600 mb-3">{email}</Text>
              <Status status={user?.status} isVerified={user?.is_verified} />
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color="#3B82F6" />
            ) : isError ? (
              <Pressable
                onPress={refetch}
                className="bg-red-50 px-3 py-2 rounded-lg"
              >
                <Text className="text-[12px] text-red-600 font-medium">
                  {t("profile.errors.retry")}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Main Statistics Card */}
        {statsLoading ? (
          <View className="flex-row mb-6">
            <SkeletonCard />
          </View>
        ) : statsError ? (
          <View className="bg-red-50 rounded-2xl p-4 mb-6">
            <Text className="text-red-600 text-center mb-2">
              {t("profile.errors.loadError")}
            </Text>
            <Pressable
              onPress={refetchStats}
              className="bg-red-100 px-4 py-2 rounded-lg self-center"
            >
              <Text className="text-red-700 font-medium">
                {t("profile.errors.retry")}
              </Text>
            </Pressable>
          </View>
        ) : esimStats ? (
          <>
            {/* Stats Cards Row */}
            <View className="flex-row mb-6">
              <StatCard
                title="eSIMs"
                value={`${esimStats.totalEsims} eSIM`}
                subtitle={`Total purchases\n${formatCurrencyEUR(
                  esimStats.totalSpent
                )} spent`}
                icon="bag-handle"
                iconColor="#10B981"
              />
              <StatCard
                title="Credits"
                value={formatCurrencyEUR(creditsData?.balance ?? 0)}
                subtitle={t("profile.cards.walletBalance")}
                icon="wallet"
                iconColor="#8B5CF6"
              />
            </View>

            {/* Square Cards Row */}
            <View className="flex-row mb-6">
              <SquareCard
                title={t("profile.cards.lastEsim")}
                value={formatPackageName(esimStats.lastEsim)}
                icon="phone-portrait"
                color="#F59E0B"
              />
              <SquareCard
                title={t("profile.cards.secondLastEsim")}
                value={formatPackageName(esimStats.secondLastEsim)}
                icon="tablet-portrait"
                color="#10B981"
              />
              <SquareCard
                title={t("profile.cards.activeEsims")}
                value={esimStats.activeEsims.toString()}
                icon="cellular"
                color="#8B5CF6"
              />
            </View>
          </>
        ) : null}

        {/* Menu Options */}
        <View
          className="bg-white rounded-2xl overflow-hidden border border-blue-200"
          style={{
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        >
          <Row
            label="My Orders"
            onPress={() => router.push("/profile/purchases")}
          />
          <Divider />
          <Row
            label="Sign Out"
            onPress={isLoggingOut ? undefined : handleLogout}
          />
        </View>
      </ScrollView>
    </View>
  );
}
