"use strict";

(async () => {
	if (isFlying() || isAbroad()) return;

	const feature = featureManager.registerFeature(
		"Total Portfolio Value and Profit",
		"stocks",
		() => settings.pages.stocks.valueAndProfit,
		null,
		addProfitAndValue,
		removeProfitAndValue,
		{
			storage: ["settings.pages.stocks.valueAndProfit"],
		},
		null
	);

	async function addProfitAndValue() {
		await requireElement("#stockmarketroot [class*='stock___']");
		const totalValue = [...document.findAll("[class*='stockOwned__'] [class*='value__']")]
			.map((x) => parseInt(x.innerText.replace(/[$,]/g, "").trim()))
			.reduce((a, b) => (a += b), 0);
		const profits = [...document.findAll("#stockmarketroot [class*='stockMarket__'] > ul[id]")]
			.map((x) => {
				const stockID = x.id;
				const data = torndata.stocks[stockID];
				const userStockData = userdata.stocks[stockID];
				if (!userStockData) return 0;

				const boughtTotal = Object.values(userStockData.transactions).reduce((prev, trans) => prev + trans.bought_price * trans.shares, 0);
				const boughtPrice = boughtTotal / userStockData.total_shares;

				return Math.floor((data.current_price - boughtPrice) * userStockData.total_shares);
			})
			.reduce((a, b) => (a += b), 0);

		document.find("#stockmarketroot h4").appendChild(
			document.newElement({
				type: "div",
				class: "tt-total-stock-value",
				children: [
					"Value: ",
					document.newElement({ type: "span", class: "value" , text: formatNumber(totalValue, { currency: true, shorten: true }) }),
					" | Profit: ",
					document.newElement({ type: "span", class: profits >= 0 ? "profit" : "loss", text: formatNumber(profits, { currency: true, shorten: true }) }),
				],
			})
		);
	}

	function removeProfitAndValue() {
		const ttTotalStockValue = document.find("#stockmarketroot .tt-total-stock-value");
		if (ttTotalStockValue) ttTotalStockValue.remove();
	}
})();
