"use strict";

(async () => {
	if (!getPageStatus().access) return;

	const feature = featureManager.registerFeature(
		"Racing Upgrades",
		"racing",
		() => settings.pages.racing.upgrades,
		initialise,
		startFeature,
		removeUpgrades,
		{
			storage: ["settings.pages.racing.upgrades"],
		},
		null
	);

	function initialise() {
		addXHRListener(async ({ detail: { page, xhr, uri } }) => {
			if (!feature.enabled()) return;

			if (page === "loader") {
				const sid = uri.sid;
				if (sid !== "racing") return;

				const tab = uri.tab;
				if (tab !== "parts") return;

				await requireElement(".enlist-list");

				for (const car of document.findAll("[step-value='selectParts']:not(.tt-modified)")) {
					car.classList.add("tt-modified");
					car.addEventListener("click", () => requireElement(".pm-categories-wrap").then(showUpgrades));
				}
			} else if (page === "loader2") {
				const params = new URLSearchParams(xhr.requestBody);
				const sid = params.get("sid");
				const step = params.get("step");
				const confirm = params.get("confirm");

				console.log("DKK loader2", { sid, step, confirm });
			}
		});
	}

	function startFeature() {
		if (!document.find(".pm-categories-wrap")) return;

		showUpgrades();
	}

	async function showUpgrades() {
		console.log("DKK showUpgrades");
	}

	function resetUpgrades() {}

	function removeUpgrades() {}
})();
