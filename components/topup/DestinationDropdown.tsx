import { buildFlagUrl, regionFlagCode, regionPrettyName } from "@/utils/esim";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useGetDestinationsQuery } from "@/store/esimApi.slice";

export type DestinationType = "local" | "regional";

export interface DestinationItem {
  id: string | number;
  name: string;
  flag: string;
  type: DestinationType;
  code?: string; // ISO2 code for countries
  zoneId?: number; // Zone ID for regions
  count?: number; // Number of countries in region
}

interface Props {
  selectedDestination: DestinationItem | null;
  onSelect: (destination: DestinationItem) => void;
  placeholder?: string;
}

export default function DestinationDropdown({
  selectedDestination,
  onSelect,
  placeholder,
}: Props) {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<DestinationType>("local");
  const { data, isLoading, isError } = useGetDestinationsQuery();

  const destinations = useMemo(() => {
    if (!data) return { local: [], regional: [] };

    const local: DestinationItem[] = [];
    const regional: DestinationItem[] = [];

    // Process local destinations (countries)
    const localDestinations = data.filter((d: any) => d.type === "local");
    const countryMap: Record<string, DestinationItem> = {};

    for (const d of localDestinations) {
      d.countries.forEach((countryName: string, idx: number) => {
        const code = (d.iso2[idx] || "").toLowerCase();
        if (!code) return;

        countryMap[code] = {
          id: code,
          name: countryName,
          flag: buildFlagUrl(code),
          type: "local",
          code,
          zoneId: d.key,
        };
      });
    }

    local.push(
      ...Object.values(countryMap).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      )
    );

    // Process regional destinations
    const regionalDestinations = data.filter((d: any) => d.type === "regional");
    regional.push(
      ...regionalDestinations
        .map((d: any) => ({
          id: d.key,
          name: regionPrettyName(d.title),
          flag: buildFlagUrl(regionFlagCode(d.title)),
          type: "regional" as DestinationType,
          zoneId: d.key,
          count: d.countries.length,
        }))
        .sort((a: any, b: any) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        )
    );

    return { local, regional };
  }, [data]);

  const currentDestinations = destinations[selectedType];

  const handleSelect = (destination: DestinationItem) => {
    onSelect(destination);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.dropdownContent}>
          {selectedDestination ? (
            <>
              <Image
                source={{ uri: selectedDestination.flag }}
                style={styles.selectedFlag}
              />
              <View>
                <Text style={styles.selectedName}>
                  {selectedDestination.name}
                </Text>
                {selectedDestination.count && (
                  <Text style={styles.selectedCount}>
                    {selectedDestination.count} {t("topup.countries")}
                  </Text>
                )}
              </View>
            </>
          ) : (
            <Text style={styles.placeholder}>
              {placeholder || t("topup.selectDestination")}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-down" size={20} color="#888" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t("topup.selectDestinationTitle")}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Type Selection Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedType === "local" && styles.activeTab]}
              onPress={() => setSelectedType("local")}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedType === "local" && styles.activeTabText,
                ]}
              >
                {t("topup.local")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedType === "regional" && styles.activeTab,
              ]}
              onPress={() => setSelectedType("regional")}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedType === "regional" && styles.activeTabText,
                ]}
              >
                {t("topup.regional")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Destinations List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#004FFE" />
              <Text style={styles.loadingText}>
                {t("topup.loadingDestinations")}
              </Text>
            </View>
          ) : isError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {t("topup.errorLoadingDestinations")}
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.listContainer}>
              {currentDestinations.map((destination) => (
                <TouchableOpacity
                  key={destination.id}
                  style={styles.destinationItem}
                  onPress={() => handleSelect(destination)}
                  activeOpacity={0.8}
                >
                  <View style={styles.destinationContent}>
                    <Image
                      source={{ uri: destination.flag }}
                      style={styles.destinationFlag}
                    />
                    <View>
                      <Text style={styles.destinationName}>
                        {destination.name}
                      </Text>
                      {destination.count && (
                        <Text style={styles.destinationCount}>
                          {destination.count} {t("topup.countries")}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#888" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    backgroundColor: "#ebf3ff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "transparent",
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedFlag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
  },
  selectedCount: {
    fontSize: 12,
    color: "#6b7280",
  },
  placeholder: {
    fontSize: 16,
    color: "#6b7280",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#004FFE",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "white",
  },
  tabText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#004FFE",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#6b7280",
    marginTop: 16,
  },
  errorContainer: {
    padding: 24,
  },
  errorText: {
    color: "#dc2626",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  destinationItem: {
    backgroundColor: "#ebf3ff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  destinationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  destinationFlag: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
  },
  destinationCount: {
    fontSize: 12,
    color: "#6b7280",
  },
});
