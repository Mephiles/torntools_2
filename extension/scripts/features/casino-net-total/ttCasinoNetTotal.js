"use strict";

(async () => {
	console.log("DKK CASINO");
	const page = getPage();

	if (page === "loader") {
		const sid = getSearchParameters().get("sid");

		if (["viewLotteryStats"].includes(sid)) {
			return;
		}
	}

	const feature = featureManager.registerFeature(
		"Casino Net Total",
		"casino",
		() => settings.pages.casino.netTotal,
		initialiseListener,
		addTotal,
		removeTotal,
		{
			storage: ["settings.pages.casino.netTotal"],
		},
		null
	);

	function initialiseListener() {
		if (window.location.href.includes("bookies")) {
			window.addEventListener("hashchange", () => {
				if (feature.enabled() && window.location.hash.includes("stats/")) {
					addTotal();
				}
			});
		}
	}

	async function addTotal() {
		if (page === "bookies" && !window.location.hash.includes("stats/")) return;

		for (const statsType of ["overall", "your"]) {
			await requireElement(`#${statsType}-stats .stat-value`);
			const moneyElementsList = document.evaluate(
				`//div[contains(@id,"${statsType}-stats")]
					//li
						[
							(contains(text(), "Total money won") or contains(text(), "Total money gain"))
							or
							(contains(text(), "Total money lost") or contains(text(), "Total money loss"))
						]
							/following-sibling::li[(contains(@class, "stat-value"))]`,
				document,
				null,
				XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
				null
			);
			if (moneyElementsList.snapshotLength !== 2) continue;
			const totalWon = parseInt(moneyElementsList.snapshotItem(0).innerText.replace(/[$, ]/g, ""));
			const totalLostElement = moneyElementsList.snapshotItem(1);
			const totalLost = parseInt(totalLostElement.innerText.replace(/[$, ]/g, ""));

			if (document.find(`.${statsType}-stats-wrap .tt-net-total`) || (window.location.toString().includes("Poker") && statsType === "overall")) return;

			await requireElement(`.stats-wrap .${statsType}-stats-wrap .stat`);
			totalLostElement.closest("li:not(.stat-value)").insertAdjacentHTML(
				"afterend",
				`<div class="tt-net-total ${window.location.href.includes("bookie") ? "bookie" : ""}">
						<li class="name">Net total</li>
						<li class="value">${formatNumber(totalWon - totalLost, { currency: true })}</li>
					</div>`
			);
		}
	}

	function removeTotal() {
		document.findAll(".tt-net-total").forEach((x) => x.remove());
	}
})();
