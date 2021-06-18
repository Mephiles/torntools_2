"use strict";

(async () => {
	if (!getPageStatus().access) return;

	const params = getSearchParameters();
	if (params.get("step") !== "your") return;

	const feature = featureManager.registerFeature(
		"OC Times",
		"faction",
		() => settings.pages.faction.ocTimes,
		initialiseListeners,
		startFeature,
		removeTimes,
		{
			storage: ["settings.pages.faction.ocTimes"],
		},
		async () => {
			if (!hasAPIData() || !factiondata || !factiondata.crimes) return "No API access.";
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

	function showTimes() {
		for (const crime of document.findAll(".organize-wrap .crimes-list > .item-wrap")) {
			const id = crime.find(".details-wrap").dataset.crime;

			let text;
			if (id in factiondata.crimes) {
				const finish = new Date(factiondata.crimes[id].time_ready * 1000);

				text = `${formatTime(finish)} | ${formatDate(finish)}`;
			} else {
				text = "N/A";
			}

			crime.find(".status").appendChild(document.newElement({ type: "span", class: "tt-oc-time", text }));
		}
	}

	function removeTimes() {
		for (const timer of document.findAll(".tt-oc-time")) timer.remove();
	}
})();
