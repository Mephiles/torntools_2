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
		if (!achievements.length) return;

		fillGoals();
		displayContainer();

		console.log("DKK showAchievements", { page, achievements });

		function fillGoals() {
			achievements.forEach((achievement) => {
				achievement.current = achievement.stats();
				achievement.goals = [];

				let { keyword, include, exclude } = achievement.detection;
				if (!include) include = [];
				if (!exclude) exclude = [];

				for (const type of ["honors", "medals"]) {
					const merits = torndata[type];

					for (let id in merits) {
						id = parseInt(id);

						const description = merits[id].description.toLowerCase();
						if (!description.includes(keyword)) continue;

						if (include.length && !include.every((incl) => description.includes(incl))) continue;
						if (exclude.length && exclude.some((excl) => description.includes(excl))) continue;

						achievement.goals.push({
							type,
							id,
							name: merits[id].name,
							description: merits[id].description,
							completed: userdata[`${type}_awarded`].includes(id),
						});
					}
				}

				achievement.goals = achievement.goals.sort((a, b) => {
					if (a > b) return 1;
					else if (a < b) return -1;
					else return 0;
				});
				achievement.completed = achievement.goals.every((goal) => goal.completed);
			});
		}

		function displayContainer() {
			const { content } = createContainer("Awards", {
				applyRounding: false,
				contentBackground: false,
				compact: true,
				previousElement: document.find("h2=Areas").closest("[class*='sidebar-block_']"),
			});

			for (const achievement of achievements) {
				content.appendChild(
					document.newElement({
						type: "div",
						class: `pill tt-award ${achievement.completed ? "completed" : ""}`,
						children: [
							document.newElement({
								type: "span",
								text: `${achievement.name}: ${
									achievement.completed
										? "Completed!"
										: `${formatNumber(achievement.current, { shorten: true })}/${formatNumber(
												achievement.goals.find((goal) => !goal.completed).id,
												{ shorten: true }
										  )}`
								}`,
							}),
						],
						dataset: { achievement: JSON.stringify(achievement) },
					})
				);
			}
		}
	}

	function removeAchievements() {
		removeContainer("Awards");
	}
})();
