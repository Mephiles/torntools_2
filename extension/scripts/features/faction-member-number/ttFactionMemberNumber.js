"use strict";

(async () => {
	const feature = featureManager.registerFeature(
		"Number members of faction",
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
		if (isOwnFaction()) {
			CUSTOM_LISTENERS[EVENT_CHANNELS.FACTION_INFO].push(addNumbers);
		}
	}

	async function addNumbers(triggeredByListener) {
		if (!triggeredByListener && isOwnFaction() && getHashParameters().get("tab") !== "info") return;
		if (!feature.enabled() || document.find(".tt-member-index")) return;
		await requireElement("#faction-info-members .table-body > .table-row");
		document.findAll("#faction-info-members .table-body > .table-row").forEach((memberRow, index) => {
			memberRow.insertAdjacentElement("afterbegin", document.newElement({
				type: "div",
				class: "tt-member-index",
				text: index + 1,
			}))
		});
	}

	function removeNumbers() {
		document.findAll(".tt-member-index").forEach(x => x.remove());
	}
})();
