"use strict";

(async () => {
	if (!getPageStatus().access) return;
	if (isOwnProfile()) return;

	featureManager.registerFeature(
		"Stats Estimate",
		"stat estimates",
		() => settings.scripts.statsEstimate.global && settings.scripts.statsEstimate.profiles,
		null,
		showEstimate,
		removeEstimate,
		{
			storage: ["settings.scripts.statsEstimate.global", "settings.scripts.statsEstimate.profiles"],
		},
		() => {
			if (!hasAPIData()) return "No API access.";
		}
	);

	async function showEstimate() {
		await requireElement(".basic-information .info-table .user-info-value");

		const id = parseInt(
			document
				.find(".basic-information .info-table .user-info-value > *:first-child")
				.innerText.trim()
				.match(/\[([0-9]*)]/i)[1]
		);

		let stats, data;
		if (ttCache.hasValue("stats-estimate", id)) {
			stats = ttCache.get("stats-estimate", id);
		} else if (ttCache.hasValue("profile-stats", id)) {
			data = ttCache.get("profile-stats", id);
		} else {
			if (settings.pages.profile.box && settings.pages.profile.boxStats && settings.apiUsage.user.personalstats && settings.apiUsage.user.crimes) {
				// TODO - Wait on stats.
				console.log("DKK showEstimate - wait on profile box");
				return;
			} else {
				console.log("DKK showEstimate - load required stats");
			}
			// try {
			// 	data = await fetchData("torn", { section: "user", id, selections: ["profile", "personalstats", "crimes"], silent: true });
			//
			// 	ttCache.set({ [id]: data }, TO_MILLIS.HOURS * 6, "profile-stats").catch(() => {});
			// } catch (error) {
			// 	console.log("TT - Couldn't fetch users stats.", error);
			// }
		}

		console.log("DKK showEstimate", id, stats, data);
	}

	function removeEstimate() {
		document.find(".tt-stat-estimate")?.remove();
	}
})();
