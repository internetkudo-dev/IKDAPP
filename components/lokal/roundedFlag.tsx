// components/RoundedFlag.tsx
import React from "react";
import { Image, StyleSheet, View } from "react-native";

const RoundedFlag = ({ flag }: { flag: string }) => {
  return (
    <View style={styles.flagContainer}>
      <Image
        source={{ uri: flag }}
        style={styles.flagImage}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flagContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  flagImage: {
    width: "100%",
    height: "100%",
  },
});

export default RoundedFlag;
