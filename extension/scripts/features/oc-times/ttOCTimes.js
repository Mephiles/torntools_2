"use strict";

(async () => {
	if (!getPageStatus().access) return;

	const params = getSearchParameters();
	if (params.get("step") !== "your") return;

	const feature = featureManager.registerFeature(
		"OC Times",
		"faction",
		() => settings.pages.faction.ocNnb,
		initialiseListeners,
		startFeature,
		removeTimes,
		{
			storage: ["settings.pages.faction.ocNnb"],
		},
		async () => {
			if (!hasAPIData() || !factiondata) return "No API access.";
		}
	);

	function initialiseListeners() {
		CUSTOM_LISTENERS[EVENT_CHANNELS.FACTION_CRIMES].push(() => {
			if (!feature.enabled()) return;

			showTimes();
		});
	}

	function startFeature() {
		if (!document.find(".faction-crimes-wrap")) return;

		showTimes();
	}

	function showTimes() {}

	function removeTimes() {}
})();
