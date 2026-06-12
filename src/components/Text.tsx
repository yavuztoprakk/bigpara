import React from "react";
import { Text as ReactText } from "react-native";
import { useTheme } from "../theme/ThemeContext";

export interface TextProps {
  style?: any;
  adjustsFontSizeToFit?: boolean;
  numberOfLines?: number;
  minimumFontScale?: number;
  ellipsizeMode?: "head" | "middle" | "tail" | "clip";
  allowFontScaling: any
  onPress?: () => void;
  children?: React.ReactNode; // children propunu ekliyoruz
}

const Text: React.FC<TextProps> = ({
  style,
  children,
  adjustsFontSizeToFit,
  numberOfLines,
  minimumFontScale,
  ellipsizeMode,
  allowFontScaling,
  ...rest
}) => {
  const { theme } = useTheme();
  const defaultStyle = {
    fontFamily: theme.regularFont,
  };
  return (
    <ReactText
      {...rest}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      numberOfLines={numberOfLines}
      minimumFontScale={minimumFontScale}
      ellipsizeMode={ellipsizeMode}
      style={[defaultStyle, style || {}]}
    >
      {children}
    </ReactText>
  );
}

export default Text;
