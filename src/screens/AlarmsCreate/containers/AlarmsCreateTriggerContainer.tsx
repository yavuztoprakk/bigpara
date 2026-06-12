import React from "react";
import AlarmsCreateTrigger from "../components/AlarmsCreateTrigger";
import { Ionicons } from "@expo/vector-icons";

type IconName = keyof typeof Ionicons.glyphMap;

interface Props {
  icon?: IconName;
  size?: number;
  code?: string;
  disabled?: boolean;
}

const AlarmsCreateTriggerContainer: React.FC<Props> = ({
  icon,
  size,
  code = "",
  disabled = false,
}) => {

  return (
    <AlarmsCreateTrigger
      icon={icon}
      size={size}
      code={code}
      disabled={disabled}
    />
  );
};

export default AlarmsCreateTriggerContainer;
