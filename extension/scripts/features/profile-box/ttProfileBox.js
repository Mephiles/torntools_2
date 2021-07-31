"use strict";

(async () => {
	if (!getPageStatus().access) return;

	featureManager.registerFeature(
		"Profile Box",
		"profile",
		() => settings.pages.profile.box,
		null,
		showBox,
		removeBox,
		{
			storage: ["settings.pages.profile.box"],
		},
		null
	);

	function showBox() {
		// FIXME - Position right.
		// FIXME - Fix margin top.
		const { content } = createContainer("User Information", {});
	}

	function removeBox() {
		removeContainer("User Information");
	}
})();
