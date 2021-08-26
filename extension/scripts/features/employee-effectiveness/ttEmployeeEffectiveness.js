"use strict";

(async () => {
	if (!getPageStatus().access) return;
	if (!isOwnCompany) return;

	const feature = featureManager.registerFeature(
		"Employee Effectiveness",
		"companies",
		() => settings.pages.companies.employeeEffectiveness,
		initialiseListeners,
		startFeature,
		removeEffectiveness,
		{
			storage: ["settings.pages.companies.employeeEffectiveness"],
		}
	);

	function initialiseListeners() {
		CUSTOM_LISTENERS[EVENT_CHANNELS.COMPANY_EMPLOYEES_PAGE].push(() => {
			if (!feature.enabled()) return;

			showEffectiveness();
		});
	}

	function startFeature() {
		if (getHashParameters().get("option") !== "employees") return;

		showEffectiveness();
	}

	async function showEffectiveness() {
		const list = await requireElement(".employee-list");

		const x = settings.pages.companies.employeeEffectiveness;
		for (const row of list.findAll(".effectiveness[data-multipliers]")) {
			const multipliers = JSON.parse(row.dataset.multipliers);
			// const [stats, settled, book, merits, education, u1, u2, addiction, u3] = multipliers;
			let [, , , , , , , addiction] = multipliers;
			addiction *= -1;

			const element = row.find(".effectiveness-value");

			if (addiction < x) {
				element.classList.remove("tt-employee-effectiveness");
				continue;
			}

			element.classList.add("tt-employee-effectiveness");
		}
	}

	function removeEffectiveness() {
		for (const effectiveness of document.findAll(".tt-employee-effectiveness")) effectiveness.classList.remove("tt-employee-effectiveness");
	}
})();
