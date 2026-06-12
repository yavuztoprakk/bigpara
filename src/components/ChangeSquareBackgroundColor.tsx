
import { changeColorSquare } from "../screens/Markets/modules/prices";

interface Props {
	change: number;
}

function ChangeSquareBackgroundColor(change: number) {
	const color = changeColorSquare(change);


	return color
};

export default ChangeSquareBackgroundColor;
