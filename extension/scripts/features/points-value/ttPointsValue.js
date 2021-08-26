"use strict";

(async () => {
	featureManager.registerFeature(
		"Points Value",
		"sidebar",
		() => settings.pages.sidebar.pointsValue,
		null,
		showValue,
		removeValue,
		{ storage: ["settings.pages.sidebar.pointsValue"] },
		() => {
			if (!hasAPIData()) return "No API access.";
		}
	);

	async function showValue() {
		await requireSidebar();

		const block = document.find("#pointsPoints").parentElement;

		block.classList.add("tt-points-value");

		// FIXME - Use the actual value instead of a fixed one.
		for (const elements of block.findAll(":scope > span")) elements.setAttribute("title", formatNumber(45475, { currency: true }));

		// FIXME - Use Torn's styling.
		// initializeTooltip(".tt-points-value", "white-tooltip");
	}

	function removeValue() {
		const block = document.find(".tt-points-value");
		if (!block) return;

		block.classList.remove("tt-points-value");
		for (const elements of block.findAll(":scope > span")) elements.removeAttribute("title");
	}
})();
