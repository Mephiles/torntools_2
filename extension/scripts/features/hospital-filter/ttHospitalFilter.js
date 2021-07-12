"use strict";

(async () => {
	if (!getPageStatus().access) return;

	featureManager.registerFeature(
		"Hospital Filter",
		"hospital",
		() => settings.pages.hospital.filter,
		initialiseFilters,
		addFilters,
		removeFilters,
		{
			storage: ["settings.pages.hospital.filter"],
		},
		null
	);

	function initialiseFilters() {
		CUSTOM_LISTENERS[EVENT_CHANNELS.HOSPITAL_SWITCH_PAGE].push(filtering);
	}

	const localFilters = {};
	async function addFilters() {
		await requireElement(".userlist-wrapper.hospital-list-wrapper .users-list .time");

		const { content } = createContainer("Hospital Filter", {
			class: "mt10",
			nextElement: document.find(".users-list-title"),
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
			callback: filtering,
		});
		filterContent.appendChild(activityFilter.element);
		localFilters["Activity"] = { getSelections: activityFilter.getSelections };

		const reviveFilter = createFilterSection({
			title: "Revives",
			checkbox: "Enabled",
			defaults: filters.hospital.revivesOn,
			callback: filtering,
		});
		filterContent.appendChild(reviveFilter.element);
		localFilters["Revives"] = { isChecked: reviveFilter.isChecked };

		const factionFilter = createFilterSection({
			title: "Faction",
			select: [ ...defaultFactionsItems, ...getFactions() ],
			defaults: "",
			callback: filtering,
		});
		filterContent.appendChild(factionFilter.element);
		localFilters["Faction"] = { getSelected: factionFilter.getSelected, updateOptions: factionFilter.updateOptions };

		const timeFilter = createFilterSection({
			title: "Time Filter",
			noTitle: true,
			slider: {
				min: 0,
				max: 100,
				step: 1,
				valueLow: filters.hospital.timeStart,
				valueHigh: filters.hospital.timeEnd
			},
			callback: filtering,
		});
		filterContent.appendChild(timeFilter.element);
		localFilters["Time Filter"] = { getStartEnd: timeFilter.getStartEnd, updateCounter: timeFilter.updateCounter };

		const levelFilter = createFilterSection({
			title: "Level Filter",
			noTitle: true,
			slider: {
				min: 1,
				max: 100,
				step: 1,
				valueLow: filters.hospital.levelStart,
				valueHigh: filters.hospital.levelEnd
			},
			callback: filtering,
		});
		filterContent.appendChild(levelFilter.element);
		localFilters["Level Filter"] = { getStartEnd: levelFilter.getStartEnd, updateCounter: levelFilter.updateCounter };

		content.appendChild(filterContent);

		filtering();
	}

		async function filtering(pageChange) {
			await requireElement(".users-list > li");
			const container = findContainer("Hospital Filter");
			if (!container) return;
			const content = container.find("main");
			const activity = localFilters["Activity"].getSelections(content);
			const revivesOn = localFilters["Revives"].isChecked(content);
			const faction = localFilters["Faction"].getSelected(content).trim();
			const times = localFilters["Time Filter"].getStartEnd(content);
			const timeStart = parseInt(times.start);
			const timeEnd = parseInt(times.end);
			const levels = localFilters["Level Filter"].getStartEnd(content);
			const levelStart = parseInt(levels.start);
			const levelEnd = parseInt(levels.end);
			if (pageChange) {
				localFilters["Faction"].updateOptions([ ...defaultFactionsItems, ...getFactions() ], content);
			}

			// Update level and time slider counters
			localFilters["Time Filter"].updateCounter(`Time ${timeStart}h - ${timeEnd}h`, content);
			localFilters["Level Filter"].updateCounter(`Level ${levelStart} - ${levelEnd}`, content);

			// Save filters
			await ttStorage.change({
				filters: {
					hospital: {
						activity: activity,
						revivesOn: revivesOn,
						faction: faction,
						timeStart: timeStart,
						timeEnd: timeEnd,
						levelStart: levelStart,
						levelEnd: levelEnd,
					},
				},
			});

			// Actual Filtering
			for (const li of document.findAll(".users-list > li")) {
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

				// Revives On
				if (revivesOn && li.find(".revive").classList.contains("reviveNotAvailable")) {
					hideRow(li);
					continue;
				}

				// Faction
				const rowFaction = li.find(".user.faction");
				if (
					faction &&
					((rowFaction.childElementCount === 0 && rowFaction.innerText.trim() !== faction.trim()) ||
						(rowFaction.childElementCount !== 0 &&
							rowFaction.find("img") &&
							rowFaction.find("img").getAttribute("title").trim() !== faction.trim()))
				) {
					hideRow(li);
					continue;
				}
				// Time
				const timeLeftHrs = li.find(".info-wrap .time").lastChild.textContent.trim().split(" ")[0].replace(/[hs]/g, "");
				if ((timeStart && timeLeftHrs < timeStart) || (timeEnd !== 100 && timeLeftHrs > timeEnd)) {
					hideRow(li);
					continue;
				}
				// Level
				const level = parseInt(li.find(".info-wrap .level").innerText.replace(/\D+/g, ""));
				if ((levelStart && level < levelStart) || (levelEnd !== 100 && level > levelEnd)) {
					hideRow(li);
					continue;
				}
			}

			function showRow(li) {
				li.classList.remove("hidden");
			}

			function hideRow(li) {
				li.classList.add("hidden");
			}

			localFilters["Statistics"].updateStatistics(document.findAll(".users-list > li:not(.hidden)").length, document.findAll(".users-list > li").length, content);
		}

	function getFactions() {
		const rows = [...document.findAll(".users-list > li .user.faction")];
		const _factions = new Set(
			document.findAll(".users-list > li .user.faction img").length 
				? rows
						.map((row) => row.find("img"))
						.filter((img) => !!img)
						.map((img) => img.getAttribute("title").trim())
						.filter((tag) => !!tag)
				: rows.map((row) => row.innerText.trim()).filter((tag) => !!tag)
		);

		const factions = [];
		for (const faction of _factions) {
			factions.push({ value: faction, description: faction });
		}
		return factions;
	}

	function removeFilters() {
		removeContainer("Hospital Filter");
		document.findAll(".users-list > li.hidden").forEach((x) => x.classList.remove("hidden"));
	}
})();
