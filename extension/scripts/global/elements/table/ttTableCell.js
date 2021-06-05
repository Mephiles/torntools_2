function createTableCell(data, columnDef, cellRenderer, options) {
	// columnDef.sortable;
	// columnDef.filterType;
	// columnDef.valueSelector;

	const cell = cellRenderer(data);
	const cellElement = document.newElement({
		type: "div",
		class: "tt-table-row-cell",
		style: {
			minWidth: `${columnDef.width}px`,
			flex: 1,
		},
		children: [cell.element],
	});

	return {
		element: cellElement,
	};
}
