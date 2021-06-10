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
		ONE_WEEK: "1w",
		TWO_WEEKS: "2w",
		ONE_MONTH: "1m",
		TWO_MONTHS: "2m",
		THREE_MONTHS: "3m",
	};
	const PERIOD_DESC = {
		[PERIOD_TYPE.ONE_WEEK]: "1 Week",
		[PERIOD_TYPE.TWO_WEEKS]: "2 Weeks",
		[PERIOD_TYPE.ONE_MONTH]: "1 Month",
		[PERIOD_TYPE.TWO_MONTHS]: "2 Months",
		[PERIOD_TYPE.THREE_MONTHS]: "3 Months",
	};
	const INVESTMENTS_BONUSES = {
		TCI: "tci",
		MERIT: "merit",
	};
	const DAYS = {
		[PERIOD_TYPE.ONE_WEEK]: 7,
		[PERIOD_TYPE.TWO_WEEKS]: 14,
		[PERIOD_TYPE.ONE_MONTH]: 30,
		[PERIOD_TYPE.TWO_MONTHS]: 60,
		[PERIOD_TYPE.THREE_MONTHS]: 90,
	};
	const BONUSES_RATIO = {
		[INVESTMENTS_BONUSES.TCI]: 0.1,
		[INVESTMENTS_BONUSES.MERIT]: 0.5,
	};

	function bankMoneyCellRenderer(bankMoneyData) {
		const element = document.newElement({
			type: "div",
			class: "bank-investment-money-cell-wrapper",
			children: [
				document.newElement({
					type: "div",
					class: "bank-investment-money-cell-total",
					text: formatNumber(bankMoneyData.total, { currency: true, decimals: 0 }),
				}),
				document.newElement({
					type: "div",
					class: "bank-investment-money-cell-per-day",
					text: formatNumber(bankMoneyData.daily, { currency: true, decimals: 0 }),
				}),
			],
		});

		return {
			element,
			dispose: () => {},
		};
	}

	function createBankInvestmentContainer(bankAprInfo) {
		const tableColumnsDefs = [
			{
				id: "period",
				title: "Period",
				width: 120,
				cellRenderer: "string",
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
		const bestPeriod = tableRowsData.reduce((maxRow, row) => (row.regular.daily > maxRow.regular.daily ? row : maxRow), tableRowsData[0]).period;
		const customCellRenderers = {
			bankMoney: bankMoneyCellRenderer,
		};

		const table = createTable(tableColumnsDefs, tableRowsData, {
			cellRenderers: customCellRenderers,
			rowClass: (rowData) => (rowData.period === bestPeriod ? "tt-bank-investment-selected-row" : ""),
			stretchColumns: true,
		});

		const { content, container } = createContainer("Bank Investment - Based on 2b investment", {
			previousElement: document.find(".content-wrapper > .delimiter-999"),
			class: "tt-bank-investment-container",
		});
		content.appendChild(table.element);

		function dispose() {
			table.dispose();
			container.remove();
		}

		function _createRow(period) {
			return {
				period: PERIOD_DESC[period],
				regular: _getMoneyInfo(period, []),
				tcbOnly: _getMoneyInfo(period, [INVESTMENTS_BONUSES.TCI]),
				meritsOnly: _getMoneyInfo(period, [INVESTMENTS_BONUSES.MERIT]),
				meritsAndTcb: _getMoneyInfo(period, [INVESTMENTS_BONUSES.TCI, INVESTMENTS_BONUSES.MERIT]),
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

	function createBankInvestmentFacade() {
		const investmentTimeLeftElement = document.find("p.m-clear");

		const bankDueDateMs = new Date().setSeconds(userdata.city_bank.time_left);
		const formattedDate = formatDate({ milliseconds: bankDueDateMs }, { showYear: true });
		const formattedTime = formatTime(bankDueDateMs);
		const formatted = `${formattedDate} ${formattedTime}`;

		const investmentDueTimeElement = document.newElement({
			type: "span",
			children: [
				document.createTextNode("Investment will be completed on "),
				document.newElement({
					type: "b",
					text: formatted,
				}),
			],
		});

		investmentTimeLeftElement.insertAdjacentElement("afterend", investmentDueTimeElement);

		function dispose() {
			investmentDueTimeElement.remove();
		}

		return {
			dispose,
		};
	}

	let bankInvestmentInfoContainer;
	let bankInvestmentFacade;

	async function initialize() {
		await requireElement(".content-wrapper > .delimiter-999");

		const res = await fetchData("torn", { section: "torn", selections: ["bank"] });
		const bankAprInfo = res.bank;

		bankInvestmentInfoContainer = createBankInvestmentContainer(bankAprInfo);
		bankInvestmentFacade = createBankInvestmentFacade();
	}

	function teardown() {
		bankInvestmentInfoContainer.dispose();
		bankInvestmentInfoContainer = undefined;
		bankInvestmentFacade.dispose();
		bankInvestmentFacade = undefined;
	}
})();
