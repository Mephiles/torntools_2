"use strict";

(async () => {
	featureManager.registerFeature(
		"Bank Investment",
		"bank",
		() => settings.pages.bank.investment,
		null,
		initialize,
		teardown,
		{
			storage: ["settings.pages.bank.investment"],
		},
		null
	);

	const DAYS_IN_YEAR = 365;
	const BALANCE = 2_000_000_000;
	const PERIOD_TYPE = {
		OneWeek: "1w",
		TwoWeeks: "2w",
		OneMonth: "1m",
		TwoMonths: "2m",
		ThreeMonths: "3m",
	};
	const PERIOD_DESC = {
		[PERIOD_TYPE.OneWeek]: "1 Week",
		[PERIOD_TYPE.TwoWeeks]: "2 Weeks",
		[PERIOD_TYPE.OneMonth]: "1 Month",
		[PERIOD_TYPE.TwoMonths]: "2 Months",
		[PERIOD_TYPE.ThreeMonths]: "3 Months",
	};
	const INVESTMENTS_BONUSES = {
		TCB: "tcb",
		Merit: "merit",
	};
	const DAYS = {
		[PERIOD_TYPE.OneWeek]: 7,
		[PERIOD_TYPE.TwoWeeks]: 14,
		[PERIOD_TYPE.OneMonth]: 30,
		[PERIOD_TYPE.TwoMonths]: 60,
		[PERIOD_TYPE.ThreeMonths]: 90,
	};
	const BONUSES_RATIO = {
		[INVESTMENTS_BONUSES.TCB]: 0.1,
		[INVESTMENTS_BONUSES.Merit]: 0.5,
	};

	function createBankInvestmentContainer(bankAprInfo) {
		const tableColumnsDefs = [
			{
				id: "period",
				title: "Period",
				width: 120,
				cellRenderer: "string",
				sortable: true,
			},
			{
				id: "regular",
				title: "Regular",
				width: 110,
				cellRenderer: "bankMoney",
			},
			{
				id: "tcbOnly",
				title: "TCB Only",
				width: 110,
				cellRenderer: "bankMoney",
			},
			{
				id: "meritsOnly",
				title: "10/10 Merits Only",
				width: 115,
				cellRenderer: "bankMoney",
			},
			{
				id: "meritsAndTcb",
				title: "10/10 Merits + TCB",
				width: 125,
				cellRenderer: "bankMoney",
			},
		];
		const tableRowsData = Object.values(PERIOD_TYPE).map((period) => _createRow(period));
		// TODO: Better way to find max?
		const bestPeriod = tableRowsData.reduce((maxRow, row) => (row.regular.daily > maxRow.regular.daily ? row : maxRow), tableRowsData[0]).period;
		const customCellRenderers = {
			// TODO: Extract?
			bankMoney: (value) => {
				const element = document.newElement({
					type: "div",
					class: "bank-investment-money-cell-wrapper",
					children: [
						document.newElement({
							type: "div",
							class: "bank-investment-money-cell-total",
							text: formatNumber(value.total, { currency: true, decimals: 0 }),
						}),
						document.newElement({
							type: "div",
							class: "bank-investment-money-cell-per-day",
							text: formatNumber(value.daily, { currency: true, decimals: 0 }),
						}),
					],
				});

				return {
					element,
				};
			},
		};

		const table = createTable(tableColumnsDefs, tableRowsData, {
			cellRenderers: customCellRenderers,
			rowClass: (rowData) => (rowData.period === bestPeriod ? "tt-bank-investment-selected-row" : ""),
			stretchColumns: true,
		});

		const { content } = createContainer("Bank Investment - Based on 2b investment", {
			previousElement: document.find(".content-wrapper > .delimiter-999"),
			class: "tt-bank-investment-container",
		});
		content.appendChild(table.element);

		function dispose() {}

		function _createRow(period) {
			return {
				period: PERIOD_DESC[period],
				regular: _getMoneyInfo(period, []),
				tcbOnly: _getMoneyInfo(period, [INVESTMENTS_BONUSES.TCB]),
				meritsOnly: _getMoneyInfo(period, [INVESTMENTS_BONUSES.Merit]),
				meritsAndTcb: _getMoneyInfo(period, [INVESTMENTS_BONUSES.TCB, INVESTMENTS_BONUSES.Merit]),
			};
		}

		function _getMoneyInfo(period, bonuses) {
			const apr = parseFloat(bankAprInfo[period]);
			const aprPercent = apr / 100;
			const totalBonusRatio = bonuses.reduce((total, bonus) => total * (1 + BONUSES_RATIO[bonus]), 1);
			const aprWithBonus = aprPercent * totalBonusRatio;
			const profitPerDayRatio = (aprWithBonus / DAYS_IN_YEAR) * DAYS[period];

			const total = profitPerDayRatio.toFixed(4) * BALANCE;
			const daily = (total / DAYS[period]).toFixed();

			return {
				total,
				daily,
			};
		}

		return {
			dispose,
		};
	}

	let bankInvestmentInfoContainer;

	async function initialize() {
		await requireElement(".content-wrapper > .delimiter-999");

		const res = await fetchData("torn", { section: "torn", selections: ["bank"] });
		const bankAprInfo = res.bank;

		bankInvestmentInfoContainer = createBankInvestmentContainer(bankAprInfo);

		// TODO: Add investment time left
	}

	function teardown() {
		bankInvestmentInfoContainer.dispose();
		bankInvestmentInfoContainer = undefined;
	}
})();
