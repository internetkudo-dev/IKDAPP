import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

import { OrderResponse } from "@/store/odersApi.slice";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  qrValue: string;
  title?: string;
  order?: OrderResponse; // Add order data to access usage.individualUsage
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function QRCodeModal({
  visible,
  onClose,
  qrValue,
  title,
  order,
}: QRCodeModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />

      {/* Background blur overlay */}
      <BlurView intensity={20} style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title || t("qrModal.title")}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollContent}
          >
            {/* QR Code Container */}
            <View style={styles.qrContainer}>
              <View style={styles.qrWrapper}>
                <QRCode
                  value={qrValue}
                  size={260}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                  quietZone={15}
                />
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <View style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.instructionText}>
                  {t("qrModal.instructions.step1")}
                </Text>
              </View>

              <View style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.instructionText}>
                  {t("qrModal.instructions.step2")}
                </Text>
              </View>

              <View style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.instructionText}>
                  {t("qrModal.instructions.step3")}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {order?.subscriberId ? (
              <TouchableOpacity
                style={styles.topupButton}
                onPress={() => {
                  onClose();
                  router.push({
                    pathname: "/topupPage",
                    params: {
                      subscriberId: order.subscriberId,
                      esimId: order.esimId || "",
                    },
                  });
                }}
              >
                <Ionicons
                  name="add-circle"
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.topupButtonText}>Top Up</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.closeActionButton}
              onPress={onClose}
            >
              <Text style={styles.closeActionButtonText}>
                {t("qrModal.closeButton")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginHorizontal: 8,
    maxWidth: screenWidth - 16,
    maxHeight: screenHeight - 200, // Reduced height since no top-up history
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingBottom: 0,
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    marginRight: 16,
    lineHeight: 26,
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginTop: -4, // Align with title baseline
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  qrWrapper: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  instructionsContainer: {
    marginBottom: 32,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#004FFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  // Action Buttons
  actionButtonsContainer: {
    flexDirection: "row",
    padding: 28,
    paddingTop: 16,
    gap: 12,
  },
  topupButton: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    flex: 1,
  },
  topupButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
  closeActionButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    flex: 1,
  },
  closeActionButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
});
