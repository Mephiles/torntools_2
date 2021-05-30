"use strict";

(async () => {
	featureManager.registerFeature(
		"Jail Filter",
		"jail",
		() => settings.pages.jail.filter,
		() => {},
		initialize,
		teardown,
		{
			storage: ["settings.pages.jail.filter"],
		},
		null
	);

	const storageFilters = filters;
	const storageQuick = quick;

	function createJailFiltersContainer(factions, filters, quickModes) {
		const activityOptions = [
			{ id: JAIL_CONSTANTS.online, description: "Online" },
			{ id: JAIL_CONSTANTS.idle, description: "Idle" },
			{ id: JAIL_CONSTANTS.offline, description: "Offline" },
		];
		const defaultFactionsItems = [
			{
				value: JAIL_CONSTANTS.allFactions,
				description: "All",
			},
			{
				value: JAIL_CONSTANTS.noFaction,
				description: "No faction",
			},
			{
				value: JAIL_CONSTANTS.unknownFactions,
				description: "Unknown faction",
			},
			{
				value: "------",
				description: "------",
				disabled: true,
			},
		];
		const quickModesOptions = [
			{
				id: JAIL_CONSTANTS.bust,
				description: "Quick bust",
			},
			{
				id: JAIL_CONSTANTS.bail,
				description: "Quick bail",
			},
		];
		let filtersChangedCallback;
		let quickModesChangedCallback;

		// TODO: Support custom appending instead of auto or as an addition
		// const container = createContainer("Jail Filter", contentElement);
		// .appendChild(container.element)
		const { container, content } = createContainer("Jail Filter", {
			nextElement: document.find(".users-list-title"),
			class: "tt-jail-filters-container",
		});

		const activityCheckboxList = createCheckboxList(activityOptions, "column");
		activityCheckboxList.setSelections(filters.activity);
		activityCheckboxList.onSelectionChange(() => {
			if (filtersChangedCallback) {
				filtersChangedCallback();
			}
		});

		const factionsSelect = createSelect([...defaultFactionsItems, ...factions]);
		factionsSelect.setSelected(filters.faction);
		factionsSelect.onChange(() => {
			if (filtersChangedCallback) {
				filtersChangedCallback();
			}
		});

		const timeFilter = createSlider(JAIL_CONSTANTS.timeMin, JAIL_CONSTANTS.timeMax, JAIL_CONSTANTS.timeStep, (num) => `${num}h`);
		timeFilter.setRange(filters.time);
		timeFilter.onRangeChanged(() => {
			if (filtersChangedCallback) {
				filtersChangedCallback();
			}
		});

		const levelFilter = createSlider(JAIL_CONSTANTS.levelMin, JAIL_CONSTANTS.levelMax, JAIL_CONSTANTS.levelStep);
		levelFilter.setRange(filters.level);
		levelFilter.onRangeChanged(() => {
			if (filtersChangedCallback) {
				filtersChangedCallback();
			}
		});

		const scoreFilter = createSlider(JAIL_CONSTANTS.scoreMin, JAIL_CONSTANTS.scoreMax, JAIL_CONSTANTS.scoreStep);
		scoreFilter.setRange(filters.score);
		scoreFilter.onRangeChanged(() => {
			if (filtersChangedCallback) {
				filtersChangedCallback();
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

		const quickModeCheckboxList = createCheckboxList(quickModesOptions, "row");
		quickModeCheckboxList.setSelections(quickModes);
		quickModeCheckboxList.onSelectionChange(() => {
			if (quickModesChangedCallback) {
				quickModesChangedCallback();
			}
		});

		const filtersHeaderDiv = document.newElement({
			type: "div",
			class: "tt-jail-filters-header",
			children: [
				document.newElement({
					type: "div",
					children: [quickModeCheckboxList.element],
				}),
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
				document.newElement({
					type: "div",
					class: "tt-jail-filters-item",
					children: [
						document.newElement({
							type: "div",
							class: "tt-jail-filters-item-header",
							text: "Time",
						}),
						timeFilter.element,
					],
				}),
				document.newElement({
					type: "div",
					class: "tt-jail-filters-item",
					children: [
						document.newElement({
							type: "div",
							class: "tt-jail-filters-item-header",
							text: "Level",
						}),
						levelFilter.element,
					],
				}),
				document.newElement({
					type: "div",
					class: "tt-jail-filters-item",
					children: [
						document.newElement({
							type: "div",
							class: "tt-jail-filters-item-header",
							text: "Score",
						}),
						scoreFilter.element,
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

		function getFilters() {
			return {
				activity: activityCheckboxList.getSelections(),
				faction: factionsSelect.getSelected(),
				time: timeFilter.getRange(),
				level: levelFilter.getRange(),
				score: scoreFilter.getRange(),
			};
		}

		function getQuickModes() {
			return quickModeCheckboxList.getSelections();
		}

		function onFiltersChanged(callback) {
			filtersChangedCallback = callback;
		}

		function onQuickModesChanged(callback) {
			quickModesChangedCallback = callback;
		}

		function dispose() {
			activityCheckboxList.dispose();
			factionsSelect.dispose();
			timeFilter.dispose();
			levelFilter.dispose();
			scoreFilter.dispose();
			quickModeCheckboxList.dispose();

			filtersChangedCallback = undefined;
			quickModesChangedCallback = undefined;

			container.remove();
		}

		return {
			updateFactions,
			updateShownAmount,
			updatePageAmount,
			getFilters,
			getQuickModes,
			onFiltersChanged,
			onQuickModesChanged,
			dispose,
		};
	}

	function createJailUserFacade(userElement) {
		const activityIconId = userElement.querySelector('#iconTray > li[id^="icon"]').id;
		const activity = activityIconId.startsWith("icon1")
			? JAIL_CONSTANTS.online
			: activityIconId.startsWith("icon62")
			? JAIL_CONSTANTS.idle
			: JAIL_CONSTANTS.offline;

		const factionElem = userElement.querySelector(".faction > img");
		const faction = factionElem ? factionElem.title || JAIL_CONSTANTS.unknownFactions : JAIL_CONSTANTS.noFaction;

		const time = getTimeFromText(userElement.querySelector(".time").lastChild.textContent.trim());
		const level = parseInt(userElement.querySelector(".level").lastChild.textContent.trim());
		const score = level * (time + 3);

		const bustElem = userElement.querySelector(".bust");
		const bustIcon = bustElem.querySelector(".bust-icon");
		let isInQuickBustMode = false;

		const bailElem = userElement.querySelector(".bye");
		const bailIcon = bailElem.querySelector(".bye-icon");
		let isInQuickBailMode = false;

		function getTimeFromText(text) {
			const hourAnMinRegex = /^(?<hour>\d\d?)h \d\d?m$/;
			const match = text.match(hourAnMinRegex);

			if (match) {
				return parseInt(match.groups.hour);
			}

			return 0;
		}

		function applyQuickMode(flag, elem, iconElem) {
			if (flag) {
				return;
			}

			elem.href = elem.href + "1";
			const quickMark = document.newElement({
				type: "span",
				class: "tt-jail-filters-quick-mark",
				text: "Q",
			});
			iconElem.appendChild(quickMark);
		}

		function removeQuickMode(flag, elem, iconElem) {
			if (!flag) {
				return;
			}

			iconElem.firstChild.remove();
			elem.href = elem.href.slice(0, -1);
		}

		function applyQuickModes(quickModes) {
			if (quickModes.includes(JAIL_CONSTANTS.bust)) {
				applyQuickMode(isInQuickBustMode, bustElem, bustIcon);
				isInQuickBustMode = true;
			} else {
				removeQuickMode(isInQuickBustMode, bustElem, bustIcon);
				isInQuickBustMode = false;
			}

			if (quickModes.includes(JAIL_CONSTANTS.bail)) {
				applyQuickMode(isInQuickBailMode, bailElem, bailIcon);
				isInQuickBailMode = true;
			} else {
				removeQuickMode(isInQuickBailMode, bailElem, bailIcon);
				isInQuickBailMode = false;
			}
		}

		function hide() {
			userElement.classList.add("hidden");
		}

		function show() {
			userElement.classList.remove("hidden");
		}

		function dispose() {
			show();
			applyQuickModes([]);
		}

		return {
			element: userElement,
			activity,
			faction,
			time,
			level,
			score,
			applyQuickModes,
			isInQuickBustMode: () => isInQuickBustMode,
			isInQuickBailMode: () => isInQuickBailMode,
			hide,
			show,
			isShown: () => !userElement.classList.contains("hidden"),
			dispose,
		};
	}

	function createInJailFacade() {
		const usersListContainer = document.find(".users-list");
		const usersListTitleContainer = document.find(".users-list-title");
		let usersInfo = [];
		let usersChangedCallback;

		const config = { childList: true };

		const callback = function () {
			const isNotInLoadingState = usersListContainer.children.length !== 1 || !usersListContainer.children[0].find(".ajax-placeholder");
			if (isNotInLoadingState) {
				buildUsersInfo();
			}
		};

		const observer = new MutationObserver(callback);
		observer.observe(usersListContainer, config);

		buildUsersInfo();

		const mainRefresh = document.newElement({
			type: "div",
			class: "tt-jail-filters-main-refresh-wrapper hidden",
			children: [createRefreshButton("white")],
		});
		usersListTitleContainer.appendChild(mainRefresh);

		const bailRefreshButton = createRefreshButton("black", "tt-jail-filters-bail-refresh");
		const bustRefreshButton = createRefreshButton("black", "tt-jail-filters-bust-refresh");
		const innerRefreshWrapper = document.newElement({
			type: "div",
			class: "tt-jail-filters-inner-refresh-wrapper hidden",
			children: [bailRefreshButton, bustRefreshButton],
		});
		usersListContainer.parentNode.insertBefore(innerRefreshWrapper, usersListContainer.nextSibling);

		function createRefreshButton(mode, classes) {
			const refreshButton = document.newElement({
				type: "img",
				attributes: {
					src: chrome.runtime.getURL(`resources/images/svg-icons/refresh-icon${mode === "white" ? "-white" : ""}.svg`),
					...(classes ? { class: classes } : {}),
				},
				events: {
					click: () => location.reload(),
				},
			});

			return refreshButton;
		}

		function buildUsersInfo() {
			usersInfo = [];

			for (const userElement of usersListContainer.children) {
				usersInfo.push(createJailUserFacade(userElement));
			}

			if (usersChangedCallback) {
				usersChangedCallback();
			}
		}

		function updateRefreshButtons(quickModes) {
			const showBusts = quickModes.includes(JAIL_CONSTANTS.bust);
			const showBails = quickModes.includes(JAIL_CONSTANTS.bail);

			if (!showBusts && !showBails) {
				mainRefresh.classList.add("hidden");
				innerRefreshWrapper.classList.add("hidden");
				return;
			}

			const allHidden = usersInfo.every((userInfo) => !userInfo.isShown());

			if (allHidden) {
				innerRefreshWrapper.classList.remove("hidden");
				mainRefresh.classList.add("hidden");

				if (showBusts) {
					bustRefreshButton.classList.remove("tt-jail-filters-inner-refresh-hide");
				} else {
					bustRefreshButton.classList.add("tt-jail-filters-inner-refresh-hide");
				}

				if (showBails) {
					bailRefreshButton.classList.remove("tt-jail-filters-inner-refresh-hide");
				} else {
					bailRefreshButton.classList.add("tt-jail-filters-inner-refresh-hide");
				}
			} else {
				innerRefreshWrapper.classList.add("hidden");
				mainRefresh.classList.remove("hidden");
			}
		}

		function applyFilters(filters) {
			let shownAmount = 0;

			for (const userInfo of usersInfo) {
				const matchesActivity = !filters.activity.length || filters.activity.includes(userInfo.activity);
				const matchesFaction = filters.faction === JAIL_CONSTANTS.allFactions || filters.faction === userInfo.faction;
				const matchesTime = userInfo.time >= filters.time.from && userInfo.time <= filters.time.to;
				const matchesLevel = userInfo.level >= filters.level.from && userInfo.level <= filters.level.to;
				const matchesScore = userInfo.score >= filters.score.from && userInfo.score <= filters.score.to;

				if (matchesActivity && matchesFaction && matchesTime && matchesLevel && matchesScore) {
					userInfo.show();
					shownAmount++;
				} else {
					userInfo.hide();
				}
			}

			return shownAmount;
		}

		function applyQuickModes(quickModes) {
			usersInfo.forEach((userInfo) => userInfo.applyQuickModes(quickModes));
		}

		function getFactionOptions() {
			const distinctFactions = [
				...new Set(
					usersInfo
						.map((userInfo) => userInfo.faction)
						.filter((faction) => faction && faction !== JAIL_CONSTANTS.unknownFactions && faction !== JAIL_CONSTANTS.noFaction)
				),
			];

			return distinctFactions;
		}

		function onUsersChanged(callback) {
			usersChangedCallback = callback;
		}

		function dispose() {
			observer.disconnect();
			for (const userInfo of usersInfo) {
				userInfo.dispose();
			}
			usersChangedCallback = undefined;
			mainRefresh.remove();
		}

		return {
			updateRefreshButtons,
			applyFilters,
			applyQuickModes,
			getFactionOptions,
			getUsersAmount: () => usersInfo.length,
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

		inJailFacade = createInJailFacade();

		const factionOptions = inJailFacade.getFactionOptions();

		jailFiltersContainer = createJailFiltersContainer(
			factionOptions.map((faction) => ({ value: faction, description: faction })),
			storageFilters.jail,
			storageQuick.jail
		);

		const shownAmount = inJailFacade.applyFilters(jailFiltersContainer.getFilters());
		jailFiltersContainer.updatePageAmount(inJailFacade.getUsersAmount());
		jailFiltersContainer.updateShownAmount(shownAmount);
		const quickModes = jailFiltersContainer.getQuickModes();
		inJailFacade.applyQuickModes(quickModes);
		inJailFacade.updateRefreshButtons(quickModes);

		jailFiltersContainer.onFiltersChanged(() => {
			const filters = jailFiltersContainer.getFilters();
			const shownAmount = inJailFacade.applyFilters(filters);
			jailFiltersContainer.updateShownAmount(shownAmount);
			inJailFacade.updateRefreshButtons(jailFiltersContainer.getQuickModes());

			ttStorage.change({
				filters: {
					jail: filters,
				},
			});
		});
		jailFiltersContainer.onQuickModesChanged(() => {
			const quickModes = jailFiltersContainer.getQuickModes();
			inJailFacade.applyQuickModes(quickModes);
			inJailFacade.updateRefreshButtons(quickModes);

			ttStorage.change({
				quick: {
					jail: quickModes,
				},
			});
		});
		inJailFacade.onUsersChanged(() => {
			// TODO: Add your faction to the list from API
			const factionItems = inJailFacade.getFactionOptions().map((faction) => ({ value: faction, description: faction }));
			jailFiltersContainer.updateFactions(factionItems);
			const shownAmount = inJailFacade.applyFilters(jailFiltersContainer.getFilters());
			jailFiltersContainer.updatePageAmount(inJailFacade.getUsersAmount());
			jailFiltersContainer.updateShownAmount(shownAmount);
			const quickModes = jailFiltersContainer.getQuickModes();
			inJailFacade.applyQuickModes(quickModes);
			inJailFacade.updateRefreshButtons(quickModes);
		});
	}

	function teardown() {
		jailFiltersContainer.dispose();
		jailFiltersContainer = undefined;
		inJailFacade.dispose();
		inJailFacade = undefined;
	}
})();
