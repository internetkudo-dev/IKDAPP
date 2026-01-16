import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useCompleteWithCreditsMutation,
  useCreateOrderMutation,
  useGetCreditsBalanceQuery,
  usePricePreviewMutation,
  useValidatePromoCodeMutation,
} from "@/store/odersApi.slice";
import { getCountryFlagUrl } from "../utils/esimUtils";
import Header from "@/components/header";
import SuccessModal from "@/components/SuccessModal";

// Brand colors - blue-ish theme
const BRAND_COLORS = {
  primary: "#004FFE", // Blue primary
  primaryDark: "#0040CC",
  green: "#059669", // Keep for cashback only
  error: "#EF4444",
  gray: "#6B7280",
  lightGray: "#F9FAFB",
  border: "#E5E7EB",
};

// ErrorBoundary to catch and log errors
class ScreenErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error?: Error }
> {
  state = { error: undefined };

  static getDerivedStateFromError(error: Error | unknown) {
    return { error: error as Error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("[ReviewRewards ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text style={{ color: "red", marginBottom: 10 }}>
            Error Loading Screen:
          </Text>
          <Text testID="review-rewards-error">
            {String((this.state.error as Error)?.message || this.state.error)}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function ReviewRewardsContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  // RTK Query hooks
  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateOrderMutation();
  const [validatePromo, { isLoading: isValidating }] =
    useValidatePromoCodeMutation();
  const [pricePreview, { isLoading: isPreviewing }] = usePricePreviewMutation();
  const [completeWithCredits, { isLoading: isCompletingWithCredits }] =
    useCompleteWithCreditsMutation();
  const { data: creditsBalance } = useGetCreditsBalanceQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Combined loading state for button
  const isProcessing = isCreatingOrder || isCompletingWithCredits;

  // Parse params - no orderId yet, it will be created on "Continue to Payment"
  const planName = (params.planName as string) || "Global 13 GB";
  const subtotal = parseFloat((params.orderTotal as string) || "41.99");
  const packageTemplateId = params.packageTemplateId as string;
  const currency = (params.currency as string) || "EUR";

  // Extract country code from plan name for flag (e.g., "Albania 1GB" -> "al")
  const getCountryCode = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("albania") || lowerName.includes("shqiperia"))
      return "al";
    if (lowerName.includes("austria")) return "at";
    if (lowerName.includes("italy") || lowerName.includes("italia"))
      return "it";
    if (lowerName.includes("turkey") || lowerName.includes("turqi"))
      return "tr";
    // Add more country mappings as needed
    return "";
  };

  const countryCode = getCountryCode(planName);
  const flagUrl = countryCode ? getCountryFlagUrl(countryCode) : null;

  // State
  const [selectedReward, setSelectedReward] = useState<
    "NONE" | "CASHBACK_10" | "DISCOUNT_3"
  >("NONE");
  const [promoModalVisible, setPromoModalVisible] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [validatedPromoCode, setValidatedPromoCode] = useState<string | null>(
    null
  );
  const [promoError, setPromoError] = useState("");
  const [useCredits, setUseCredits] = useState(true); // Toggle for credits (ON by default)
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    creditsUsed: number;
    cashbackEarned: number;
  } | null>(null);

  // Pricing preview from backend
  const [preview, setPreview] = useState<any>(null);

  // Calculate credits to use based on toggle and available balance
  const creditsToUse = React.useMemo(() => {
    if (!useCredits || !creditsBalance) return 0;

    // Calculate total after promo/reward (but before credits)
    // We'll use the preview if available, otherwise estimate
    const totalAfterDiscounts = preview?.total_amount || subtotal;

    // Use minimum of: available credits OR amount due
    return Math.min(creditsBalance.balance, totalAfterDiscounts);
  }, [useCredits, creditsBalance, preview?.total_amount, subtotal]);

  // Fetch price preview on mount and when pricing inputs change
  useEffect(() => {
    let isMounted = true;

    const fetchPreview = async () => {
      try {
        const result = await pricePreview({
          subtotal,
          currency,
          promoCode: validatedPromoCode || undefined,
          rewardType: selectedReward,
          creditsToUse,
        }).unwrap();

        if (isMounted) {
          setPreview(result);
        }
      } catch (error: any) {
        console.error("Price preview error:", error);
        // Fallback to simple calculations if preview fails
        if (isMounted) {
          setPreview({
            subtotal,
            total_amount: subtotal,
            amount_due: subtotal,
            discount_from_promo: 0,
            discount_from_reward: 0,
            cashback_to_accrue: 0,
            credits_applied: 0,
            available_credits: creditsBalance?.balance || 0,
          });
        }
      }
    };

    if (subtotal > 0) {
      fetchPreview();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validatedPromoCode, selectedReward, creditsToUse]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    const normalizedCode = promoCode.trim().toUpperCase();
    setPromoError("");

    try {
      // Validate the promo code (no order needed yet)
      const result = await validatePromo({ code: normalizedCode }).unwrap();

      if (!result.valid) {
        // Show backend error message and keep modal open
        setPromoError(result.message || "Invalid promo code");
        return;
      }

      // Validation passed - set the code (preview will auto-update via useEffect)
      setValidatedPromoCode(normalizedCode);

      // Close modal and clear input
      setPromoModalVisible(false);
      setPromoCode("");
    } catch (error: any) {
      console.error("Promo validation error:", error);
      setPromoError(
        error?.data?.message ||
        error?.message ||
        "Couldn't validate promo code. Please try again."
      );
    }
  };

  const handleRemovePromo = () => {
    // Clear the validated promo code (preview will auto-update via useEffect)
    setValidatedPromoCode(null);
  };

  const handleContinueToPayment = async () => {
    if (isProcessing) return; // Prevent double-tap

    // Ensure preview is loaded
    if (!preview) {
      Alert.alert(t("errors.pleaseWait"), t("errors.calculatingPricing"));
      return;
    }

    try {
      // Step 1: Create the order with promo/reward/credits already included
      const order = await createOrder({
        packageTemplateId,
        orderType: "one_time",
        amount: subtotal,
        currency,
        promoCode: validatedPromoCode || undefined,
        rewardType: selectedReward,
        creditsToUse,
      }).unwrap();

      // CRITICAL: Use preview.amount_due (includes all discounts)
      const finalAmountDue = preview.amount_due;

      // Step 2: Check if order is fully paid with credits
      if (finalAmountDue === 0) {
        // Complete order with credits (no Stripe needed)
        try {
          await completeWithCredits(order.id).unwrap();

          // Show success modal with payment breakdown
          const creditsUsedAmount = preview.credits_applied || 0;
          const cashbackAmount = preview.cashback_to_accrue || 0;

          setSuccessData({
            creditsUsed: creditsUsedAmount,
            cashbackEarned: cashbackAmount,
          });
          setShowSuccessModal(true);
          return;
        } catch (creditError: any) {
          // Check if it's a 409 (insufficient credits) - fallback to Stripe
          if (
            creditError?.status === 409 &&
            creditError?.data?.requires_external_payment
          ) {
            // Navigate to Stripe with the actual amount due
            const actualAmountDue = parseFloat(
              creditError.data.amount_due || finalAmountDue
            );

            router.push({
              pathname: "/checkout",
              params: {
                orderId: order.id,
                amount: String(actualAmountDue),
                currency: order.currency || currency,
                email: params.email || "",
                planTitle: params.planTitle || planName,
                dataText: params.dataText || "",
                creditsApplied: String(creditError.data.available_credits || 0),
                cashbackToAccrue: String(preview.cashback_to_accrue || 0),
              },
            });
            return;
          }

          // Other errors - show error message
          Alert.alert(
            t("errors.paymentError"),
            creditError?.data?.message ||
            creditError?.message ||
            t("errors.failedToCompleteOrder"),
            [{ text: t("errors.ok") }]
          );
          return;
        }
      }

      // Step 3: Navigate to Stripe checkout with the DISCOUNTED amount
      router.push({
        pathname: "/checkout",
        params: {
          orderId: order.id,
          amount: String(finalAmountDue), // ← KEY FIX: Use discounted amount from preview
          currency: order.currency || currency,
          email: params.email || "",
          planTitle: params.planTitle || planName,
          dataText: params.dataText || "",
          creditsApplied: String(preview.credits_applied || 0),
          cashbackToAccrue: String(preview.cashback_to_accrue || 0),
        },
      });
    } catch (error: any) {
      console.error("Order creation error:", error);
      Alert.alert(
        t("reviewRewards.orderErrorTitle"),
        error?.data?.message ||
        error?.message ||
        t("errors.failedToCreateOrder"),
        [{ text: t("errors.ok") }]
      );
    }
  };

  const formatCurrency = (amount: number): string => {
    if (typeof amount !== "number" || isNaN(amount)) {
      return "€0.00";
    }
    return `€${amount.toFixed(2)}`;
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
    // Navigate to My eSIMs
    router.push("/(tabs)/myEsims");
  };

  // Show loading state while preview is being fetched
  if (!preview && isPreviewing) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="dark" />
        <Header
          showBackButton={true}
          showUserArea={false}
          showLanguageSwitcher={false}
        />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={BRAND_COLORS.primary} />
          <Text style={{ marginTop: 16, color: BRAND_COLORS.gray }}>
            Calculating pricing...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar style="dark" />

      {/* Header - Using shared component */}
      <Header
        showBackButton={true}
        showUserArea={false}
        showLanguageSwitcher={true}
      />

      {/* Page Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>{t("reviewRewards.title")}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plan Header with Flag */}
        <View style={styles.planHeader}>
          <View style={styles.planInfo}>
            <View style={styles.planIcon}>
              {flagUrl ? (
                <Image
                  source={{ uri: flagUrl }}
                  style={styles.flagImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons
                  name="globe-outline"
                  size={24}
                  color={BRAND_COLORS.primary}
                />
              )}
            </View>
            <Text style={styles.planName}>{planName}</Text>
          </View>
          <Text style={styles.planPrice}>{formatCurrency(subtotal)}</Text>
        </View>

        {/* Use Credits */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons
                name="wallet-outline"
                size={20}
                color={BRAND_COLORS.primary}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.cardTitle}>
                {t("reviewRewards.useCredits")}
              </Text>
              <TouchableOpacity
                accessibilityLabel="Credits info"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={BRAND_COLORS.gray}
                />
              </TouchableOpacity>
            </View>
            <Switch
              value={useCredits}
              onValueChange={setUseCredits}
              trackColor={{ false: "#D1D5DB", true: BRAND_COLORS.primary }}
              thumbColor="#fff"
              disabled={!creditsBalance || creditsBalance.balance === 0}
            />
          </View>

          {creditsBalance && creditsBalance.balance > 0 ? (
            <View>
              <Text style={styles.creditsBalance}>
                {t("reviewRewards.available")}:{" "}
                {formatCurrency(creditsBalance.balance)}
              </Text>
              {useCredits && preview && preview.credits_applied > 0 && (
                <Text style={styles.creditsApplied}>
                  {t("reviewRewards.using")}{" "}
                  {formatCurrency(preview.credits_applied)}{" "}
                  {t("reviewRewards.credits")}
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.cardSubtext}>
              {formatCurrency(0)} {t("reviewRewards.available").toLowerCase()}
            </Text>
          )}
        </View>

        {/* Choose Your Reward */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("reviewRewards.chooseReward")}
          </Text>

          {/* Cashback Option */}
          <TouchableOpacity
            style={[
              styles.rewardBox,
              selectedReward === "CASHBACK_10" && styles.rewardBoxSelected,
            ]}
            onPress={() => setSelectedReward("CASHBACK_10")}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedReward === "CASHBACK_10" }}
          >
            <View style={styles.rewardHeader}>
              <View style={styles.rewardTitleRow}>
                <View
                  style={[
                    styles.radioCircle,
                    selectedReward === "CASHBACK_10" &&
                    styles.radioCircleSelected,
                  ]}
                >
                  {selectedReward === "CASHBACK_10" && (
                    <View style={styles.radioDot} />
                  )}
                </View>
                <Text style={styles.rewardTitle}>
                  {t("reviewRewards.cashbackTitle")}
                </Text>
              </View>
              <Text style={styles.rewardAmountGreen}>
                {preview
                  ? formatCurrency(preview.cashback_to_accrue)
                  : formatCurrency(0)}
              </Text>
            </View>
            <Text style={styles.rewardSubtext}>
              {t("reviewRewards.cashbackLabel")}
            </Text>
          </TouchableOpacity>

          {/* Discount Option */}
          <TouchableOpacity
            style={[
              styles.rewardBox,
              selectedReward === "DISCOUNT_3" && styles.rewardBoxSelected,
            ]}
            onPress={() => setSelectedReward("DISCOUNT_3")}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedReward === "DISCOUNT_3" }}
          >
            <View style={styles.rewardHeader}>
              <View style={styles.rewardTitleRow}>
                <View
                  style={[
                    styles.radioCircle,
                    selectedReward === "DISCOUNT_3" &&
                    styles.radioCircleSelected,
                  ]}
                >
                  {selectedReward === "DISCOUNT_3" && (
                    <View style={styles.radioDot} />
                  )}
                </View>
                <Text style={styles.rewardTitle}>
                  {t("reviewRewards.discountTitle")}
                </Text>
              </View>
            </View>
            <Text style={styles.rewardSubtext}>
              Instant discount applied now
            </Text>
            <Text style={styles.rewardSavings}>
              -{" "}
              {preview
                ? formatCurrency(preview.discount_from_reward)
                : formatCurrency(0)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Promo Code */}
        <TouchableOpacity
          style={styles.promoRow}
          onPress={() => setPromoModalVisible(true)}
          accessibilityLabel={
            validatedPromoCode
              ? `${t("reviewRewards.promoCodeApplied")} ${validatedPromoCode}`
              : t("reviewRewards.addPromoCode")
          }
        >
          {validatedPromoCode ? (
            <View style={styles.promoApplied}>
              <View style={styles.promoPill}>
                <Text style={styles.promoCodeText}>{validatedPromoCode}</Text>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRemovePromo();
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel={t("reviewRewards.removePromoCodeLabel")}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={BRAND_COLORS.gray}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.promoLabel}>
                {t("reviewRewards.addPromoCode")}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </>
          )}
        </TouchableOpacity>

        {/* Credits Applied (if any) */}
        {preview && useCredits && preview.credits_applied > 0 && (
          <View style={styles.creditsAppliedRow}>
            <View style={styles.creditsAppliedLabel}>
              <Ionicons
                name="wallet"
                size={16}
                color="#F59E0B"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.creditsAppliedText}>
                {t("reviewRewards.creditsApplied")}
              </Text>
            </View>
            <Text style={styles.creditsAppliedValue}>
              - {formatCurrency(preview.credits_applied)}
            </Text>
          </View>
        )}

        {/* Discount Summary (if any discounts) */}
        {preview && preview.total_discount > 0 && (
          <View style={styles.discountSummary}>
            <Text style={styles.discountLabel}>
              {t("reviewRewards.promoDiscount")}
            </Text>
            <Text style={styles.discountValue}>
              - {formatCurrency(preview.total_discount)}
            </Text>
          </View>
        )}

        {/* Total Amount */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            {t("reviewRewards.totalAmount")}
          </Text>
          <Text style={styles.totalAmount}>
            {preview
              ? formatCurrency(preview.amount_due)
              : formatCurrency(subtotal)}
          </Text>
        </View>
      </ScrollView>

      {/* Continue to Payment Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            isProcessing && styles.continueButtonDisabled,
          ]}
          onPress={handleContinueToPayment}
          disabled={isProcessing}
          accessibilityLabel={t("reviewRewards.continueToPaymentLabel")}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>
              {preview && preview.amount_due === 0
                ? t("reviewRewards.completeOrder")
                : t("reviewRewards.continueToPayment")}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Promo Code Modal */}
      <Modal
        visible={promoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setPromoModalVisible(false);
          setPromoCode("");
          setPromoError("");
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              setPromoModalVisible(false);
              setPromoCode("");
              setPromoError("");
              Keyboard.dismiss();
            }}
          >
            <View
              style={styles.modalContent}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.modalHandle} />

              <Text style={styles.modalTitle}>
                {t("reviewRewards.modalTitle")}
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  {t("reviewRewards.enterCode")}
                </Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, promoError && styles.inputError]}
                    value={promoCode}
                    onChangeText={(text) => {
                      setPromoCode(text);
                      setPromoError("");
                    }}
                    placeholder={t("reviewRewards.enterCodePlaceholder")}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    editable={!isValidating}
                    onSubmitEditing={handleApplyPromo}
                    returnKeyType="done"
                    accessibilityLabel={t("reviewRewards.promoCodeInputLabel")}
                    accessibilityHint={t("reviewRewards.promoCodeInputHint")}
                  />
                  <TouchableOpacity
                    style={[
                      styles.applyButton,
                      (!promoCode.trim() || isValidating) &&
                      styles.applyButtonDisabled,
                    ]}
                    onPress={handleApplyPromo}
                    disabled={!promoCode.trim() || isValidating}
                    accessibilityLabel={t("reviewRewards.applyPromoCodeLabel")}
                    accessibilityState={{
                      disabled: !promoCode.trim() || isValidating,
                    }}
                  >
                    {isValidating ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.applyButtonText}>
                        {t("reviewRewards.apply")}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
                {promoError && (
                  <Text
                    style={styles.errorText}
                    accessibilityLiveRegion="polite"
                    accessibilityRole="alert"
                  >
                    {promoError}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        creditsUsed={successData?.creditsUsed}
        cashbackEarned={successData?.cashbackEarned}
        currency={currency}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // White background
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827", // gray-900
  },
  content: {
    flex: 1,
    padding: 16,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  planInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#EBF5FF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  flagImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  cardSubtext: {
    fontSize: 14,
    color: BRAND_COLORS.gray,
  },
  creditsBalance: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
    marginTop: 4,
  },
  creditsApplied: {
    fontSize: 13,
    color: BRAND_COLORS.gray,
    marginTop: 4,
  },
  creditsAppliedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFBEB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  creditsAppliedLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  creditsAppliedText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#92400E",
  },
  creditsAppliedValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F59E0B",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  discountBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ECFDF5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  discountBannerText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.green,
  },
  rewardBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: BRAND_COLORS.border,
  },
  rewardBoxSelected: {
    borderColor: BRAND_COLORS.primary,
  },
  rewardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  rewardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: BRAND_COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND_COLORS.primary,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  rewardAmountGreen: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.green, // Keep green for cashback
  },
  rewardSubtext: {
    fontSize: 14,
    color: BRAND_COLORS.gray,
    marginLeft: 32,
  },
  rewardSavings: {
    fontSize: 13,
    color: "#9CA3AF",
    marginLeft: 32,
    marginTop: 4,
  },
  promoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  promoLabel: {
    fontSize: 15,
    color: BRAND_COLORS.gray,
  },
  promoApplied: {
    flex: 1,
  },
  promoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EBF5FF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  promoCodeText: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.primary,
  },
  promoNameText: {
    fontSize: 12,
    color: BRAND_COLORS.gray,
    marginTop: 4,
  },
  discountSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  discountLabel: {
    fontSize: 15,
    color: BRAND_COLORS.gray,
  },
  discountValue: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.green,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: BRAND_COLORS.border,
  },
  continueButton: {
    backgroundColor: BRAND_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    minHeight: 300,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 24,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  inputError: {
    borderColor: BRAND_COLORS.error,
  },
  applyButton: {
    backgroundColor: BRAND_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  applyButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  errorText: {
    fontSize: 14,
    color: BRAND_COLORS.error,
    marginTop: 4,
  },
});

// Wrap with ErrorBoundary and Suspense
export default function ReviewRewardsScreen() {
  return (
    <ScreenErrorBoundary>
      <Suspense
        fallback={
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={BRAND_COLORS.primary} />
            <Text style={{ marginTop: 16, color: BRAND_COLORS.gray }}>
              Loading rewards...
            </Text>
          </View>
        }
      >
        <ReviewRewardsContent />
      </Suspense>
    </ScreenErrorBoundary>
  );
}
