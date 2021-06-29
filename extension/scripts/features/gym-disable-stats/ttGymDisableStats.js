"use strict";

(async () => {
	if (!getPageStatus().access) return;

	const feature = featureManager.registerFeature(
		"Disable Stats",
		"gym",
		() => settings.pages.gym.disableStats,
		initialiseListeners,
		showCheckboxes,
		dispose,
		{
			storage: ["settings.pages.gym.disableStats"],
		},
		null
	);

	function initialiseListeners() {
		CUSTOM_LISTENERS[EVENT_CHANNELS.GYM_LOAD].push(() => {
			if (!feature.enabled()) return;

			showCheckboxes();
		});

		requireElement("ul[class*='properties_']").then(() => {
			new MutationObserver((mutations) => {
				if (!feature.enabled()) return;

				for (const mutation of mutations) {
					const checkbox = mutation.target.find(".tt-stat-checkbox");
					if (!checkbox) continue;

					const classList = mutation.target.classList;
					if (!classList.contains("tt-modified")) classList.add("tt-modified");
					if (classList.contains("tt-gym-locked") !== checkbox.checked) classList.toggle("tt-gym-locked");
				}
			}).observe(document.find("ul[class*='properties_']"), { classList: true, attributes: true, subtree: true });
		});
	}

	async function showCheckboxes() {
		await requireElement("#gymroot ul[class*='properties___']");
		await sleep();

		const properties = document.find("#gymroot ul[class*='properties___']");

		for (const stat of properties.findAll(":scope > li:not([class*='locked___']):not(.tt-modified)")) {
			stat.classList.add("tt-modified");
			stat.appendChild(
				document.newElement({
					type: "input",
					class: "tt-stat-checkbox",
					attributes: { type: "checkbox" },
					events: {
						click() {
							toggleStat(stat);
						},
					},
				})
			);

			const name = stat.find("[class*='propertyValue___']").id.split("-")[0];

			if (filters.gym[name]) toggleStat(stat, false);
		}

		function toggleStat(stat, save = true) {
			const checkbox = stat.find(".tt-stat-checkbox");

			const isLocked = stat.classList.toggle("tt-gym-locked");

			checkbox.checked = isLocked;

			if (save) {
				const name = stat.find("[class*='propertyValue___']").id.split("-")[0];

				ttStorage.change({ filters: { gym: { [name]: isLocked } } });
			}
		}
	}

	function dispose() {
		for (const checkbox of document.findAll(".tt-stat-checkbox")) checkbox.remove();
		for (const stat of document.findAll(".tt-gym-locked, #gymroot ul[class*='properties___'] > li.tt-modified"))
			stat.classList.remove(".tt-gym-locked", "tt-modified");
	}
})();
