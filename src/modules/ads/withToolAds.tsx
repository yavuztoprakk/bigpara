import React from "react";
import ToolAdScreen from "./ToolAdScreen";

// HOC: Tools alt ekranlarını masthead + 300x250 ile sarmalar.
// Kullanım: export default withToolAds(MyScreen, "elliott-analizi");
export function withToolAds<P extends object>(
  Component: React.ComponentType<P>,
  category: string
): React.FC<P> {
  const Wrapped: React.FC<P> = (props) => (
    <ToolAdScreen category={category}>
      <Component {...props} />
    </ToolAdScreen>
  );
  Wrapped.displayName = `withToolAds(${Component.displayName ?? Component.name})`;
  return Wrapped;
}
