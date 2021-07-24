"use strict";

(async () => {
	const feature = featureManager.registerFeature(
		"Faction Member Filter",
		"faction",
		() => settings.pages.faction.memberFilter,
		addListener,
		addFilter,
		removeFilter,
		{
			storage: ["settings.pages.faction.memberFilter"],
		},
		null
	);

	function addListener() {
		if (isOwnFaction()) {
			CUSTOM_LISTENERS[EVENT_CHANNELS.FACTION_INFO].push(() => {
				if (!feature.enabled()) return;

				addFilter();
			});
		}
	}

	const localFilters = {};
	async function addFilter() {
		await requireElement("#faction-info-members .members-list .table-row");

		const { content } = createContainer("Member Filter", {
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
			defaults: filters.faction.activity,
			callback: applyFilter,
		});
		filterContent.appendChild(activityFilter.element);
		localFilters["Activity"] = { getSelections: activityFilter.getSelections };

		const specialFilter = createFilterSection({
			title: "Special",
			ynCheckboxes: ["Fedded", "New Player", "In Company", "Is Donator"],
			defaults: filters.faction.special,
			callback: applyFilter,
		});
		localFilters["Special"] = { getSelections: specialFilter.getSelections };
		filterContent.appendChild(specialFilter.element);

		const positionFilter = createFilterSection({
			title: "Position",
			select: getPositions(),
			defaults: "",
			callback: applyFilter,
		});
		filterContent.appendChild(positionFilter.element);
		localFilters["Position"] = { getSelected: positionFilter.getSelected };

		const statusFilter = createFilterSection({
			title: "Status",
			select: [
				{ value: "", description: "All" },
				{ value: "------", description: "------", disabled: true },
				{ value: "Okay" , description: "Okay" },
				{ value: "Hospital" , description: "Hospital" },
				{ value: "Jail" , description: "Jail" },
				{ value: "Traveling" , description: "Traveling" },
			],
			defaults: "",
			callback: applyFilter,
		});
		filterContent.appendChild(statusFilter.element);
		localFilters["Status"] = { getSelected: statusFilter.getSelected };

		const levelFilter = createFilterSection({
			title: "Level Filter",
			noTitle: true,
			slider: {
				min: 1,
				max: 100,
				step: 1,
				valueLow: filters.faction.levelStart,
				valueHigh: filters.faction.levelEnd,
			},
			callback: applyFilter,
		});
		filterContent.appendChild(levelFilter.element);
		localFilters["Level Filter"] = { getStartEnd: levelFilter.getStartEnd, updateCounter: levelFilter.updateCounter };

		const lastActiveFilter = createFilterSection({
			title: "Last Active Filter",
			noTitle: true,
			slider: {
				min: 1,
				max: 100,
				step: 1,
				valueLow: filters.faction.levelStart,
				valueHigh: filters.faction.levelEnd,
			},
			callback: applyFilter,
		});
		filterContent.appendChild(levelFilter.element);
		localFilters["Last Active Filter"] = { getStartEnd: lastActiveFilter.getStartEnd, updateCounter: lastActiveFilter.updateCounter };

		content.appendChild(filterContent);

		await applyFilter();
	}

	async function applyFilter() {
		await requireElement(".members-list .table-body > li");
		const content = findContainer("Member Filter").find("main");
		const activity = localFilters["Activity"].getSelections(content);
		const levels = localFilters["Level Filter"].getStartEnd(content);
		const levelStart = parseInt(levels.start);
		const levelEnd = parseInt(levels.end);
		const lastActionLimits = localFilters["Last Active Filter"].getStartEnd(content);
		const lastActionStart = parseInt(lastActionLimits.start);
		const lastActionEnd = parseInt(lastActionLimits.end);
		const position = localFilters["Position"].getSelected(content);
		const status = localFilters["Status"].getSelected(content);
		const special = localFilters["Special"].getSelections(content);

		localFilters["Level Filter"].updateCounter(`Level ${levelStart} - ${levelEnd}`, content);
		localFilters["Last Active Filter"].updateCounter(`Last action ${lastActionStart}h - ${lastActionEnd}h`, content);

		// Save filters
		await ttStorage.change({
			filters: {
				faction: {
					activity: activity,
					levelStart: levelStart,
					levelEnd: levelEnd,
					lastActionStart: lastActionStart,
					lastActionEnd: lastActionEnd,
					special: special,
				},
			},
		});

		for (const li of document.findAll(".members-list .table-body > li")) {
			showRow(li);

			// Activity
			if (
				activity.length &&
				!activity.some(
					(x) =>
						x.trim() ===
						li
							.find("#iconTray li")
							.getAttribute("title")
							.match(/(?<=<b>).*(?=<\/b>)/g)[0]
							.toLowerCase()
							.trim()
				)
			) {
				hideRow(li);
				continue;
			}

			// Level
			const level = parseInt(li.find(".lvl").innerText);
			if ((levelStart && level < levelStart) || (levelEnd !== 100 && level > levelEnd)) {
				hideRow(li);
				continue;
			}

			// Position
			if (position) {
				const liPosition = li.find(".position").innerText;
				if (liPosition !== position) {
					hideRow(li);
					continue;
				}
			}

			// Status
			if (status) {
				const liStatus = li.find(".status").innerText;
				if (liStatus !== status) {
					hideRow(li);
					continue;
				}
			}

			// Special
			for (const key in special) {
				const value = special[key];
				if (value === "both") continue;

				const foundIcons = getSpecialIcons(li);
				const definedIcons = SPECIAL_FILTER_ICONS[key];
				if (value === "yes") {
					if (!foundIcons.some((foundIcon) => definedIcons.includes(foundIcon))) {
						hideRow(li);
						continue;
					}
				} else if (value === "no") {
					if (foundIcons.some((foundIcon) => definedIcons.includes(foundIcon))) {
						hideRow(li);
						continue;
					}
				}
			}
		}

		function showRow(li) {
			li.classList.remove("hidden");
		}

		function hideRow(li) {
			li.classList.add("hidden");
		}

		localFilters["Statistics"].updateStatistics(
			document.findAll(".members-list .table-body > li:not(.hidden)").length,
			document.findAll(".members-list .table-body > li").length,
			content
		);
	}

	function getPositions() {
		const _positions = new Set();
		document.findAll(".members-list .table-body > li > .position").forEach(x => _positions.add(x.innerText));
		const positions = [
			{
				value: "",
				description: "All",
			},
			{
				value: "------",
				description: "------",
				disabled: true,
			},
		];
		[..._positions].forEach(position => positions.push({ "value": position , "description": position }));
		return positions;
	}

	function removeFilter() {
		removeContainer("Member Filter");
		document.findAll(".members-list .table-body > li.hidden").forEach((x) => x.classList.remove("hidden"));
	}
})();
