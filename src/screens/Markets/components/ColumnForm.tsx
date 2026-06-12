import React from "react";
import { useDispatch, useSelector } from "react-redux";
import BottomSheetLayer from "../../../components/BottomSheet/BottomSheetLayer";
import Select from "../../../components/BottomSheet/Select";
import { columnOptions } from "../modules/lists";
import { columnsCountSelector, columnsSelector, updateColumns, updateColumnsCount } from "../../Auth/modules/preferences";
import { changeColumns } from "../modules/lists";

import { close } from "../../../modules/bottomSheet";
import { open } from "../../../modules/bottomSheet";

const columnsCountOptions = [
	{ title: "3 Sütun", value: "3" },
	{ title: "4 Sütun", value: "4" },
	{ title: "5 Sütun", value: "5" },
];

const ColumnForm: React.FC = () => {
	const dispatch = useDispatch();

	const colIndex = useSelector((state: any) => state.columnForm);
	const columns = useSelector((state: any) => columnsSelector(state));
	const columnsCount = useSelector((state: any) => columnsCountSelector(state));

	const handleClose = () => {
		dispatch(close());
	};

	const handleChange = (value: string) => {

		if (colIndex === -1) {
			dispatch(updateColumnsCount(parseInt(value) - 1));
		} else {

			const updatedColumns = [...columns];
			updatedColumns[colIndex] = value;
			dispatch(changeColumns(updatedColumns));
			dispatch(updateColumns(updatedColumns));

		}
		handleClose();
	};
	return (
		<BottomSheetLayer
			onCancel={handleClose}
			title={colIndex === -1 ? "Sütun Sayısı" : `${colIndex + 1}. Sütun`}
			open={open}
			contentHeight={colIndex === -1 ? 250 : 400}
		>
			<Select
				options={
					colIndex === -1
						? columnsCountOptions
						: Object.values(columnOptions)
				}
				value={colIndex === -1 ? `${columnsCount + 1}` : columns[colIndex]}
				onChange={handleChange}
			/>
		</BottomSheetLayer>
	);
};

export default ColumnForm;
