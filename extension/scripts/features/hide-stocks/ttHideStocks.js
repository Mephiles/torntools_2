"use strict";

(async () => {
	if (!getPageStatus().access) return;

	featureManager.registerFeature(
		"Hide Stocks",
		"stocks",
		() => settings.hideStocks.length,
		null,
		hideStocks,
		unhideStocks,
		{
			storage: ["settings.hideStocks"],
		},
		null
	);

	async function hideStocks() {
		await requireElement("#stockmarketroot [class*='stock___'][id]");
		unhideStocks();
		document.findAll("#stockmarketroot [class*='stock___'][id]").forEach((stockNode) => {
			if (settings.hideStocks.some((x) => x === stockNode.getAttribute("id"))) stockNode.classList.add("hidden");
		});
		document
			.find("#stockmarketroot [class*='appHeaderWrapper__']")
			.insertAdjacentElement("afterend", await createMessageBox("Some stocks have been hidden.", { class: "tt-stocks-hidden" }));
	}

	function unhideStocks() {
		document.findAll("#stockmarketroot .hidden[class*='stock___'][id]").forEach((stockNode) => stockNode.classList.remove("hidden"));
		const ttMessage = document.find(".tt-stocks-hidden");
		if (ttMessage) ttMessage.remove();
	}
})();
