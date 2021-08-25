"use strict";

(async () => {
	if (!getPageStatus().access) return;
	if (!isAbroad()) return;

	const statsEstimate = new StatsEstimate(true);
	const feature = featureManager.registerFeature(
		"Stats Estimate",
		"stat estimates",
		() => settings.scripts.statsEstimate.global && settings.scripts.statsEstimate.abroad,
		registerListeners,
		startFeature,
		removeEstimates,
		{
			storage: ["settings.scripts.statsEstimate.global", "settings.scripts.statsEstimate.abroad"],
		},
		() => {
			if (!hasAPIData()) return "No API access.";
		}
	);

	let triggerFilter;

	function registerListeners() {
		// FIXME - Handle page switching.
		// CUSTOM_LISTENERS[EVENT_CHANNELS.USERLIST_SWITCH_PAGE].push(() => {
		// 	if (!feature.enabled() || settings.pages.userlist.filter) return;
		//
		// 	showEstimates();
		// });
		CUSTOM_LISTENERS[EVENT_CHANNELS.FILTER_APPLIED].push(() => {
			if (!feature.enabled()) return;

			if (triggerFilter) clearTimeout(triggerFilter);
			triggerFilter = setTimeout(showEstimates, 500);
		});
	}

	async function startFeature() {
		// FIXME - Handle filter.
		// if (settings.pages.userlist.filter) {
		// 	const list = document.find(".user-info-list-wrap");
		// 	if (!list || list.find(".ajax-placeholder")) return;
		// }

		await showEstimates();
	}

	async function showEstimates() {
		console.log("DKK showEstimates 1");

		// FIXME - Handle estimates.
		await requireElement(".users-list");
		// await requireElement(".user-info-list-wrap .ajax-placeholder", { invert: true });

		statsEstimate.clearQueue();
		console.log("DKK showEstimates 2", document.findAll(".users-list > li"));
		statsEstimate.showEstimates(
			".users-list > li",
			(row) => ({
				id: row
					.find(".user.name > [title]")
					.getAttribute("title")
					.match(/([0-9]+)/g)
					?.last(),
				level: row.find(".level").textContent.getNumber(),
			}),
			true
		);
	}

	function removeEstimates() {
		statsEstimate.clearQueue();
		document.findAll(".tt-stats-estimate").forEach((estimate) => estimate.remove());
	}
})();
