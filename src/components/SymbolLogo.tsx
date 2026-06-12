import React, { useState } from "react";
import { Image, View, Text, StyleSheet } from "react-native";

const COLORS = [
  "#E53935", "#8E24AA", "#3949AB", "#039BE5",
  "#00897B", "#43A047", "#F4511E", "#6D4C41",
  "#5C6BC0", "#00ACC1", "#7CB342", "#FFB300",
];

const getColor = (code: string) =>
  COLORS[code.charCodeAt(0) % COLORS.length];

interface Props {
  code: string;
  size?: number;
}

const SymbolLogo: React.FC<Props> = ({ code, size = 32 }) => {
  const [failed, setFailed] = useState(false);
  const borderRadius = size > 28 ? 10 : 6;

  if (failed) {
    return (
      <View style={[styles.fallback, { width: size, height: size, borderRadius, backgroundColor: getColor(code) }]}>
        <Text style={[styles.letter, { fontSize: size * 0.4 }]}>{code.charAt(0)}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: `https://s3.idealdata.com.tr/companylogo/${code.toLowerCase()}.png` }}
      style={{ width: size, height: size, borderRadius }}
      onError={() => setFailed(true)}
    />
  );
};

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  letter: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default React.memo(SymbolLogo);
