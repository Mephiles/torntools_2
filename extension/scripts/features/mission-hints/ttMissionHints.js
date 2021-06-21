"use strict";

(async () => {
	if (!getPageStatus().access) return;

	const feature = featureManager.registerFeature(
		"Mission Hints",
		"missions",
		() => settings.pages.missions.hints,
		initialise,
		showHints,
		removeHints,
		{
			storage: ["settings.pages.missions.hints"],
		},
		null
	);

	function initialise() {
		CUSTOM_LISTENERS[EVENT_CHANNELS.MISSION_LOAD].push(() => {
			if (!feature.enabled()) return;

			showHints();
		});
	}

	function showHints() {
		// FIXME - Show mission hints.
	}

	function removeHints() {
		// FIXME - Remove those hints.
	}
})();
