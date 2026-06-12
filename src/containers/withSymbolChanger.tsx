import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import HeaderSwitcherContainer from "../components/HeaderSwitcher";
import HeaderSwitcherResultsContainer from "./HeaderSwitcherResultsContainer";
import { symbolSelector, Symbol } from "../screens/Markets/modules/symbols";

export interface WithSymbolChangerProps {
	code: string;
	symbol?: Symbol;
}

// Yüksek düzen işlevi (HOC)
export default function withSymbolChanger(
	WrappedComponent: React.ComponentType<WithSymbolChangerProps>,
	HeaderRightComp?: React.ComponentType<any>
) {
	return function SymbolChangerWrapper(props: any) {
		const navigation = useNavigation();
		const route = useRoute();
		const query = useSelector((state: any) => state.ui.search.query?.trim() || "");

		// `code` parametresini güvenli şekilde al
		const code = route.params?.code ?? "";

		// Redux'tan `symbol` verisini al
		const symbol = useSelector((state: any) =>
			code && query.length > 0 ? symbolSelector(state, code) : undefined
		);

		// Navigasyon başlıklarını güncelle
		useEffect(() => {
			if (!code) return; // Eğer `code` yoksa başlık güncellenmesin

			navigation.setOptions({
				headerTitleAlign: "center",
				headerTitle: () => (
					<HeaderSwitcherContainer
						onSelect={(selectedCode: string) => {
							navigation.setParams({ code: selectedCode });
						}}
						code={code}
					/>
				),
				headerRight: HeaderRightComp
					? () => <HeaderRightComp code={code} navigation={navigation} />
					: undefined,
			});
		}, [navigation, code]);

		// Eğer `code` boşsa veya `symbol` bulunamazsa, bileşeni yükleme
		if (!code) {
			return null;
		}

		return (
			<>
				<WrappedComponent code={code} symbol={symbol} {...props} />
				<HeaderSwitcherResultsContainer
					onSelect={(selectedCode: string) => {
						navigation.setParams({ code: selectedCode });
					}}
					position={"center"}
				/>
			</>
		);
	};
}
