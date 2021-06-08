const COLUMN_SORT_DIRECTION = {
	Asc: "asc",
	Desc: "desc",
};

function stringCellRenderer(value) {
	const element = document.createTextNode(value);

	return {
		element,
	};
}

function stringComparator(a, b) {
	return a.localeCompare(b);
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
	let currentSortedHeaderCell;

	const tableHeaders = tableColumnsDefs.map((columnDef) => {
		const headerCell = createTableHeaderCell(columnDef, options);

		headerCell.onColumnSorted((direction) => {
			if (currentSortedHeaderCell && currentSortedHeaderCell !== headerCell) {
				currentSortedHeaderCell.clearColumnSort();
			}

			currentSortedHeaderCell = headerCell;
			sortColumn(columnDef.id, direction);
		});

		return headerCell;
	});
	const tableRows = tableRowsData.map((rowData) => createTableRow(rowData, tableColumnsDefs, options));

	const tableBodyElem = document.newElement({
		type: "div",
		class: "tt-table-body",
		children: tableRows.map((row) => row.element),
	});
	const tableElem = document.newElement({
		type: "div",
		class: "tt-table",
		children: [
			document.newElement({
				type: "div",
				class: "tt-table-header",
				style: {
					...(!options.stretchColumns ? { minWidth: "fit-content" } : {}),
				},
				children: tableHeaders.map((header) => header.element),
			}),
			tableBodyElem,
		],
	});

	function sortColumn(columnId, direction) {
		// TODO: Sort comparator choosing
		tableRows.sort((a, b) =>
			direction === COLUMN_SORT_DIRECTION.Asc
				? stringComparator(a.data[columnId], b.data[columnId])
				: stringComparator(b.data[columnId], a.data[columnId])
		);

		for (const tableRow of tableRows) {
			tableBodyElem.appendChild(tableRow.element);
		}
	}

	return {
		element: tableElem,
		// applyFilters,
		sortColumn,
		// hideColumns,
		// dispose,
	};
}
