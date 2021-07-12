"use strict";

(async () => {
	if (await checkMobile()) return "Not supported on mobile!";
	if (isFlying() || isAbroad()) return;

	const ACHIEVEMENTS = [
		{
			name: "Perks",
			stats: () =>
				userdata.company_perks.length +
				userdata.education_perks.length +
				userdata.enhancer_perks.length +
				userdata.faction_perks.length +
				userdata.job_perks.length +
				userdata.merit_perks.length +
				userdata.property_perks.length +
				userdata.stock_perks.length,
			detection: { keyword: "personal perks" },
			requirements: { pages: ["home"] },
		},
		{
			name: "Awards",
			stats: () => userdata.personalstats.awards,
			detection: { keyword: "total awards" },
			// FIXME - Load on the awards page?
			requirements: { pages: ["home"] },
		},
		{
			name: "Married (days)",
			stats: () => userdata.married.duration,
			detection: { keyword: "stay married" },
			// FIXME - Load on the church?
			requirements: { pages: ["home"] },
		},
		{
			name: "Points sold",
			stats: () => userdata.personalstats.pointssold,
			detection: { keyword: "points on the market" },
			// FIXME - Load on the points market?
			requirements: { pages: ["home"] },
		},
		{
			name: "Activity",
			stats: () => Math.floor(userdata.personalstats.useractivity / (TO_MILLIS.HOURS / TO_MILLIS.SECONDS)),
			detection: { keyword: "activity" },
			requirements: { pages: ["home"] },
		},
		{
			name: "Bazaar buyers",
			stats: () => userdata.personalstats.bazaarcustomers,
			detection: { keyword: "customers buy from your bazaar" },
			requirements: { pages: ["home"] },
		},
		{
			name: "Stock payouts",
			stats: () => userdata.personalstats.stockpayouts,
			detection: { keyword: "payouts" },
			requirements: { pages: ["home"] },
		},
		{
			name: "Donator (days)",
			stats: () => userdata.personalstats.daysbeendonator,
			detection: { keyword: "donator" },
			requirements: { pages: ["home"] },
		},
		{
			name: "Energy refills",
			stats: () => userdata.personalstats.refills,
			detection: { keyword: "refill", include: ["energy"] },
			requirements: { pages: ["home"] },
		},
		{
			name: "Nerve refills",
			stats: () => userdata.personalstats.nerverefills,
			detection: { keyword: "refill", include: ["nerve"] },
			requirements: { pages: ["home"] },
		},
		{
			name: "Casino refills",
			stats: () => userdata.personalstats.tokenrefills,
			detection: { keyword: "refill", include: ["casino"] },
			requirements: { pages: ["home"] },
		},
		{
			name: "Networth",
			stats: () => userdata.personalstats.networth,
			detection: { keyword: "networth" },
			requirements: { pages: ["home"] },
		},
	];

	featureManager.registerFeature(
		"Achievements",
		"achievements",
		() => settings.scripts.achievements.show,
		setupAchievements,
		showAchievements,
		removeAchievements,
		{
			storage: ["settings.scripts.achievements.show"],
		},
		() => {
			if (
				!hasAPIData() ||
				!settings.apiUsage.user.personalstats ||
				!settings.apiUsage.user.perks ||
				!settings.apiUsage.user.medals ||
				!settings.apiUsage.user.honors
			)
				return "No API access.";
		}
	);

	function setupAchievements() {}

	async function showAchievements() {
		await requireSidebar();

		const page = getPage();
		const achievements = ACHIEVEMENTS.filter((achievement) => {
			if (achievement.requirements.pages) return achievement.requirements.pages.includes(page);
			else return false;
		}).sort((a, b) => {
			const upperA = a.name.toUpperCase();
			const upperB = b.name.toUpperCase();

			if (upperA > upperB) return 1;
			else if (upperA < upperB) return -1;
			else return 0;
		});

		fillGoals();

		console.log("DKK showAchievements", { page, achievements });

		function fillGoals() {
			achievements.forEach((achievement) => {
				achievement.active = { current: achievement.stats(), goals: [] };

				let { keyword, include, exclude } = achievement.detection;
				if (!include) include = [];
				if (!exclude) exclude = [];

				for (const type of ["honors", "medals"]) {
					const merits = torndata[type];

					for (const id in merits) {
						const description = merits[id].description.toLowerCase();
						if (!description.includes(keyword)) continue;

						if (include.length && !include.every((incl) => description.includes(incl))) continue;
						if (exclude.length && exclude.some((excl) => description.includes(excl))) continue;

						achievement.active.goals.push({
							type,
							id,
							name: merits[id].name,
							description: merits[id].description,
							completed: userdata[`${type}_awarded`].includes(id),
						});
					}
				}
			});
		}
	}

	function removeAchievements() {
		removeContainer("Awards");
	}
})();
