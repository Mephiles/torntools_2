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
			let upperA = a.group ? a.group.toUpperCase() : a.name.toUpperCase();
			let upperB = b.group ? b.group.toUpperCase() : b.name.toUpperCase();

			if (upperA > upperB) return 1;
			else if (upperA < upperB) return -1;
			else {
				upperA = a.name.toUpperCase();
				upperB = b.name.toUpperCase();

				if (upperA > upperB) return 1;
				else if (upperA < upperB) return -1;
				else return 0;
			}
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

						// FIXME - Get goal from description.

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
			const { content, options } = createContainer("Awards", {
				applyRounding: false,
				contentBackground: false,
				compact: true,
				previousElement: document.find("h2=Areas").closest("[class*='sidebar-block_']"),
			});
			showTimer();

			const tooltipContent = document.newElement({ type: "div", class: "tt-achievement-tooltip-content" });
			const tooltip = document.newElement({
				type: "div",
				class: "tt-achievement-tooltip",
				children: [document.newElement({ type: "div", class: "tt-achievement-tooltip-arrow" }), tooltipContent],
			});
			document.body.appendChild(tooltip);

			for (const achievement of achievements) {
				if (!settings.scripts.achievements.completed && achievement.completed) continue;

				const pill = document.newElement({
					type: "div",
					class: `pill tt-award ${achievement.completed ? "completed" : ""}`,
					children: [
						document.newElement({
							type: "span",
							text: `${achievement.name}: ${
								achievement.completed
									? "Completed!"
									: `${formatNumber(achievement.current, { shorten: true })}/${formatNumber(
											achievement.goals.find((goal) => !goal.completed).id, // FIXME - Show goal.
											{ shorten: true }
									  )}`
							}`,
						}),
					],
					attributes: { tabindex: "-1" },
					dataset: {
						goals: achievement.goals.map((goal) => goal.id), // FIXME - Show goal.
						score: achievement.current,
					},
				});

				pill.addEventListener("mouseenter", showTooltip);
				pill.addEventListener("focus", showTooltip);

				pill.addEventListener("mouseleave", hideTooltip);
				pill.addEventListener("blur", hideTooltip);

				content.appendChild(pill);
			}

			function showTimer() {
				options.appendChild(
					document.newElement({
						type: "span",
						class: "tt-awards-time-ago count automatic",
						text: formatTime({ milliseconds: userdata.dateBasic }, { type: "ago", short: true }),
						dataset: {
							seconds: Math.floor(userdata.dateBasic / TO_MILLIS.SECONDS),
							timeSettings: { type: "ago", short: true },
						},
					})
				);
			}

			function showTooltip(event) {
				if (event.target.classList.contains("active")) return;
				event.target.classList.add("active");

				const position = event.target.getBoundingClientRect();
				const positionBody = document.body.getBoundingClientRect();
				tooltip.style.left = `${position.x + 172 + 7}px`;
				tooltip.style.top = `${position.y + Math.abs(positionBody.y) + 6}px`;
				tooltip.style.display = "block";
				tooltipContent.innerHTML = "";

				// FIXME - Show tooltip content.

				console.log("DKK showTooltip", event);
			}

			function hideTooltip(event) {
				if (document.activeElement === event.target) return;
				event.target.classList.remove("active");

				tooltip.style.display = "none";
			}
		}
	}

	function removeAchievements() {
		removeContainer("Awards");
	}
})();
