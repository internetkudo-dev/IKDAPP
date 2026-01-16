import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Animated, Modal, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  creditsUsed?: number;
  amountPaid?: number;
  cashbackEarned?: number;
  currency?: string;
};

export default function SuccessModal({
  visible,
  onClose,
  title,
  message,
  buttonText,
  creditsUsed = 0,
  amountPaid = 0,
  cashbackEarned = 0,
  currency = "EUR",
}: Props) {
  const { t } = useTranslation();
  const scaleValue = React.useRef(new Animated.Value(0)).current;

  // Use translations as defaults, but allow props to override
  const displayTitle = title || t("successModal.title");
  const displayMessage = message || t("successModal.message");
  const displayButtonText = buttonText || t("successModal.buttonText");

  const formatCurrency = (amount: number): string => {
    const symbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : "€";
    return `${symbol}${amount.toFixed(2)}`;
  };

  const hasPaymentBreakdown =
    creditsUsed > 0 || amountPaid > 0 || cashbackEarned > 0;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleValue }],
            backgroundColor: "white",
            borderRadius: 24,
            padding: 40,
            marginHorizontal: 20,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 10,
            },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
            width: 350,
            minHeight: 400,
          }}
        >
          {/* Success Icon */}
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "#10B981",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            <Ionicons name="checkmark" size={50} color="white" />
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: "#202020",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            {displayTitle}
          </Text>

          {/* Message */}
          <Text
            style={{
              fontSize: 18,
              color: "#6B7280",
              textAlign: "center",
              lineHeight: 26,
              marginBottom: hasPaymentBreakdown ? 24 : 40,
              paddingHorizontal: 10,
            }}
          >
            {displayMessage}
          </Text>

          {/* Payment Breakdown */}
          {hasPaymentBreakdown && (
            <View
              style={{
                width: "100%",
                backgroundColor: "#F9FAFB",
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                gap: 12,
              }}
            >
              {creditsUsed > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                      name="wallet"
                      size={18}
                      color="#F59E0B"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: 15,
                        color: "#374151",
                        fontWeight: "500",
                      }}
                    >
                      {t("successModalPayment.creditsUsed")}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#F59E0B",
                    }}
                  >
                    {formatCurrency(creditsUsed)}
                  </Text>
                </View>
              )}

              {amountPaid > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                      name="card"
                      size={18}
                      color="#004FFE"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: 15,
                        color: "#374151",
                        fontWeight: "500",
                      }}
                    >
                      {t("successModalPayment.amountPaid")}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#004FFE",
                    }}
                  >
                    {formatCurrency(amountPaid)}
                  </Text>
                </View>
              )}

              {cashbackEarned > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: "#E5E7EB",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                      name="gift"
                      size={18}
                      color="#10B981"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: 15,
                        color: "#374151",
                        fontWeight: "500",
                      }}
                    >
                      {t("successModalPayment.cashbackEarned")}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#10B981",
                    }}
                  >
                    + {formatCurrency(cashbackEarned)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "#004FFE",
              borderRadius: 16,
              paddingVertical: 18,
              paddingHorizontal: 40,
              minWidth: 200,
              alignItems: "center",
            }}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              {displayButtonText}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
