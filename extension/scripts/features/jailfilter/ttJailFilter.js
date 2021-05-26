// noinspection DuplicatedCode

"use strict";

(async () => {
	featureManager.registerFeature(
		"Jail Filter",
		"jail",
		() => settings.pages.jail.filter,
		// initialiseFilters,
		() => {},
		// addFilters,
		initialize,
		// removeFilters,
		teardown,
		{
			storage: ["settings.pages.jail.filter"],
		},
		null
	);

	// Activity
	const online = "online";
	const idle = "idle";
	const offline = "offline";

	// Factions
	const allFactions = "__all";
	const noFaction = "__none";
	const unknownFaction = "__unknown";

	function createCheckbox(description, isChecked) {
		const id = getUUID();
		const checkbox = document.newElement({
			type: "input",
			id,
			attributes: {
				type: "checkbox",
				...(isChecked ? { checked: true } : {}),
			},
		});
		const checkboxWrapper = document.newElement({
			type: "div",
			class: "tt-checkbox-wrap",
			children: [
				checkbox,
				document.newElement({
					type: "label",
					attributes: {
						for: id,
					},
					text: description,
				}),
			],
		});

		let onChangeCallback;

		function onChangeListener() {
			onChangeCallback(checkbox.checked);
		}

		function onChange(callback) {
			onChangeCallback = callback;
			checkbox.addEventListener("change", onChangeListener);
		}

		function dispose() {
			if (onChangeCallback) {
				checkbox.removeEventListener("change", onChangeListener);
				onChangeCallback = undefined;
			}
		}

		return {
			element: checkboxWrapper,
			onChange,
			dispose,
		};
	}

	function createCheckboxList(items, selectedItemIds) {
		const selectedIds = selectedItemIds.reduce((acc, curr) => ({ ...acc, [curr]: true }), {});
		const checkboxes = [];
		let selectionChangeCallback;

		for (const item of items) {
			const checkbox = createCheckbox(item.description, selectedIds[item.id]);
			checkbox.onChange((isChecked) => {
				if (isChecked) {
					selectedIds[item.id] = true;
				} else {
					delete selectedIds[item.id];
				}

				if (selectionChangeCallback) {
					selectionChangeCallback(Object.keys(selectedIds));
				}
			});
			checkboxes.push(checkbox);
		}

		const checkboxWrapper = document.newElement({
			type: "div",
			class: "tt-checkbox-list-wrap",
			children: checkboxes.map((checkbox) => checkbox.element),
		});

		function onSelectionChange(callback) {
			selectionChangeCallback = callback;
		}

		function dispose() {
			checkboxes.forEach((checkbox) => checkbox.dispose());
			selectionChangeCallback = undefined;
		}

		return {
			element: checkboxWrapper,
			onSelectionChange,
			dispose,
		};
	}

	function createDropdown(options, selectedOption) {
		let selectedOptionValue = selectedOption || options[0].value;

		const select = document.newElement({
			type: "select",
			children: createOptionsElements(options),
		});

		let onChangeCallback;

		function createOptionsElements(optionsLst) {
			return optionsLst.map((option) =>
				document.newElement({
					type: "option",
					attributes: {
						value: option.value,
						...(option.value === selectedOptionValue ? { selected: true } : {}),
						...(option.disabled ? { disabled: true } : {}),
					},
					text: option.description,
				})
			);
		}

		function changeSelectedValue(newValue) {
			selectedOptionValue = newValue;

			if (onChangeCallback) {
				onChangeCallback(newValue);
			}
		}

		function onChangeListener() {
			changeSelectedValue(select.value);
		}

		function updateOptionsList(options) {
			if (options.every((option) => option.value !== selectedOptionValue)) {
				changeSelectedValue(options[0].value);
			}

			const newOptions = createOptionsElements(options);

			while (select.firstChild) {
				select.removeChild(select.firstChild);
			}

			const documentFragment = document.createDocumentFragment();
			newOptions.forEach((newOption) => documentFragment.appendChild(newOption));
			select.appendChild(documentFragment);
		}

		function onChange(callback) {
			onChangeCallback = callback;
			select.addEventListener("change", onChangeListener);
		}

		function dispose() {
			if (onChangeCallback) {
				select.removeEventListener("change", onChangeListener);
				onChangeCallback = undefined;
			}
		}

		return {
			element: select,
			updateOptionsList,
			onChange,
			dispose,
		};
	}

	// TODO: Needs new slider...
	function createSlider(description, format, from, to) {}

	function createJailFiltersContainer() {
		const activityOptions = [
			{ id: online, description: "Online" },
			{ id: idle, description: "Idle" },
			{ id: offline, description: "Offline" },
		];
		const defaultFactionsItems = [
			{
				value: allFactions,
				description: "All",
			},
			{
				value: noFaction,
				description: "No faction",
			},
			{
				value: unknownFaction,
				description: "Unknown faction",
			},
			{
				value: "------",
				description: "------",
				disabled: true,
			},
		];
		let filtersModel = {
			activity: filters.jail.activity,
			faction: filters.jail.faction || allFactions,
			time: {
				from: filters.jail.timeStart,
				to: filters.jail.timeEnd,
			},
			level: {
				from: filters.jail.levelStart,
				to: filters.jail.levelEnd,
			},
			score: {
				from: filters.jail.scoreStart,
				to: filters.jail.scoreEnd,
			},
		};
		let filtersChangedCallback;

		// TODO: Support custom appending instead of auto or as an addition
		const { container, content } = createContainer("Jail Filter", {
			nextElement: document.find(".users-list-title"),
			class: "tt-jail-filters-container",
		});

		const activityCheckboxList = createCheckboxList(activityOptions, []);
		activityCheckboxList.onSelectionChange((selectedActivityItems) => {
			filtersModel = {
				...filtersModel,
				activity: selectedActivityItems,
			};

			if (filtersChangedCallback) {
				filtersChangedCallback(filtersModel);
			}
		});

		const factionsSelect = createDropdown(defaultFactionsItems, allFactions);
		factionsSelect.onChange((selectedFaction) => {
			filtersModel = {
				...filtersModel,
				faction: selectedFaction,
			};

			if (filtersChangedCallback) {
				filtersChangedCallback(filtersModel);
			}
		});

		const shownCountElement = document.newElement({
			type: "span",
			text: "0",
		});

		const pageCountElement = document.newElement({
			type: "span",
			text: "0",
		});

		const filtersHeaderDiv = document.newElement({
			type: "div",
			class: "tt-jail-filters-header",
			children: [
				document.newElement({
					type: "div",
					class: "tt-jail-filters-shown-users",
					children: [
						document.newElement({
							type: "text",
							text: "Showing ",
						}),
						shownCountElement,
						document.newElement({
							type: "text",
							text: " of ",
						}),
						pageCountElement,
						document.newElement({
							type: "text",
							text: " users",
						}),
					],
				}),
			],
		});
		const filtersContentDiv = document.newElement({
			type: "div",
			class: "tt-jail-filters-content",
			children: [
				document.newElement({
					type: "div",
					class: "tt-jail-filters-item",
					children: [
						document.newElement({
							type: "div",
							class: "tt-jail-filters-item-header",
							text: "Activity",
						}),
						activityCheckboxList.element,
					],
				}),
				document.newElement({
					type: "div",
					class: "tt-jail-filters-item",
					children: [
						document.newElement({
							type: "div",
							class: "tt-jail-filters-item-header",
							text: "Faction",
						}),
						factionsSelect.element,
					],
				}),
			],
		});
		content.appendChild(filtersHeaderDiv);
		content.appendChild(filtersContentDiv);

		function updateFactions(factions) {
			factionsSelect.updateOptionsList([...defaultFactionsItems, ...factions]);
		}

		function updateShownAmount(shownCount) {
			shownCountElement.innerText = shownCount;
		}

		function updatePageAmount(pageCount) {
			pageCountElement.innerText = pageCount;
		}

		function onFiltersChanged(callback) {
			filtersChangedCallback = callback;
		}

		function dispose() {
			activityCheckboxList.dispose();
			factionsSelect.dispose();
			filtersChangedCallback = undefined;
			container.remove();
		}

		// time createSlider
		// level createSlider
		// score createSlider

		return {
			updateFactions,
			updateShownAmount,
			updatePageAmount,
			getFilters: () => filtersModel,
			onFiltersChanged,
			dispose,
		};
	}

	function createInJailFacade() {
		const usersListContainer = document.find(".users-list");
		let usersInfo = [];
		let observer;
		let usersChangedCallback;

		function buildUsersInfo() {
			usersInfo = [];

			for (const userElement of usersListContainer.children) {
				const activityIconId = userElement.querySelector('#iconTray > li[id^="icon"]').id;
				const activity = activityIconId.startsWith("icon1") ? online : activityIconId.startsWith("icon62") ? idle : offline;
				const factionElem = userElement.querySelector(".faction > img");

				usersInfo.push({
					element: userElement,
					activity,
					faction: factionElem ? factionElem.title || unknownFaction : noFaction,
				});
			}

			if (usersChangedCallback) {
				const distinctFactions = [
					...new Set(
						usersInfo.map((userInfo) => userInfo.faction).filter((faction) => faction && faction !== unknownFaction && faction !== noFaction)
					),
				];
				usersChangedCallback(usersInfo.length, distinctFactions);
			}
		}

		function connect() {
			// const handle = observeChildrenChanges(usersListContainer, () => {});
			const config = { childList: true };

			const callback = function () {
				if (usersListContainer.children.length !== 1 || !usersListContainer.children[0].find(".ajax-placeholder")) {
					buildUsersInfo();
				}
			};

			observer = new MutationObserver(callback);
			observer.observe(usersListContainer, config);

			buildUsersInfo();
		}

		function updateFilters(filters) {
			let shownAmount = 0;

			for (const userInfo of usersInfo) {
				const matchesActivity = !filters.activity.length || filters.activity.includes(userInfo.activity);
				const matchesFaction = filters.faction === allFactions || filters.faction === userInfo.faction;

				if (matchesActivity && matchesFaction) {
					userInfo.element.classList.remove("hidden");
					shownAmount++;
				} else {
					userInfo.element.classList.add("hidden");
				}
			}

			return shownAmount;
		}

		function onUsersChanged(callback) {
			usersChangedCallback = callback;
		}

		function dispose() {
			observer.disconnect();
			for (const userInfo of usersInfo) {
				userInfo.element.classList.remove("hidden");
			}
			usersChangedCallback = undefined;
		}

		return {
			connect,
			updateFilters,
			onUsersChanged,
			dispose,
		};
	}

	async function jailReady() {
		await requireElement(".users-list > *:first-child .info-wrap");
	}

	let jailFiltersContainer;
	let inJailFacade;

	async function initialize() {
		await jailReady();

		jailFiltersContainer = createJailFiltersContainer();
		inJailFacade = createInJailFacade();

		// Initial filters applying from storage
		jailFiltersContainer.onFiltersChanged((filters) => {
			const shownAmount = inJailFacade.updateFilters(filters);
			jailFiltersContainer.updateShownAmount(shownAmount);
			// Save in storage
		});
		inJailFacade.onUsersChanged((usersAmount, factions) => {
			jailFiltersContainer.updateFactions(factions.map((faction) => ({ value: faction, description: faction })));
			const shownAmount = inJailFacade.updateFilters(jailFiltersContainer.getFilters());
			jailFiltersContainer.updatePageAmount(usersAmount);
			jailFiltersContainer.updateShownAmount(shownAmount);
		});

		inJailFacade.connect();
	}

	function teardown() {
		jailFiltersContainer.dispose();
		jailFiltersContainer = undefined;
		inJailFacade.dispose();
		inJailFacade = undefined;
	}

	// ------------------------------------

	function initialiseFilters() {
		CUSTOM_LISTENERS[EVENT_CHANNELS.JAIL_SWITCH_PAGE].push(filtering);
	}

	async function addFilters() {
		await requireElement(".users-list > *:first-child .info-wrap");

		// const a = await createJailFiltersContainer();
		// a.onFiltersChanged(console.log);

		const { content } = createContainer("Jail Filter", {
			nextElement: document.find(".users-list-title"),
		});
		content.innerHTML = `
			<div class="filter-header">
				<div class="statistic" id="showing">Showing <span class="filter-count">X</span> of <span class="filter-total">${
					document.findAll(".users-list > li").length
				}</span> users</div>
			</div>
			<div class="filter-content">
				<div class="filter-wrap" id="activity-filter">
					<div class="filter-heading">Activity</div>
					<div class="filter-multi-wrap">
						<div class="tt-checkbox-wrap">
							<input type="checkbox" value="online" id="tt-jail-filter-online">
							<label for="tt-jail-filter-online">Online</label>
						</div>
						<div class="tt-checkbox-wrap">
							<input type="checkbox" value="idle" id="tt-jail-filter-idle">
							<label for="tt-jail-filter-idle">Idle</label>
						</div>
						<div class="tt-checkbox-wrap">
							<input type="checkbox" value="offline" id="tt-jail-filter-offline">
							<label for="tt-jail-filter-offline">Offline</label>
						</div>
					</div>
				</div>
				<div class="filter-wrap">
					<div class="filter-heading">Faction</div>
					<select name="faction" id="tt-faction-filter">
						<option selected value="">none</option>
						<option disabled value="------">------</option>
					</select>
				</div>
			</div>
		`;
		if (hasAPIData() && Object.keys(userdata) && userdata.faction && userdata.faction.faction_tag)
			content.find(".filter-content #tt-faction-filter").appendChild(
				document.newElement({
					type: "option",
					text: userdata.faction.faction_tag,
					attributes: {
						value: userdata.faction.faction_tag,
					},
				})
			);
		const timeFilter = document.newElement({
			type: "div",
			class: "filter-wrap",
			id: "time-filter",
			children: [
				newSlider(),
				document.newElement({
					type: "div",
					class: "time-filter-info-wrap",
					children: [document.newElement({ type: "span", class: "time-filter-info" })],
				}),
			],
		});
		const levelFilter = document.newElement({
			type: "div",
			class: "filter-wrap",
			id: "level-filter",
			children: [
				newSlider(),
				document.newElement({
					type: "div",
					class: "level-filter-info-wrap",
					children: [document.newElement({ type: "span", class: "level-filter-info" })],
				}),
			],
		});
		const scoreMax = Math.max(
			getJailScore(100, document.find(".users-list > *:first-child .info-wrap .time").lastChild.textContent.trim().split(" ")[0].replace(/[hs]/g, "")),
			5000
		);
		const scoreFilter = document.newElement({
			type: "div",
			class: "filter-wrap",
			id: "score-filter",
			children: [
				newSlider(scoreMax, 0),
				document.newElement({
					type: "div",
					class: "score-filter-info-wrap",
					children: [document.newElement({ type: "span", class: "score-filter-info" })],
				}),
			],
		});
		content.find(".filter-content").appendChild(timeFilter);
		content.find(".filter-content").appendChild(levelFilter);
		content.find(".filter-content").appendChild(scoreFilter);

		// Set up the filters
		for (const activity of filters.jail.activity) {
			content.find(`#activity-filter [value="${activity}"]`).checked = true;
		}
		// There is no faction filter setup
		timeFilter.find(".handle.left").dataset.value = filters.jail.timeStart;
		timeFilter.find(".handle.right").dataset.value = filters.jail.timeEnd;
		timeFilter.find(".tt-dual-range").style.setProperty("--x-1", (filters.jail.timeStart * 150) / 100 - 10.5 + "px");
		timeFilter.find(".tt-dual-range").style.setProperty("--x-2", (filters.jail.timeEnd * 150) / 100 - 10.5 + "px");
		levelFilter.find(".handle.left").dataset.value = filters.jail.levelStart;
		levelFilter.find(".handle.right").dataset.value = filters.jail.levelEnd;
		levelFilter.find(".tt-dual-range").style.setProperty("--x-1", (filters.jail.levelStart * 150) / 100 - 10.5 + "px");
		levelFilter.find(".tt-dual-range").style.setProperty("--x-2", (filters.jail.levelEnd * 150) / 100 - 10.5 + "px");
		scoreFilter.find(".handle.left").dataset.value = filters.jail.scoreStart;
		scoreFilter.find(".handle.right").dataset.value = filters.jail.scoreEnd;
		scoreFilter
			.find(".tt-dual-range")
			.style.setProperty("--x-1", filters.jail.scoreStart < scoreMax ? (filters.jail.scoreStart / scoreMax) * 150 - 10.5 + "px" : "-10.5px");
		scoreFilter
			.find(".tt-dual-range")
			.style.setProperty("--x-2", filters.jail.scoreEnd < scoreMax ? (filters.jail.scoreEnd / scoreMax) * 150 - 10.5 + "px" : "137px");

		// Listeners
		content.findAll("input[type='checkbox']").forEach((x) => x.addEventListener("click", filtering));
		content.find("#tt-faction-filter").addEventListener("input", filtering);
		content.findAll(".handle.left, .handle.right").forEach((x) => new MutationObserver(filtering).observe(x, { attributes: true }));

		addFactionsToList();
		filtering();
	}

	function filtering() {
		requireElement(".users-list > li").then(async () => {
			const content = findContainer("Jail Filter").find(".filter-content");
			const timeFilter = content.find("#time-filter");
			const levelFilter = content.find("#level-filter");
			const scoreFilter = content.find("#score-filter");
			const scoreMax = Math.max(
				getJailScore(
					100,
					document.find(".users-list > *:first-child .info-wrap .time").lastChild.textContent.trim().split(" ")[0].replace(/[hs]/g, "")
				),
				5000
			);
			// Get the set filters
			let activity = [];
			for (const checkbox of content.findAll("#activity-filter input:checked")) {
				activity.push(checkbox.getAttribute("value"));
			}
			const faction = content.find("#tt-faction-filter").value;
			const timeStart = parseInt(timeFilter.find(".handle.left").dataset.value);
			const timeEnd = parseInt(timeFilter.find(".handle.right").dataset.value);
			const levelStart = parseInt(levelFilter.find(".handle.left").dataset.value);
			const levelEnd = parseInt(levelFilter.find(".handle.right").dataset.value);
			const scoreStart = parseInt(scoreFilter.find(".handle.left").dataset.value);
			const scoreEnd = parseInt(scoreFilter.find(".handle.right").dataset.value);
			// Update level and time slider counters
			content.find(".level-filter-info").innerText = `Level ${levelStart} - ${levelEnd}`;
			content.find(".time-filter-info").innerText = `Time ${timeStart}h - ${timeEnd}h`;
			content.find(".score-filter-info").innerText = `Score ${scoreStart} - ${scoreEnd}`;
			// Save filters
			await ttStorage.change({
				filters: {
					jail: {
						timeStart: timeStart,
						timeEnd: timeEnd,
						levelStart: levelStart,
						levelEnd: levelEnd,
						scoreStart: scoreStart,
						scoreEnd: scoreEnd,
						faction: faction,
						activity: activity,
					},
				},
			});
			// Actual Filtering
			for (const li of document.findAll(".users-list > li")) {
				// Activity
				if (
					activity.length &&
					!activity.some(
						(x) =>
							x.trim() ===
							li
								.find("#iconTray li")
								.getAttribute("title")
								.replace(/^<b>/g, "")
								.replace(/<\/b>$/g, "")
								.toLowerCase()
								.trim()
					)
				) {
					showRow(li, false);
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
					showRow(li, false);
					continue;
				}
				// Time
				const timeLeftHrs = parseInt(li.find(".info-wrap .time").lastChild.textContent.trim().split(" ")[0].replace(/[hs]/g, ""));
				if ((timeStart && timeLeftHrs < timeStart) || (timeEnd !== 100 && timeLeftHrs > timeEnd)) {
					showRow(li, false);
					continue;
				}
				// Level
				const level = parseInt(li.find(".info-wrap .level").innerText.replace(/\D+/g, ""));
				if ((levelStart && level < levelStart) || (levelEnd !== 100 && level > levelEnd)) {
					showRow(li, false);
					continue;
				}
				// Score
				const score = getJailScore(level, timeLeftHrs);
				if ((scoreStart && score < scoreStart) || (scoreEnd !== scoreMax && score > scoreEnd)) {
					showRow(li, false);
					continue;
				}
				showRow(li);
			}

			function showRow(li, show = true) {
				if (!li.classList) return;
				if (show) li.classList.remove("hidden");
				else li.classList.add("hidden");
			}
			updateStat();
		});
	}

	function addFactionsToList() {
		const content = findContainer("Jail Filter").find(".filter-content");
		const rows = [...document.findAll(".users-list > li .user.faction")];
		const factions = new Set(
			rows[0].find("img")
				? rows
						.map((row) => row.find("img"))
						.filter((img) => !!img)
						.map((img) => img.getAttribute("title").trim())
						.filter((tag) => !!tag)
				: rows.map((row) => row.innerText.trim()).filter((tag) => !!tag)
		);

		for (const fac of factions) {
			content.find("#tt-faction-filter").appendChild(document.newElement({ type: "option", value: fac, text: fac }));
		}
	}

	function updateStat() {
		findContainer("Jail Filter").find(".filter-count").innerText = document.findAll(".users-list > li:not(.hidden)").length;
	}

	function removeFilters() {
		removeContainer("Jail Filter");
		document.findAll(".users-list > li.hidden").forEach((x) => x.classList.remove("hidden"));
	}

	function getJailScore(level, timeLeft) {
		return parseInt(level) * (parseInt(timeLeft) + 3);
	}
})();
