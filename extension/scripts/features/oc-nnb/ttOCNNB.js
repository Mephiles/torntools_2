"use strict";

(async () => {
	if (!getPageStatus().access) return;

	const params = getSearchParameters();
	if (params.get("step") !== "your") return;

	const feature = featureManager.registerFeature(
		"OC NNB",
		"faction",
		() => settings.pages.faction.ocNnb,
		initialiseListeners,
		null,
		null,
		{
			storage: ["settings.pages.faction.ocNnb", "settings.external.yata"],
		},
		async () => {
			if (!hasAPIData()) return "No API access.";
			else if (!settings.external.yata && !settings.external.tornstats) return "YATA or TornStats not enabled";

			await checkMobile();
		}
	);

	function initialiseListeners() {
		CUSTOM_LISTENERS[EVENT_CHANNELS.FACTION_CRIMES].push(() => {
			if (!feature.enabled()) return;

			showNNB();
		});
	}

	async function showNNB() {
		const data = await loadData().catch((error) => {
			// TODO - Handle error while loading data.
		});
		if (!data) return;

		populateCrimes();
		populateSelection();
		// FIXME - Show nnb.

		async function loadData() {
			// FIXME - Load data from YATA in the background.
			// FIXME - Load data from TornStats.

			// FIXME - Combine the data to form a single source.
			return {};
		}

		function populateCrimes() {
			for (const row of document.findAll(".organize-wrap .crimes-list .details-list > li > ul")) {
				const modifiedElements = [".level"];
				if (mobile) modifiedElements.push(".member", ".stat", ".level", ".stat");

				modifiedElements.map((selector) => row.find(selector)).forEach((element) => element.classList.add("tt-modified"));

				const stat = row.find(".stat");
				if (row.classList.contains("title")) {
					stat.parentElement.insertBefore(document.newElement({ type: "li", class: "tt-nnb", text: "NNB" }), stat);
					continue;
				}

				// TODO - Works with honors disabled?
				const id = row.find(".h").getAttribute("href").split("XID=")[1];
				const nnb = "N/A"; // FIXME - Use loaded data.

				stat.parentElement.insertBefore(document.newElement({ type: "li", class: "tt-nnb", text: nnb }), stat);
			}
		}

		function populateSelection() {
			for (const row of document.findAll(".plans-list .item")) {
				const modifiedElements = [".offences"];
				if (mobile) modifiedElements.push(".member", ".level", ".act");

				modifiedElements.map((selector) => row.find(selector)).forEach((element) => element.classList.add("tt-modified"));

				const act = row.find(".act");
				if (row.classList.contains("title")) {
					act.parentElement.insertBefore(document.newElement({ type: "li", class: "tt-nnb short", text: "NNB" }), act);
					continue;
				}

				// TODO - Works with honors disabled?
				let id = row.find(".h").getAttribute("href").split("XID=")[1];
				// noinspection JSUnresolvedVariable
				const nnb = "N/A"; // FIXME - Use loaded data.

				act.parentElement.insertBefore(document.newElement({ type: "li", class: "tt-nnb short", text: nnb }), act);
			}
		}
	}
})();
