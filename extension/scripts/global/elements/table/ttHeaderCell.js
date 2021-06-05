function createTableHeaderCell(columnDef) {
	// columnDef.sortable;

	const headerCellElement = document.newElement({
		type: "div",
		class: "tt-table-header-cell",
		style: {
			"min-width": `${columnDef.width}px`,
			flex: 1,
		},
		text: columnDef.title,
	});

	return {
		element: headerCellElement,
	};
}
