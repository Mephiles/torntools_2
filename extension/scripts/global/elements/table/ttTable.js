function stringCellRenderer(value) {
	const element = document.createTextNode(value);

	return {
		element,
	};
}

function createTable(tableColumnsDefs, tableRowsData, options = {}) {
	options = {
		stretchColumns: false,
		...options,
		cellRenderers: {
			...options.cellRenderers,
			string: stringCellRenderer,
		},
	};

	const tableHeaders = tableColumnsDefs.map((columnDef) => createTableHeaderCell(columnDef));
	const tableRows = tableRowsData.map((rowData) => createTableRow(rowData, tableColumnsDefs, options));

	const tableElem = document.newElement({
		type: "div",
		class: "tt-table",
		children: [
			document.newElement({
				type: "div",
				class: "tt-table-header",
				children: tableHeaders.map((header) => header.element),
			}),
			document.newElement({
				type: "div",
				class: "tt-table-body",
				children: tableRows.map((row) => row.element),
			}),
		],
	});

	return {
		element: tableElem,
		// applyFilters,
		// sortColumn,
		// hideColumns,
		// dispose,
	};
}
