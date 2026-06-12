import React from "react";
import Text, { TextProps } from "./Text";
import { useTheme } from "../theme/ThemeContext";

interface Props extends TextProps { }

const BoldText: React.FC<Props> = ({ style, children, ...rest }) => {

  const { theme } = useTheme();

  const defaultStyle = {
    fontFamily: theme.boldFont,
  };
  return (
    <Text {...rest} style={[defaultStyle, style]}>
      {children}
    </Text>
  );
}

export default BoldText;
