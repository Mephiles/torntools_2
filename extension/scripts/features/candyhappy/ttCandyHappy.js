"use strict";

(async () => {
	const feature = featureManager.registerFeature(
		"Candy Happy",
		"items",
		() => settings.pages.items.candyHappyGains,
		initialiseAddGains,
		addGains,
		removeGains,
		{
			storage: ["settings.pages.items.candyHappyGains"],
		},
		() => {
			if (!hasAPIData()) return "No API access.";
		}
	);

	function initialiseAddGains() {
		const listener = () => {
			if (feature.enabled()) addGains();
		};
		CUSTOM_LISTENERS[EVENT_CHANNELS.ITEM_ITEMS_LOADED].push(listener);
		CUSTOM_LISTENERS[EVENT_CHANNELS.ITEM_SWITCH_TAB].push(listener);
	}

	function addGains() {
		const factionPerk = parseInt(userdata.faction_perks.filter((x) => /candy/i.test(x)).map((x) => x.replace(/\D+/g, ""))[0]);
		const companyPerk = parseInt(userdata.company_perks.filter((x) => /boost/i.test(x)).map((x) => x.replace(/\D+/g, ""))[0]);
		document.findAll("[data-category='Candy']").forEach((candy) => {
			if (candy.find(".tt-candy-gains")) return;

			// noinspection JSCheckFunctionSignatures,DuplicatedCode
			const baseHappy = parseInt(
				torndata.items[candy.dataset.item].effect
					.split(" ")
					.map((x) => parseInt(x))
					.filter((x) => !isNaN(x))[0]
			);
			let totalHappy = baseHappy;
			if (!isNaN(factionPerk)) totalHappy += (factionPerk / 100) * baseHappy;
			if (!isNaN(companyPerk)) totalHappy += (companyPerk / 100) * baseHappy;
			const rawHTML = `<span class="tt-candy-gains">${totalHappy}H</span>`;
			candy.find(".name-wrap").insertAdjacentHTML("beforeend", rawHTML);
		});
	}

	function removeGains() {
		document.findAll(".tt-candy-gains").forEach((x) => x.remove());
	}
})();
