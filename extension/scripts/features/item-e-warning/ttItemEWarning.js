"use strict";

(async () => {
	if (!getPageStatus().access) return;

	const feature = featureManager.registerFeature(
		"Item Over E Warning",
		"items",
		() => settings.pages.items.itemEWarning,
		initialiseListener,
		addWarning,
		removeWarning,
		{
			storage: ["settings.pages.items.itemEWarning"],
		},
		() => {
			if (!hasAPIData()) return "No API access.";
		}
	);

	function initialiseListener() {
		document.addEventListener("click", (event) => {
			if (!feature.enabled()) return;

			const item = event.target.closest("li[data-category*='Drug'], li[data-category*='Energy Drink']");
			if (item) addWarning(item);
		});
	}

	async function addWarning(item) {
		if (!item) return;

		const useItemMessage = await requireElement(".use-act", { parent: item });
		if (useItemMessage) {
			const eBarValues = document.find("#barEnergy [class*='bar-value___']").textContent.split("/").map(x => parseInt(x));
			const itemE = parseInt(torndata.items[item.dataset.item].effect.match(/(?<=Increases energy by )\d+/)[0]);
			if (eBarValues[0] > eBarValues[1] && itemE + eBarValues[0] > 1000) {
				useItemMessage.find("#wai-action-desc").appendChild(
					document.newElement({
						type: "div",
						class: "tt-item-e-warning",
						text: "Warning! Using this item increases your E to over 1000!",
					})
				);
				useItemMessage.find("a.next-act").addEventListener("click", clickListener, { capture: true, once: true });
			}
		}
	}

	function clickListener(event) {
		if (!confirm("Are you sure to use this item ? It will get you to more than 1000E.")) {
			event.stopPropagation();
			event.stopImmediatePropagation();
		}
	}

	function removeWarning() {
		document.findAll(".tt-item-e-warning").forEach((x) => x.remove());
		document.findAll("a.next-act").forEach((x) => x.removeEventListener("click", clickListener, { capture: true }));
	}
})();
