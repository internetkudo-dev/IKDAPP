import { IndividualUsageData } from "@/store/odersApi.slice";
import { regionFlagCode } from "@/utils/esim";
import { extractCountryCode, getCountryFlagUrl } from "@/utils/esimUtils";
import { formatPackageName } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TopUpHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  individualUsage: IndividualUsageData[];
  title?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function TopUpHistoryModal({
  visible,
  onClose,
  individualUsage,
  title,
}: TopUpHistoryModalProps) {
  const { t } = useTranslation();
  const displayTitle = title || t("topUpHistory.title");

  // Helper function to format data with proper units (same as activeEsimCard)
  const formatData = (bytes: number) => {
    if (bytes === 0) return { value: 0, unit: "MB", display: "0 MB" };

    const gb = bytes / (1024 * 1024 * 1024);
    const mb = bytes / (1024 * 1024);

    if (gb >= 1) {
      return {
        value: gb,
        unit: "GB",
        display: `${gb.toFixed(1)} GB`,
      };
    } else {
      return {
        value: mb,
        unit: "MB",
        display: `${mb.toFixed(0)} MB`,
      };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
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
            <Text style={styles.title} numberOfLines={2}>
              {displayTitle}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {individualUsage && individualUsage.length > 0 ? (
              individualUsage.map(
                (topup: IndividualUsageData, index: number) => {
                  // Use the same logic as useEsimData - formatPackageName handles everything
                  const displayName = topup.packageTemplateName
                    ? formatPackageName(topup.packageTemplateName)
                    : t("topUpHistory.unknownPackage");

                  let countryCode = "xx";
                  if (topup.packageTemplateName) {
                    countryCode =
                      extractCountryCode(topup.packageTemplateName) ||
                      regionFlagCode(topup.packageTemplateName) ||
                      "xx";
                  }
                  const flagUrl = getCountryFlagUrl(countryCode);

                  // Calculate data amounts
                  const totalData = formatData(topup.totalDataAllowed);
                  const usedData = formatData(topup.totalDataUsed);
                  const remainingData = formatData(topup.totalDataRemaining);

                  // Calculate usage percentage
                  const usagePercentage =
                    topup.totalDataAllowed > 0
                      ? Math.round(
                          (topup.totalDataUsed / topup.totalDataAllowed) * 100
                        )
                      : 0;

                  // Determine status
                  const isActive = topup.isActive;
                  const status = isActive ? "Active" : "Inactive";

                  // Format date - use lastUsageDate if available, otherwise null
                  const displayDate = topup.lastUsageDate
                    ? new Date(topup.lastUsageDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : null;

                  return (
                    <View key={index} style={styles.topupCard}>
                      <View style={styles.topupHeader}>
                        <Image
                          source={{ uri: flagUrl }}
                          style={styles.countryFlag}
                        />
                        <View style={styles.topupInfo}>
                          <Text style={styles.topupCountry}>{displayName}</Text>
                          <Text style={styles.topupData}>
                            {totalData.display} Package
                          </Text>
                          <Text style={styles.topupDate}>
                            {t("topUpHistory.lastUsed")}{" "}
                            {displayDate || t("topUpHistory.never")}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: isActive ? "#10B981" : "#EF4444",
                            },
                          ]}
                        >
                          <Text style={styles.statusText}>{status}</Text>
                        </View>
                      </View>

                      <View style={styles.usageInfo}>
                        <Text style={styles.usageText}>
                          {t("topUpHistory.used")}: {usedData.display} •{" "}
                          {t("myEsims.remaining")}: {remainingData.display}
                        </Text>

                        {/* Progress Bar */}
                        <View style={styles.progressBarContainer}>
                          <View style={styles.progressBar}>
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  width: `${Math.min(usagePercentage, 100)}%`,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {usagePercentage}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                }
              )
            ) : (
              <View style={styles.noTopupsContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={48}
                  color="#9CA3AF"
                />
                <Text style={styles.noTopupsText}>No top-ups yet</Text>
                <Text style={styles.noTopupsSubtext}>
                  Top-ups will appear here once you add data packages
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.closeActionButton}
              onPress={onClose}
            >
              <Text style={styles.closeActionButtonText}>Mbyll</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 0, // Ensure no horizontal padding
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
    borderRadius: 20,
    marginHorizontal: 16, // More margin for better spacing
    width: screenWidth - 32, // Full width minus proper margins
    maxHeight: screenHeight - 80,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 0,
    paddingTop: 0,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingHorizontal: 24,
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
  // Top-up History Styles
  topupCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  topupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  countryFlag: {
    width: 32,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
  },
  topupInfo: {
    flex: 1,
  },
  topupCountry: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  topupData: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  topupDate: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  usageInfo: {
    marginTop: 8,
  },
  usageText: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 8,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#004FFE",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
    minWidth: 32,
    textAlign: "right",
  },
  noTopupsContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noTopupsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
    marginTop: 12,
    marginBottom: 4,
  },
  noTopupsSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
  // Action Buttons
  actionButtonsContainer: {
    flexDirection: "row",
    padding: 24,
    paddingTop: 16,
    gap: 12,
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
