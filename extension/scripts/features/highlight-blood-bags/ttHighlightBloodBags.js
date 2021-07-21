"use strict";

(async () => {
	if (!getPageStatus().access) return;

	const page = getPage();

	if (page === "factions" && !isOwnFaction()) return;

	// noinspection JSIncompatibleTypesComparison
	const feature = featureManager.registerFeature(
		"Highlight Blood Bags",
		"items",
		() => settings.pages.items.highlightBloodBags !== "none",
		initialiseBloodBags,
		highlightBloodBags,
		removeHighlights,
		{
			storage: ["settings.pages.items.highlightBloodBags"],
		},
		null
	);

	function initialiseBloodBags() {
		if (page === "item") {
			const listener = () => {
				if (!feature.enabled()) return;

				highlightBloodBags();
			};

			CUSTOM_LISTENERS[EVENT_CHANNELS.ITEM_ITEMS_LOADED].push(listener);
			CUSTOM_LISTENERS[EVENT_CHANNELS.ITEM_SWITCH_TAB].push(listener);
		} else if (page === "factions") {
			CUSTOM_LISTENERS[EVENT_CHANNELS.FACTION_ARMORY_TAB].push(({ section }) => {
				if (!feature.enabled() || section !== "medical") return;

				highlightBloodBags();
			});
		}
	}

	async function highlightBloodBags() {
		await requireContent();

		if (page === "item") {
			await requireItemsLoaded();
		} else if (page === "factions") {
			if (getCurrentTab() === "armoury") {
				await requireElement("#faction-armoury-tabs > ul.torn-tabs > li[aria-selected='true']");

				if (getCurrentSection() !== "medical") return;
			} else return;
		}

		const allowedBlood = ALLOWED_BLOOD[settings.pages.items.highlightBloodBags];

		for (const item of document.findAll(
			"ul.items-cont[aria-expanded=true] > li[data-category='Medical'], #faction-armoury-tabs .armoury-tabs[aria-expanded='true'] .item-list > li"
		)) {
			if (!item.find(".name-wrap, .name")) continue;
			item.find(".name-wrap, .name").classList.remove("good-blood", "bad-blood");

			// Filter out items that aren't blood bags.
			if (page === "item" && !item.dataset.sort.includes("Blood Bag : ")) continue;
			else if (page === "factions" && !item.find(".name").innerText.split(" x")[0].includes("Blood Bag : ")) continue;

			const itemId = parseInt(item.dataset.item || item.find(".img-wrap").dataset.itemid);
			if (itemId === 1012) continue; // is an irradiated blood bag

			item.find(".name-wrap, .name").classList.add(allowedBlood.includes(itemId) ? "good-blood" : "bad-blood");

			if (page === "factions") {
				if (item.find(".tt-item-price")) item.find(".tt-item-price").remove();

				if (hasAPIData()) {
					item.find(".name").appendChild(
						document.newElement({
							type: "span",
							class: "tt-blood-price",
							text: `${formatNumber(torndata.items[itemId].market_value, { currency: true })}`,
						})
					);
				}
			}
		}
	}

	function getCurrentTab() {
		return document.find("#factions > ul.faction-tabs > li[aria-selected='true']").getAttribute("data-case").replace("faction-", "");
	}

	function getCurrentSection() {
		return document.find("#faction-armoury-tabs > ul.torn-tabs > li[aria-selected='true']").getAttribute("aria-controls").replace("armoury-", "");
	}

	async function removeHighlights() {
		for (const highlight of document.findAll(".good-blood, .bad-blood")) {
			highlight.classList.remove("good-blood", "bad-blood");

			const price = highlight.find(".tt-item-price");
			if (price) price.remove();
		}
	}
})();
