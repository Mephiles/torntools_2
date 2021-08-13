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
				data = await new Promise((resolve) => CUSTOM_LISTENERS[EVENT_CHANNELS.PROFILE_FETCHED].push(({ data }) => resolve(data)));
			} else {
				try {
					data = await fetchData("torn", { section: "user", id, selections: ["profile", "personalstats", "crimes"], silent: true });

					ttCache.set({ [id]: data }, TO_MILLIS.HOURS * 6, "profile-stats").catch(() => {});
				} catch (error) {
					console.log("TT - Couldn't fetch users stats.", error);
				}
				return;
			}
		}

		if (!stats) {
			if (data) {
				const {
					rank,
					level,
					criminalrecord: { total: crimes },
					personalstats: { networth },
				} = data;

				stats = calculateEstimateBattleStats(rank, level, crimes, networth);

				//	FIXME - Cache result.
			} else {
				// FIXME - Show error.
				console.log("DKK no data");
				return;
			}
		}

		// FIXME - Show estimate.
		console.log("DKK hasStats", id, stats);
	}

	function removeEstimate() {
		document.find(".tt-stat-estimate")?.remove();
	}
})();
