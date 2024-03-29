"use strict";

(async () => {
	const feature = featureManager.registerFeature(
		"Member rank",
		"faction",
		() => settings.pages.faction.numberMembers,
		addListener,
		addNumbers,
		removeNumbers,
		{
			storage: ["settings.pages.faction.numberMembers"],
		},
		null
	);

	function addListener() {
		if (isOwnFaction) {
			CUSTOM_LISTENERS[EVENT_CHANNELS.FACTION_INFO].push(() => {
				if (!feature.enabled()) return;

				addNumbers(true);
			});
		}
	}

	async function addNumbers(force) {
		if (!force && isOwnFaction && getHashParameters().get("tab") !== "info") return;

		if (document.find(".tt-member-index")) return;
		await requireElement("#faction-info-members .table-body > .table-row");

		const list = document.find("#faction-info-members .members-list");
		if (list.classList.contains("tt-modified")) return;
		list.classList.add("tt-modified");

		list.findAll(".table-body > .table-row").forEach((row, index) =>
			row.insertAdjacentElement(
				"afterbegin",
				document.newElement({
					type: "div",
					class: "tt-member-index",
					text: index + 1,
				})
			)
		);
	}

	function removeNumbers() {
		document.findAll(".tt-member-index").forEach((element) => element.remove());
	}
})();
