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

	function createCheckbox(description) {
		const id = getUUID();
		const checkbox = document.newElement({
			type: "input",
			id,
			attributes: {
				type: "checkbox",
			},
		});
		const checkboxWrapper = document.newElement({
			type: "div",
			class: "tt-checkbox-wrapper",
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
			onChangeCallback();
		}

		function setChecked(isChecked) {
			checkbox.checked = isChecked;
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
			setChecked,
			isChecked: () => checkbox.checked,
			onChange,
			dispose,
		};
	}

	function createCheckboxList(items, orientation) {
		let selectedIds = {};
		const checkboxes = {};
		let selectionChangeCallback;

		for (const item of items) {
			const checkbox = createCheckbox(item.description);
			checkbox.onChange(() => {
				if (checkbox.isChecked()) {
					selectedIds[item.id] = true;
				} else {
					delete selectedIds[item.id];
				}

				if (selectionChangeCallback) {
					selectionChangeCallback();
				}
			});
			checkboxes[item.id] = checkbox;
		}

		const checkboxWrapper = document.newElement({
			type: "div",
			class: ["tt-checkbox-list-wrapper", orientation === "row" ? "tt-checkbox-list-row" : "tt-checkbox-list-column"].join(" "),
			children: Object.values(checkboxes).map((checkbox) => checkbox.element),
		});

		function setSelections(selectedItemIds) {
			selectedIds = selectedItemIds.reduce((acc, curr) => ({ ...acc, [curr]: true }), {});

			for (const id in checkboxes) {
				checkboxes[id].setChecked(selectedIds[id] || false);
			}
		}

		function onSelectionChange(callback) {
			selectionChangeCallback = callback;
		}

		function dispose() {
			Object.values(checkboxes).forEach((checkbox) => checkbox.dispose());
			selectionChangeCallback = undefined;
		}

		return {
			element: checkboxWrapper,
			setSelections,
			getSelections: () => Object.keys(selectedIds),
			onSelectionChange,
			dispose,
		};
	}

	function createDropdown(options) {
		let selectedOptionValue = options[0].value;
		let shownOptions = options;
		let onChangeCallback;

		const select = document.newElement({
			type: "select",
			children: createOptionsElements(shownOptions),
		});

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

		function onChangeListener() {
			selectedOptionValue = select.value;

			if (onChangeCallback) {
				onChangeCallback();
			}
		}

		function updateOptionsList(options) {
			const newOptions = createOptionsElements(options);

			while (select.firstChild) {
				select.removeChild(select.firstChild);
			}

			const documentFragment = document.createDocumentFragment();
			newOptions.forEach((newOption) => documentFragment.appendChild(newOption));
			select.appendChild(documentFragment);

			if (options.every((option) => option.value !== selectedOptionValue)) {
				setSelected(options[0].value);

				if (onChangeCallback) {
					onChangeCallback();
				}
			}

			shownOptions = options;
		}

		function setSelected(optionValue) {
			const index = shownOptions.findIndex((option) => option.value === optionValue);

			if (index === -1) {
				return false;
			}

			if (shownOptions[index].disabled) {
				return false;
			}

			selectedOptionValue = optionValue;
			select.selectedIndex = index;
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
			setSelected,
			getSelected: () => select.value,
			onChange,
			dispose,
		};
	}

	function createSlider(min, max, step, formatFn) {
		formatFn = formatFn || ((value) => value);

		let sliderChangesObserver;
		const config = { attributes: true, attributeFilter: ["data-low", "data-high"] };

		const slider = new DualRangeSlider({ min, max, step, valueLow: min, valueHigh: max });
		const from = document.newElement({
			type: "span",
			text: formatFn(min),
		});
		const to = document.newElement({
			type: "span",
			text: formatFn(max),
		});
		const sliderWrapper = document.newElement({
			type: "div",
			class: "tt-slider-wrapper",
			children: [
				slider.slider,
				document.newElement({
					type: "span",
					class: "tt-slider-label",
					children: [
						from,
						document.newElement({
							type: "span",
							text: " - ",
						}),
						to,
					],
				}),
			],
		});

		function updateLabels() {
			from.innerText = formatFn(parseInt(slider.slider.dataset.low));
			to.innerText = formatFn(parseInt(slider.slider.dataset.high));
		}

		function setRange(range) {
			if (sliderChangesObserver) {
				sliderChangesObserver.disconnect();
			}

			slider.updateValue(slider.handles[0], range.from);
			slider.updateValue(slider.handles[1], range.to);
			updateLabels();

			if (sliderChangesObserver) {
				sliderChangesObserver.observe(slider.slider, config);
			}
		}

		function getRange() {
			return {
				from: parseInt(slider.slider.dataset.low),
				to: parseInt(slider.slider.dataset.high),
			};
		}

		function onRangeChanged(callback) {
			sliderChangesObserver = new MutationObserver(() => {
				updateLabels();
				callback();
			});
			sliderChangesObserver.observe(slider.slider, config);
		}

		function dispose() {
			if (sliderChangesObserver) {
				sliderChangesObserver.disconnect();
				sliderChangesObserver = undefined;
			}
		}

		return {
			element: sliderWrapper,
			setRange,
			getRange,
			onRangeChanged,
			dispose,
		};
	}

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

		const factionsSelect = createDropdown([...defaultFactionsItems, ...factions]);
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
			getQuickModes: () => quickModeCheckboxList.getSelections(),
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
