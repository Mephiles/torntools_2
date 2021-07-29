"use strict";

(async () => {
	if (!isOwnCompany) return;

	const feature = featureManager.registerFeature(
		"Employee Inactivity Warning",
		"companies",
		() => isOwnCompany && Object.keys(settings.employeeInactivityWarning).length,
		addListener,
		addWarning,
		removeWarning,
		{
			storage: ["settings.employeeInactivityWarning"],
		},
		null
	);

	let lastActionState = settings.scripts.lastAction.companyOwn;
	function addListener() {
		CUSTOM_LISTENERS[EVENT_CHANNELS.FEATURE_ENABLED].push(async ({ name }) => {
			if (feature.enabled() && name === "Last Action") {
				lastActionState = true;
				await addWarning(true);
			}
		});
		CUSTOM_LISTENERS[EVENT_CHANNELS.FEATURE_DISABLED].push(async ({ name }) => {
			if (!feature.enabled()) return;

			if (name === "Last Action") {
				lastActionState = false;
				await removeWarning();
			}
		});
	}

	async function addWarning(force) {
		if (!force) return;

		document.findAll(".employee-list-wrap .employee-list > li").forEach(li => {
			if (li.nextSibling.className.includes("tt-last-action")) {
				const days = li.nextSibling.getAttribute("days");
				Object.keys(settings.employeeInactivityWarning).forEach((maxDays, index) => {
					if (days >= maxDays) {
						li.classList.add("tt-modified");
						if (index === 0) li.classList.add("inactive-one");
						else if (index === 1) {
							li.classList.remove("inactive-one");
							li.classList.add("inactive-two");
						}
					}
				});
			}
		});
		document.documentElement.style.setProperty("--tt-inactive-one-background-color", Object.entries(settings.employeeInactivityWarning)[0][1]);
		document.documentElement.style.setProperty("--tt-inactive-two-background-color", Object.entries(settings.employeeInactivityWarning)[1][1]);
	}

	function removeWarning() {
		document.findAll(".employee-list-wrap .employee-list > li.tt-modified").forEach((x) => x.classList.remove("hidden"));
	}
})();
