"use strict";

(async () => {
	if (!getPageStatus().access) return;
	if (isOwnProfile()) return;

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
		() => {
			if (!hasAPIData()) return "No API access.";
		}
	);

	async function showBox() {
		await requireElement(".profile-wrapper");

		const { content } = createContainer("User Information", {
			nextElement: document.find(".medals-wrapper") || document.find(".basic-information")?.closest(".profile-wrapper"),
			class: "mt10",
		});
	}

	function removeBox() {
		removeContainer("User Information");
	}
})();
