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
			const id = row
				.find(".user.name > [title]")
				.getAttribute("title")
				.match(/([0-9]+)/g)
				.last();
			const level = parseInt(row.find(".level").innerText.replaceAll("\n", "").split(":").last().trim());

			if (level && settings.scripts.statsEstimate.maxLevel && settings.scripts.statsEstimate.maxLevel < level) continue;

			row.classList.add(".tt-estimated");

			const section = document.newElement({ type: "div", class: "tt-stats-estimate" });
			row.insertAdjacentElement("afterend", section);

			showLoadingPlaceholder(section, true);

			if (!ttCache.hasValue("stats-estimate", id) && !ttCache.hasValue("profile-stats", id)) estimated++;

			retrieveStatsEstimate(id, true, estimated - 1)
				.then((estimate) => (section.innerText = `Stats Estimate: ${estimate}`))
				.catch((error) => {
					if (error.show) {
						section.innerText = error.message;
					} else {
						section.remove();
					}
				})
				.then(() => showLoadingPlaceholder(section, false));
		}
	}

	function removeEstimates() {
		document.findAll(".tt-stat-estimate")?.remove();
	}
})();
