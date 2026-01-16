// components/activeEsims/activeEsimCard.tsx
import QRCodeModal from "@/components/QRCodeModal";
import TopUpHistoryModal from "@/components/TopUpHistoryModal";
import { OrderResponse } from "@/store/odersApi.slice";
import { activateEsim } from "@/utils/esimActivationUtils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import RoundedFlag from "../lokal/roundedFlag";

type Props = {
  id: string;
  flag: string;
  title: string;
  used: number;
  usedBytes: number;
  total: number;
  totalBytes: number;
  usedUnit: "MB" | "GB";
  totalUnit: "MB" | "GB";
  daysLeft: number;
  isActive?: boolean;
  order?: OrderResponse; // Full order data for additional details
};

const CARD_H = 520;
const COLLAPSED_H = 80;

const RADIUS = 140;
const STROKE = 14;
const ARC_LEN = Math.PI * RADIUS;

const CENTER_X = 150;
const CENTER_Y = 160;
const START_X = CENTER_X - RADIUS;
const END_X = CENTER_X + RADIUS;

export default function ActiveEsimCard(props: Props) {
  const { t } = useTranslation();
  const {
    id,
    flag,
    title,
    used,
    usedBytes,
    total,
    totalBytes,
    usedUnit,
    totalUnit,
    daysLeft,
    order,
  } = props;
  const isActive = props.isActive ?? daysLeft > 0; // ✅

  const [open, setOpen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showTopUpHistory, setShowTopUpHistory] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isToppingUp, setIsToppingUp] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  // Get the consolidated usage data (total of all packages)
  // This shows the combined usage across all top-ups for this eSIM
  const getHeroEsim = () => {
    if (
      !order?.usage?.individualUsage ||
      order.usage.individualUsage.length === 0
    ) {
      // Fallback to parent usage if no individual usage
      return {
        totalUsed: usedBytes,
        totalAllowed: totalBytes,
        usagePercentage: totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0,
        packageTemplateName: order?.packageTemplate?.packageTemplateName,
        lastSyncedAt: order?.usage?.lastSyncedAt,
        isActive: order?.usage?.isActive,
        status: order?.usage?.status,
      };
    }

    // Use the consolidated usage data from the parent usage object
    // This gives us the total across all packages (original + top-ups)
    const consolidatedUsage = order.usage;
    const totalUsed = Number(consolidatedUsage.totalDataUsed);
    const totalAllowed = Number(consolidatedUsage.totalDataAllowed);
    const usagePercentage =
      totalAllowed > 0 ? (totalUsed / totalAllowed) * 100 : 0;

    return {
      totalUsed,
      totalAllowed,
      usagePercentage,
      packageTemplateName: order?.packageTemplate?.packageTemplateName,
      lastSyncedAt: consolidatedUsage.lastSyncedAt,
      isActive: consolidatedUsage.isActive,
      status: consolidatedUsage.status,
    };
  };

  const individualUsage = getHeroEsim();

  // Helper function to format data with proper units
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

  const usedData = formatData(individualUsage.totalUsed);
  const totalData = formatData(individualUsage.totalAllowed);

  const toggle = useCallback(() => {
    Animated.timing(anim, {
      toValue: open ? 0 : 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start(() => setOpen(!open));
  }, [open]);

  const height = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_H, CARD_H],
  });

  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const arcPath = `M ${START_X} ${CENTER_Y} A ${RADIUS} ${RADIUS} 0 0 1 ${END_X} ${CENTER_Y}`;

  return (
    <Animated.View style={[styles.card, { height }]}>
      {/* Header */}
      <TouchableOpacity activeOpacity={0.8} style={styles.row} onPress={toggle}>
        <RoundedFlag flag={flag} />

        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.dot,
                { backgroundColor: isActive ? "#10B981" : "#EF4444" }, // green/red
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isActive ? "#10B981" : "#EF4444" },
              ]}
            >
              {isActive
                ? t("activeEsimCard.active")
                : t("activeEsimCard.inactive")}
            </Text>

            {/* Top-up indicator next to status */}
            {order?.usage?.individualUsage &&
              order.usage.individualUsage.length > 1 && (
                <View style={styles.topupIndicator}>
                  <Ionicons name="add-circle" size={10} color="#10B981" />
                  <Text style={styles.topupIndicatorText}>
                    Rimbushur {order.usage.individualUsage.length - 1}x
                  </Text>
                </View>
              )}
          </View>
        </View>

        <Animated.View style={{ transform: [{ rotateZ: rotate }] }}>
          <Ionicons name="chevron-down" size={24} color="#202020" />
        </Animated.View>
      </TouchableOpacity>

      {/* Expanded content */}
      <View style={{ alignItems: "center", marginTop: 16 }}>
        {/* Gauge */}
        <Svg width={300} height={160}>
          <Path
            d={arcPath}
            stroke="#E5E7EB"
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={arcPath}
            stroke={isActive ? "#004FFE" : "#EF4444"}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={ARC_LEN}
            strokeDashoffset={
              individualUsage.totalUsed === 0
                ? 0
                : (individualUsage.totalUsed / individualUsage.totalAllowed) *
                ARC_LEN
            }
            strokeLinecap="round"
          />
        </Svg>

        {/* Gauge Text */}
        <View style={styles.gaugeTextWrap}>
          <Text
            style={[styles.used, { color: isActive ? "#202020" : "#EF4444" }]}
          >
            {individualUsage.totalUsed === 0 ? "FULL" : usedData.display}
          </Text>
          <Text style={styles.ofTotal}>
            {individualUsage.totalUsed === 0
              ? `of ${totalData.display}`
              : `of ${totalData.display} ${t("activeEsimCard.used")}`}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {daysLeft} {t("activeEsimCard.daysLeft")}
            </Text>
          </View>
        </View>
      </View>

      {/* Meta info */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="cog" size={24} color="#000" />
          <Text style={styles.metaLabel}>Data only</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="refresh" size={24} color="#000" />
          <Text style={styles.metaLabel}>{t("activeEsimCard.speed")}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time" size={24} color="#000" />
          <Text style={styles.metaLabel}>
            {order?.packageTemplate?.periodDays || 30}{" "}
            {t("activeEsimCard.days")}
          </Text>
        </View>
      </View>

      {/* Additional eSIM details */}
      {order && (
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>{t("activeEsimCard.iccid")}</Text>
            <Text style={styles.detailValue}>
              {order.usage?.individualUsage?.[0]?.iccid || order.iccid || "N/A"}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>
              {t("activeEsimCard.activationCode")}
            </Text>
            <Text style={styles.detailValue}>
              {order.usage?.individualUsage?.[0]?.activationCode ||
                order.activationCode ||
                "N/A"}
            </Text>
          </View>
          {order.usage && (
            <>
              {/* <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Data Used:</Text>
                <Text style={styles.detailValue}>
                  {usedBytes === 0
                    ? "0 MB"
                    : usedUnit === "GB"
                    ? `${used.toFixed(2)} GB`
                    : `${used.toFixed(0)} MB`}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Data Remaining:</Text>
                <Text style={styles.detailValue}>
                  {order.usage.totalDataRemaining > 0
                    ? (() => {
                        const remainingGB =
                          order.usage.totalDataRemaining / (1024 * 1024 * 1024);
                        const remainingMB =
                          order.usage.totalDataRemaining / (1024 * 1024);
                        return remainingGB >= 1
                          ? `${remainingGB.toFixed(2)} GB`
                          : `${remainingMB.toFixed(0)} MB`;
                      })()
                    : "0 MB"}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Usage Status:</Text>
                <Text style={styles.detailValue}>
                  {order.usage.isActive ? "Active" : "Inactive"}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Last Synced:</Text>
                <Text style={styles.detailValue}>
                  {new Date(order.usage.lastSyncedAt).toLocaleDateString()}
                </Text>
              </View> */}
            </>
          )}
        </View>
      )}

      {/* Buttons Row */}
      <View style={styles.buttonsRow}>
        {/* Top-up button */}
        <TouchableOpacity
          style={[
            styles.btn,
            styles.btnThird,
            (individualUsage.usagePercentage >= 80 || isToppingUp) &&
            styles.btnDisabled,
          ]}
          onPress={() => {
            if (isToppingUp) return; // Prevent double-tap

            if (
              individualUsage.usagePercentage < 80 &&
              order?.subscriberId &&
              order?.esimId
            ) {
              setIsToppingUp(true);
              router.push({
                pathname: "/topupPage",
                params: {
                  subscriberId: order.subscriberId,
                  esimId: order.esimId,
                },
              });

              // Reset processing state after a short delay
              setTimeout(() => {
                setIsToppingUp(false);
              }, 1000);
            }
          }}
          disabled={individualUsage.usagePercentage >= 80 || isToppingUp}
        >
          <Text
            style={[
              styles.btnText,
              (individualUsage.usagePercentage >= 80 || isToppingUp) &&
              styles.btnTextDisabled,
            ]}
          >
            {t("activeEsimCard.topUp")}
          </Text>
        </TouchableOpacity>

        {/* QR Code/Info button */}
        <TouchableOpacity
          style={[styles.btn, styles.btnThird, styles.qrBtn]}
          onPress={() => setShowQRModal(true)}
        >
          <Ionicons
            name="qr-code"
            size={20}
            color="#fff"
            style={styles.btnIcon}
          />
          <Text style={styles.btnText}>{t("activeEsimCard.qrCode")}</Text>
        </TouchableOpacity>

        {/* Top-up History button */}
        {order?.usage?.individualUsage &&
          order.usage.individualUsage.length > 0 && (
            <TouchableOpacity
              style={[styles.btn, styles.btnThird, styles.historyBtn]}
              onPress={() => setShowTopUpHistory(true)}
            >
              <Ionicons
                name="list"
                size={20}
                color="#fff"
                style={styles.btnIcon}
              />
              <Text style={styles.btnText}>History</Text>
            </TouchableOpacity>
          )}
      </View>

      {/* Activation button */}
      <TouchableOpacity
        style={[
          styles.activationBtn,
          (() => {
            const hasRemainingData =
              order?.usage?.totalDataRemaining &&
              order.usage.totalDataRemaining > 0;
            const shouldDisable =
              isActivating || (!hasRemainingData && daysLeft <= 0);
            return shouldDisable && styles.activationBtnDisabled;
          })(),
        ]}
        onPress={async () => {
          // Allow activation if there's remaining data, even if daysLeft calculation is off
          const hasRemainingData =
            order?.usage?.totalDataRemaining &&
            order.usage.totalDataRemaining > 0;
          const shouldAllowActivation = hasRemainingData || daysLeft > 0;

          if (isActivating || !order || !shouldAllowActivation) return; // Prevent double-tap and disable if no data left

          setIsActivating(true);
          console.log("Activation button pressed for order:", {
            id: order.id,
            urlQrCode: order.urlQrCode,
            smdpServer: order.smdpServer,
            activationCode: order.activationCode,
          });

          try {
            await activateEsim(order);
          } finally {
            // Reset processing state after a delay
            setTimeout(() => {
              setIsActivating(false);
            }, 2000);
          }
        }}
        disabled={(() => {
          const hasRemainingData =
            order?.usage?.totalDataRemaining &&
            order.usage.totalDataRemaining > 0;
          return isActivating || (!hasRemainingData && daysLeft <= 0);
        })()}
      >
        <Text
          style={[
            styles.activationBtnText,
            (() => {
              const hasRemainingData =
                order?.usage?.totalDataRemaining &&
                order.usage.totalDataRemaining > 0;
              const shouldDisable =
                isActivating || (!hasRemainingData && daysLeft <= 0);
              return shouldDisable && styles.activationBtnTextDisabled;
            })(),
          ]}
        >
          {t("activeEsimCard.activatePackage")}
        </Text>
      </TouchableOpacity>

      {/* QR Code Modal */}
      {order?.urlQrCode && (
        <QRCodeModal
          visible={showQRModal}
          onClose={() => setShowQRModal(false)}
          qrValue={order.urlQrCode}
          title={title}
          order={order}
        />
      )}

      {/* Top-Up History Modal */}
      {order?.usage?.individualUsage && (
        <TopUpHistoryModal
          visible={showTopUpHistory}
          onClose={() => setShowTopUpHistory(false)}
          individualUsage={order.usage.individualUsage}
          title="Top-Up History"
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ebf3ff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: COLLAPSED_H,
  },

  titleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
    color: "#202020",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  topupIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  topupIndicatorText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 3,
  },

  /* Gauge text */
  gaugeTextWrap: {
    position: "absolute",
    top: 60,
    alignItems: "center",
    width: "100%",
  },
  used: {
    fontSize: 30,
    fontWeight: "700",
    color: "#202020",
  },
  ofTotal: {
    color: "#6B7280",
    fontSize: 14,
  },
  badge: {
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1F2937",
  },

  /* Meta row */
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  metaItem: {
    alignItems: "center",
    width: "33%",
  },
  metaLabel: {
    fontSize: 12,
    marginTop: 4,
    color: "#202020",
  },

  /* Details row */
  detailsRow: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 12,
    color: "#202020",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },

  /* Buttons */
  buttonsRow: {
    flexDirection: "row",
    marginTop: 20,
    marginHorizontal: 20,
    gap: 12,
  },
  btn: {
    backgroundColor: "#004FFE",
    borderRadius: 24,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnHalf: {
    flex: 1,
  },
  btnThird: {
    flex: 1,
  },
  btnDisabled: {
    backgroundColor: "#F3F4F6",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
  btnTextDisabled: {
    color: "#D1D5DB",
  },
  btnIcon: {
    marginRight: 6,
  },
  qrBtn: {
    backgroundColor: "#10B981",
  },
  historyBtn: {
    backgroundColor: "#8B5CF6",
  },

  /* Activation button */
  activationBtn: {
    backgroundColor: "#10B981",
    borderRadius: 24,
    paddingVertical: 14,
    marginTop: 12,
    marginHorizontal: 20,
  },
  activationBtnDisabled: {
    backgroundColor: "#E5E7EB",
  },
  activationBtnText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
  activationBtnTextDisabled: {
    color: "#9CA3AF",
  },
});
