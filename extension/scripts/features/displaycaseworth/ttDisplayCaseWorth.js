"use strict";

(async () => {
	featureManager.registerFeature(
		"Display Case Worth",
		"display case",
		() => settings.pages.displayCase.worth,
		null,
		addWorth,
		removeWorth,
		{
			storage: ["settings.pages.displayCase.worth"],
		},
		() => {
			if (!hasAPIData()) return "No API access.";
		}
	);

	async function addWorth() {
		await requireElement(".info-msg-cont .msg");
		fetchApi("torn", { section: "user", id: window.location.href.split("/").last(), selections: ["display"] })
			.then((result) => {
				let total = 0;

				for (const item of result.display) {
					total += item.market_price * item.quantity;
				}

				document.find(".info-msg-cont .msg").appendChild(
					document.newElement({
						type: "div",
						class: "tt-display-worth",
						text: "This display cabinet is worth ",
						children: [
							document.newElement({
								type: "span",
								text: formatNumber(total, { currency: true }) + "."
							})
						],
					})
				);
			})
			.catch((error) => {
				document.find(".info-msg-cont .msg").appendChild(
					document.newElement({
						type: "div",
						class: "tt-display-worth",
						text: "TORN API returned error:" + error.toString(),
					})
				);
				console.log("TT - Display Cabinet Worth API Error:", error);
			});
	}

	function removeWorth() {
		document.find(".tt-display-worth").remove();
	}
})();
