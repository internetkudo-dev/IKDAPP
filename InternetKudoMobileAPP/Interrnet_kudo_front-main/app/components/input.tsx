// components/input.tsx
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
} from "react-native";

type InputProps = TextInputProps & {
  rightIcon?: React.ReactNode;
  errorMessage?: string;
};

const Input = ({ rightIcon, style, errorMessage, ...rest }: InputProps) => {
  const hasError = Boolean(errorMessage);

  return (
    <View style={styles.container}>
      <TextInput
        placeholderTextColor="#64748B"
        style={[styles.input, hasError && styles.errorInput, style]}
        {...rest}
      />
      {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      {hasError && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 9999,
    paddingVertical: 18,
    paddingHorizontal: 18,
    paddingRight: 40,
    color: "black",
    fontSize: 16,
    fontFamily: "Inter-Regular",
  } as TextStyle,
  errorInput: {
    borderColor: "#DC2626", // red
  },
  icon: {
    position: "absolute",
    right: 16,
    top: 18,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 10,
  },
});
