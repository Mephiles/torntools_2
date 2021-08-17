"use strict";

(async () => {
	if (!getPageStatus().access) return;

	const feature = featureManager.registerFeature(
		"Stats Estimate",
		"stat estimates",
		() => settings.scripts.statsEstimate.global && settings.scripts.statsEstimate.hof,
		registerListeners,
		showEstimates,
		removeEstimates,
		{
			storage: ["settings.scripts.statsEstimate.global", "settings.scripts.statsEstimate.hof"],
		},
		() => {
			if (!hasAPIData()) return "No API access.";
		}
	);

	function registerListeners() {
		addXHRListener(async ({ detail: { page, xhr } }) => {
			if (!feature.enabled()) return;
			if (page !== "halloffame") return;

			const params = new URLSearchParams(xhr.requestBody);
			const step = params.get("step");
			if (step !== "getListHallOfFame") return;

			const type = params.get("type");
			if (type === "battlestats" || type === "respect") return;

			await requireElement(".players-list .ajax-placeholder", { invert: true });

			showEstimates().then(() => {});
		});
	}

	async function showEstimates() {
		await requireElement(".players-list");

		let levelSelector;
		if (document.find(".hall-of-fame-list-wrap .hall-of-fame-wrap").classList.contains("levels")) {
			levelSelector = ".player-info .col-big.bold";
		} else {
			levelSelector = ".player-info .col-small";
		}

		executeStatsEstimate(".players-list > li", (row) => ({
			id: row
				.find(".user.name > [title]")
				.getAttribute("title")
				.match(/([0-9]+)/g)
				.last(),
			level: parseInt(row.find(levelSelector).innerText),
		}));
	}

	function removeEstimates() {
		document.findAll(".tt-stat-estimate").forEach((estimate) => estimate.remove());
	}
})();
