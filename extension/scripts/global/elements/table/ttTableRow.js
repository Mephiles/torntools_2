function createTableRow(rowData, tableColumnsDefs, options) {
	const rowCells = tableColumnsDefs.map((columnDef) =>
		createTableCell(rowData[columnDef.id], columnDef, options.cellRenderers[columnDef.cellRenderer], options)
	);

	const rowElement = document.newElement({
		type: "div",
		class: "tt-table-row",
		style: {
			...(options.rowStyle ? options.rowStyle(rowData) || {} : {}),
		},
		children: rowCells.map((cell) => cell.element),
	});

	return {
		element: rowElement,
	};
}
