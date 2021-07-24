"use strict";

(async () => {
	if (!getPageStatus().access) return;

	const feature = featureManager.registerFeature(
		"Faction Member Number",
		"faction",
		() => settings.pages.faction.factionMemberFilter,
		addListener,
		addFilter,
		removeFilter,
		{
			storage: ["settings.pages.faction.factionMemberFilter"],
		},
		null
	);

	function addListener() {
		if (isOwnFaction()) {
			CUSTOM_LISTENERS[EVENT_CHANNELS.FACTION_INFO].push(() => {
				if (!feature.enabled()) return;

				applyFilter();
			});
		}
	}

	async function addFilter() {
		await requireElement("#faction-info-members .members-list .table-row");

		const { content } = createContainer("Faction Member Filter", {
			class: "mt10",
			nextElement: document.getElementById("faction-info-members"),
			compact: true,
			filter: true,
		});

		const statistics = createStatistics();
		content.appendChild(statistics.element);
		localFilters["Statistics"] = { updateStatistics: statistics.updateStatistics };

		const filterContent = document.newElement({
			type: "div",
			class: "content",
		});

		const activityFilter = createFilterSection({
			type: "Activity",
			defaults: filters.hospital.activity,
			callback: applyFilter,
		});
		filterContent.appendChild(activityFilter.element);
		localFilters["Activity"] = { getSelections: activityFilter.getSelections };

		const specialFilter = createFilterSection({
			title: "Special",
			ynCheckboxes: ["Fedded", "New Player", "In Company", "Is Donator"],
			defaults: filters.abroadPeople.special,
			callback: filtering,
		});
		filterContent.appendChild(specialFilter.element);

		const factionFilter = createFilterSection({
			title: "Faction",
			select: [...defaultFactionsItems, ...getFactions()],
			defaults: "",
			callback: applyFilter,
		});
		filterContent.appendChild(factionFilter.element);
		localFilters["Faction"] = { getSelected: factionFilter.getSelected, updateOptions: factionFilter.updateOptions };

		const levelFilter = createFilterSection({
			title: "Level Filter",
			noTitle: true,
			slider: {
				min: 1,
				max: 100,
				step: 1,
				valueLow: filters.hospital.levelStart,
				valueHigh: filters.hospital.levelEnd,
			},
			callback: applyFilter,
		});
		filterContent.appendChild(levelFilter.element);
		localFilters["Level Filter"] = { getStartEnd: levelFilter.getStartEnd, updateCounter: levelFilter.updateCounter };

		content.appendChild(filterContent);

		await applyFilter();
		if (isOwnFaction()) {
			
		} else {
			
		}
	}

	function removeFilter() {
		document.findAll(".tt-member-index").forEach((element) => element.remove());
	}
})();
