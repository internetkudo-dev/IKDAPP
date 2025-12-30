import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import AuthGuard from "../components/auth/authGuard";

const COLORS = {
  primary: "#0B449C",
  accent: "#004FFE",
  muted: "#A8B5DB",
  chipBg: "#FFFFFF",
};

const ICONS = {
  index: require("../../assets/images/home.png"),
  myEsims: require("../../assets/images/esim.png"),
  help: require("../../assets/images/help.png"),
  profile: require("../../assets/images/profile.png"),
} as const;

const TITLES: Record<string, string> = {
  index: "Home",
  myEsims: "My eSIMs",
  help: "Help",
  profile: "Profile",
};

function TabItem({
  focused,
  icon,
  label,
}: {
  focused: boolean;
  icon: any;
  label: string;
}) {
  if (focused) {
    return (
      <View
        style={{
          backgroundColor: COLORS.chipBg,
          paddingHorizontal: 14,
          height: 40,
          borderRadius: 999,
          alignItems: "center",
          flexDirection: "row",
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}
      >
        <Image
          source={icon}
          style={{ width: 18, height: 18, tintColor: COLORS.primary }}
          resizeMode="contain"
        />
        <Text
          style={{
            color: COLORS.primary,
            fontWeight: "600",
            fontSize: 14,
            marginLeft: 8,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={icon}
        style={{ width: 18, height: 18, tintColor: COLORS.muted }}
        resizeMode="contain"
      />
    </View>
  );
}

function TaBarContainer({ state, navigation }: any) {
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <View
        style={{
          height: 96,
          borderRadius: 1,
          padding: 2,
          backgroundColor: "#FFFFFF",

          borderTopWidth: 1,
          borderTopColor: "#7FB3FF",

          shadowColor: "#7FB3FF",
          shadowOpacity: 0.5,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -6 },
          elevation: 6,
        }}
      >
        <BlurView
          intensity={35}
          tint="light"
          style={{
            height: "100%",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.85)",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 15,
              height: 80,
              marginBottom: 12,
            }}
          >
            {state.routes.map((route: any, index: number) => {
              const isFocused = state.index === index;
              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              return (
                <Pressable
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  onPress={onPress}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 30,
                  }}
                  android_ripple={{
                    color: "#00000014",
                    borderless: false,
                    radius: 28,
                  }}
                >
                  <TabItem
                    focused={isFocused}
                    icon={ICONS[route.name as keyof typeof ICONS]}
                    label={TITLES[route.name] ?? route.name}
                  />
                </Pressable>
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

export default function Layout() {
  return (
    <AuthGuard>
      <Tabs
        tabBar={(props) => <TaBarContainer {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { display: "none" },
        }}
      >
        <Tabs.Screen name="index" options={{ title: TITLES.index }} />
        <Tabs.Screen name="myEsims" options={{ title: TITLES.myEsims }} />
        <Tabs.Screen name="help" options={{ title: TITLES.help }} />
        <Tabs.Screen name="profile" options={{ title: TITLES.profile }} />
      </Tabs>
    </AuthGuard>
  );
}
