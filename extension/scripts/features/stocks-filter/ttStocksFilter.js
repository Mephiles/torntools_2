"use strict";

(async () => {
	if (!getPageStatus().access) return;

	featureManager.registerFeature(
		"Stocks Filter",
		"stocks",
		() => settings.pages.stocks.filter,
		initialiseFilters,
		addFilters,
		removeFilters,
		{
			storage: ["settings.pages.stocks.filter"],
		},
		null
	);

	function initialiseFilters() {
		// CUSTOM_LISTENERS[EVENT_CHANNELS.HOSPITAL_SWITCH_PAGE].push(() => {
		// 	if (!feature.enabled()) return;
		//
		// 	filtering(true);
		// });
	}

	let localFilters;

	async function addFilters() {
		await requireElement("#stockmarketroot");

		localFilters = {};

		const { content } = createContainer("Stocks Filter", {
			class: "mt10",
			previousElement: document.find("#stockmarketroot").firstElementChild,
			compact: true,
			filter: true,
		});

		const statistics = createStatistics("stocks");
		content.appendChild(statistics.element);
		localFilters.statistics = { updateStatistics: statistics.updateStatistics };

		const filterContent = document.newElement({ type: "div", class: "content" });

		const nameFilter = createFilterSection({
			title: "Name",
			text: true,
			default: filters.stocks.name,
			callback: applyFilter,
		});
		filterContent.appendChild(nameFilter.element);
		localFilters.name = { getValue: nameFilter.getValue };

		content.appendChild(filterContent);

		await applyFilter();
	}

	async function applyFilter() {
		await requireElement("#stockmarketroot ul[class*='stock___']");

		const content = findContainer("Stocks Filter", { selector: "main" });

		const name = localFilters.name.getValue();

		// Save filters
		await ttStorage.change({ filters: { stocks: { name } } });

		console.log("DKK applyFilter", { name });

		// Actual Filtering
		for (const row of document.findAll("#stockmarketroot ul[class*='stock___']")) {
			// Name
			if (name && !row.find("li[data-name='nameTab']").innerText.toLowerCase().includes(name.toLowerCase())) {
				hideRow(row);
				continue;
			}

			showRow(row);
		}

		function showRow(li) {
			li.classList.remove("hidden");
		}

		function hideRow(li) {
			li.classList.add("hidden");
		}

		localFilters.statistics.updateStatistics(
			document.findAll("#stockmarketroot ul[class*='stock___']:not(.hidden)").length,
			document.findAll("#stockmarketroot ul[class*='stock___']").length,
			content
		);
	}

	function removeFilters() {
		localFilters = undefined;

		removeContainer("Stocks Filter");
		document.findAll("#stockmarketroot ul[class*='stock___'].hidden").forEach((stock) => stock.classList.remove("hidden"));
	}
})();
