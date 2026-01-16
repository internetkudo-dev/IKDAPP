import { StripeProvider } from "@stripe/stripe-react-native";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";
import "./globals.css";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <StripeProvider
          publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
          // Optional for later: Apple Pay, 3DS return:
          merchantIdentifier="merchant.com.your.bundle"
          urlScheme="yourapp"
        >
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" />
            {/* <Stack.Screen name="country/[id]" /> */}
            {/* <Stack.Screen name="auth" /> */}
            <Stack.Screen name="esimOffers" />
          </Stack>
        </StripeProvider>
      </I18nextProvider>
    </Provider>
  );
}
