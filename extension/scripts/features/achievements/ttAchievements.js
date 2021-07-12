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
		() => {}
	);

	function setupAchievements() {}

	async function showAchievements() {
		await requireSidebar();

		const page = getPage();

		console.log("DKK showAchievements", { page });
	}

	function removeAchievements() {
		removeContainer("Awards");
	}
})();
