"use strict";

(async () => {
	if (!getPageStatus().access) return;

	const feature = featureManager.registerFeature(
		"Stats Estimate",
		"stat estimates",
		() => settings.scripts.statsEstimate.global && settings.scripts.statsEstimate.enemies,
		registerListeners,
		showEstimates,
		removeEstimates,
		{
			storage: ["settings.scripts.statsEstimate.global", "settings.scripts.statsEstimate.enemies"],
		},
		() => {
			if (!hasAPIData()) return "No API access.";
		}
	);

	function registerListeners() {
		addXHRListener(async ({ detail: { page, xhr } }) => {
			if (!feature.enabled()) return;
			if (page !== "userlist") return;

			const step = new URLSearchParams(xhr.requestBody).get("step");
			if (step !== "blackList") return;

			new MutationObserver((mutations, observer) => {
				showEstimates();
				observer.disconnect();
			}).observe(document.find(".blacklist"), { childList: true });
		});
	}

	async function showEstimates() {
		await requireElement(".user-info-blacklist-wrap");

		let estimated = 0;
		for (const row of document.findAll(".user-info-blacklist-wrap > li[data-id]:not(.tt-estimated)")) {
			// FIXME - Don't break when honors are disabled.
			const id = row
				.find(".user.name")
				.dataset.placeholder.match(/([0-9]+)/g)
				.last();
			// FIXME - Calculate level.
			const level = false;

			if (level && settings.scripts.statsEstimate.maxLevel && settings.scripts.statsEstimate.maxLevel < level) continue;

			row.classList.add(".tt-estimated");

			// FIXME - Show loading placeholder.
			if (!ttCache.hasValue("stats-estimate", id) && !ttCache.hasValue("profile-stats", id)) estimated++;

			retrieveStatsEstimate(id, true, estimated - 1)
				.then((estimate) => {
					console.log("DKK estimate", id, estimate);
					// FIXME - Actually show estimate
					// FIXME - Remove loading placeholder.
				})
				.catch((error) => {
					// FIXME - Remove loading placeholder.

					if (error.show) {
						// FIXME - Show error.
					} else {
						// FIXME - Show error.
					}
				});
		}
	}

	function removeEstimates() {
		document.findAll(".tt-stat-estimate")?.remove();
	}
})();
