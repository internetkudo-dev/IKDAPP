import { useCurrentUser } from "@/hooks/useCurrentUser";
import { CardField, useConfirmPayment } from "@stripe/stripe-react-native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCancelOrderMutation } from "../store/odersApi.slice";
import {
  useConfirmPaymentMutation,
  useCreatePaymentIntentMutation,
} from "@/store/paymentsApi.slice"; // ⬅️ adjust to your slice path
import Header from "./components/header"; // ⬅️ if this path is wrong, try: "../../components/header"
import SuccessModal from "./components/SuccessModal";

export default function Checkout() {
  const { t } = useTranslation();
  const { user } = useCurrentUser() || {};
  const userName = user?.name;
  const currentEmail = user?.email;
  const {
    orderId,
    amount = "0",
    currency = "EUR",
    email = currentEmail || "user@example.com",
    planTitle = "Your plan",
    dataText = "—",
    creditsApplied = "0",
    cashbackToAccrue = "0",
  } = useLocalSearchParams();

  // RTK Query hooks
  const [createPaymentIntent, { isLoading: creating }] =
    useCreatePaymentIntentMutation();
  const [confirmPaymentOnServer, { isLoading: confirmingServer }] =
    useConfirmPaymentMutation();
  const [cancelOrder] = useCancelOrderMutation();

  // Stripe SDK confirm
  const { confirmPayment, loading: confirmingClient } = useConfirmPayment();

  // UI state
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardComplete, setCardComplete] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentBreakdown, setPaymentBreakdown] = useState<{
    creditsUsed: number;
    amountPaid: number;
    cashbackEarned: number;
  } | null>(null);

  // client secret cache
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Track if payment was completed successfully
  const paymentCompletedRef = useRef(false);

  const disabled = useMemo(
    () =>
      creating ||
      confirmingClient ||
      confirmingServer ||
      !cardComplete ||
      !nameOnCard.trim(),
    [creating, confirmingClient, confirmingServer, cardComplete, nameOnCard]
  );

  // Cleanup: Cancel pending order if user leaves without completing payment
  useEffect(() => {
    return () => {
      // Only cancel if payment was not completed
      if (!paymentCompletedRef.current && orderId) {
        // Cancel order in background (no need to await)
        cancelOrder(String(orderId)).catch((error: any) => {
          console.log("Failed to cancel order on unmount:", error);
        });
      }
    };
  }, [orderId, cancelOrder]);

  const ensureIntent = async () => {
    if (clientSecret && paymentIntentId)
      return { clientSecret, paymentIntentId };
    const data = await createPaymentIntent({
      orderId: String(orderId),
      amount: Number(amount),
      currency: String(currency),
    }).unwrap();
    setClientSecret(data.clientSecret);
    setPaymentIntentId(data.paymentIntentId);
    return data;
  };

  const pay = async () => {
    try {
      const { clientSecret: secret, paymentIntentId: piId } =
        await ensureIntent();

      const { error } = await confirmPayment(secret, {
        paymentMethodType: "Card",
        paymentMethodData: {
          billingDetails: {
            email: String(email),
            name: nameOnCard,
          },
        },
      });

      if (error) {
        Alert.alert(t("checkout.paymentFailed"), error.message);
        return;
      }

      const result = await confirmPaymentOnServer({
        paymentIntentId: piId,
      }).unwrap();
      if (result.success) {
        // Mark payment as completed to prevent cancellation
        paymentCompletedRef.current = true;

        // Extract payment breakdown - use params passed from review screen
        setPaymentBreakdown({
          creditsUsed: parseFloat(String(creditsApplied)),
          amountPaid: Number(amount),
          cashbackEarned: parseFloat(String(cashbackToAccrue)),
        });

        // Show success modal first
        setShowSuccessModal(true);
        return;
      } else {
        Alert.alert(
          t("checkout.paymentError"),
          result?.paymentStatus || t("checkout.orderCompletionError")
        );
      }
    } catch (e: any) {
      Alert.alert(
        t("checkout.paymentError"),
        e?.data?.message || e?.message || t("checkout.unknownError")
      );
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Navigate to myEsims after modal is closed
    router.replace({
      pathname: "/myEsims",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Your header bar */}
      <Header userName={userName} showBackButton={true} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 12, android: 0 })}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Summary card */}
          <View className="mt-4 bg-white rounded-2xl border border-gray-200 px-4 py-4">
            <Text className="text-[15px] text-gray-700" numberOfLines={2}>
              {String(planTitle)}
            </Text>

            <Text className="text-[13px] text-gray-500 mt-1">
              {String(dataText)} Data
            </Text>

            <View className="mt-2 flex-row items-end justify-between">
              <Text className="text-[30px] font-extrabold text-[#004FFE]">
                {currencySymbol(String(currency))}
                {Number(amount).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Email (readonly) */}
          <View className="mt-5">
            <Label> Email </Label>
            <View className="bg-gray-100 rounded-xl border border-gray-200 px-3 py-3">
              <Text className="text-gray-900">{String(email)}</Text>
            </View>
          </View>

          {/* Payment method */}
          <View className="mt-6">
            <Text className="text-base font-bold text-gray-900 mb-3">
              {t("checkout.cardDetails")}
            </Text>

            <Label> {t("checkout.cardInformation")} </Label>
            <View className="bg-white rounded-xl border border-gray-200 p-1 mb-3">
              <CardField
                postalCodeEnabled={false}
                style={{ height: 50, width: "100%" }} // Stripe doesn't support className
                placeholders={{ number: "4242 4242 4242 4242" }}
                onCardChange={(c) => setCardComplete(Boolean(c.complete))}
                cardStyle={{
                  backgroundColor: "#FFFFFF",
                  textColor: "#111827",
                  borderRadius: 12,
                  borderColor: "#E5E7EB",
                  borderWidth: 1,
                  fontSize: 16,
                }}
              />
            </View>

            <Label> {t("checkout.nameOnCard")} </Label>
            <TextInput
              placeholder={t("checkout.nameOnCardPlaceholder")}
              value={nameOnCard}
              onChangeText={setNameOnCard}
              autoCapitalize="words"
              className="bg-white rounded-xl border border-gray-200 px-3 py-3"
            />
          </View>

          {/* Pay button */}
          <TouchableOpacity
            onPress={pay}
            disabled={disabled}
            className={`mt-6 rounded-xl py-4 items-center ${disabled ? "bg-blue-300" : "bg-[#004FFE]"
              }`}
            activeOpacity={0.9}
          >
            {creating || confirmingClient || confirmingServer ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-[16px]">
                {t("checkout.payButton")}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        creditsUsed={paymentBreakdown?.creditsUsed}
        amountPaid={paymentBreakdown?.amountPaid}
        cashbackEarned={paymentBreakdown?.cashbackEarned}
        currency={String(currency)}
      />
    </SafeAreaView>
  );
}

/** Small helper label with consistent style */
function Label({ children }: { children: React.ReactNode }) {
  return <Text className="text-gray-500 mb-1">{children}</Text>;
}

function currencySymbol(code: string) {
  const c = code?.toUpperCase?.() || "EUR";
  if (c === "USD") return "$";
  if (c === "EUR") return "€";
  if (c === "GBP") return "£";
  return `${c} `;
}
