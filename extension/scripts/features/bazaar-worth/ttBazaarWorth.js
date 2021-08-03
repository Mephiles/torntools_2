"use strict";

(async () => {
	featureManager.registerFeature(
		"Bazaar Worth",
		"bazaar",
		() => settings.pages.bazaar.worth,
		addListener,
		addWorth,
		removeWorth,
		{
			storage: ["settings.pages.bazaar.worth"],
		},
		() => {
			if (!hasAPIData()) return "No API access.";
		}
	);

	function addListener() {
		addFetchListener(({ detail: { page, json } }) => {
			if (page === "bazaar" && json && json.list) addWorth(json.list);
		});
	}

	async function addWorth(bazaarData) {
		if (!bazaarData) return;
		await requireElement(".info-msg-cont .msg a[href]");

		if (bazaarData.length === 0) {
			document.find(".info-msg-cont .msg").appendChild(
				document.newElement({
					type: "div",
					class: "tt-bazaar-text",
					text: "This bazaar is worth ",
					children: [document.newElement({ type: "span", text: "$0." })],
				})
			);
			return;
		}

		let total = 0;
		for (const item of bazaarData) {
			total += item.averageprice * item.amount;
		}

		document.find(".info-msg-cont .msg").appendChild(
			document.newElement({
				type: "div",
				class: "tt-bazaar-text",
				text: "This bazaar is worth ",
				children: [document.newElement({ type: "span", text: formatNumber(total, { currency: true }) + "." })],
			})
		);
	}

	function removeWorth() {
		document.find(".tt-bazaar-text").remove();
	}
})();
