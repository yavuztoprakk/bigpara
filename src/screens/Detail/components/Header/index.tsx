import React from "react";
import Price from "../../components/Header/Price";
import ChartContainer from "../../containers/Header/ChartContainer";

interface Props {
    code: string;
    navigation: any;
}

const Header: React.FC<Props> = ({ code, navigation }) => {
    return (
        <>
            <Price code={code} navigation={navigation} />
            <ChartContainer code={code} navigation={navigation} />
        </>
    );
};

export default Header;
