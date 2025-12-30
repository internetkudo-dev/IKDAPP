import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "@/hooks/useLanguage";

const LANGUAGES = [
  { code: "al", label: "AL", name: "Shqip" },
  { code: "en", label: "EN", name: "English" },
];

type LanguageSwitcherProps = {
  variant?: "compact" | "full";
};

export default function LanguageSwitcher({
  variant = "full",
}: LanguageSwitcherProps) {
  const { changeLanguage, currentLanguage } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentLang =
    LANGUAGES.find((lang) => lang.code === currentLanguage) || LANGUAGES[1];

  const handleLanguageSelect = (langCode: "en" | "al") => {
    changeLanguage(langCode);
    setIsDropdownOpen(false);
  };

  if (variant === "compact") {
    return (
      <View style={styles.compactContainer}>
        <TouchableOpacity
          style={styles.compactButton}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          activeOpacity={0.7}
        >
          <Text style={styles.compactText}>{currentLang.label}</Text>
          <Ionicons
            name={isDropdownOpen ? "chevron-up" : "chevron-down"}
            size={10}
            color="#94A3B8"
          />
        </TouchableOpacity>

        {isDropdownOpen && (
          <View style={styles.dropdown}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.dropdownItem,
                  currentLanguage === lang.code && styles.dropdownItemActive,
                ]}
                onPress={() => handleLanguageSelect(lang.code as "en" | "al")}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    currentLanguage === lang.code &&
                    styles.dropdownItemTextActive,
                  ]}
                >
                  {lang.name}
                </Text>
                <Text
                  style={[
                    styles.dropdownItemCode,
                    currentLanguage === lang.code &&
                    styles.dropdownItemCodeActive,
                  ]}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }

  // Original full variant
  return (
    <View style={styles.container}>
      {LANGUAGES.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.button,
            currentLanguage === lang.code && styles.activeButton,
          ]}
          onPress={() => changeLanguage(lang.code as "en" | "al")}
        >
          <Text
            style={[
              styles.buttonText,
              currentLanguage === lang.code && styles.activeButtonText,
            ]}
          >
            {lang.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Compact dropdown styles
  compactContainer: {
    position: "relative",
  },
  compactButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "transparent",
    borderRadius: 6,
  },
  compactText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94A3B8",
    marginRight: 4,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownItemActive: {
    backgroundColor: "#F0F7FF",
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#202020",
  },
  dropdownItemTextActive: {
    color: "#004FFE",
  },
  dropdownItemCode: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6B7280",
  },
  dropdownItemCodeActive: {
    color: "#004FFE",
  },

  // Original full variant styles
  container: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 2,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 40,
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#004FFE",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeButtonText: {
    color: "#FFFFFF",
  },
});
