"use strict";

(async () => {
	if (await checkMobile()) return "Not supported on mobile!";
	if (isFlying() || isAbroad()) return;

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
