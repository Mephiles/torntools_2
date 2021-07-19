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

		const ownedFilter = createCheckboxDuo({ description: "Owned" });
		ownedFilter.onChange(applyFilter);
		ownedFilter.setValue(filters.stocks.investment.owned);
		localFilters.owned = { getValue: ownedFilter.getValue };

		const benefitFilter = createCheckboxDuo({ description: "Benefit" });
		benefitFilter.onChange(applyFilter);
		benefitFilter.setValue(filters.stocks.investment.benefit);
		localFilters.benefit = { getValue: benefitFilter.getValue };

		const passiveFilter = createCheckboxDuo({ description: "Passive" });
		passiveFilter.onChange(applyFilter);
		passiveFilter.setValue(filters.stocks.investment.passive);
		localFilters.passive = { getValue: passiveFilter.getValue };

		const investmentSection = createFilterSection({ title: "Investment" });
		investmentSection.element.appendChild(ownedFilter.element);
		investmentSection.element.appendChild(benefitFilter.element);
		investmentSection.element.appendChild(passiveFilter.element);
		filterContent.appendChild(investmentSection.element);

		content.appendChild(filterContent);

		await applyFilter();
	}

	async function applyFilter() {
		await requireElement("#stockmarketroot ul[class*='stock___']");

		const content = findContainer("Stocks Filter", { selector: "main" });

		const name = localFilters.name.getValue();
		const owned = localFilters.owned.getValue();
		const benefit = localFilters.benefit.getValue();
		const passive = localFilters.passive.getValue();

		// Save filters
		await ttStorage.change({ filters: { stocks: { name, owned: { owned, benefit, passive } } } });

		// Actual Filtering
		for (const row of document.findAll("#stockmarketroot ul[class*='stock___']")) {
			// Name
			if (name && !row.find("li[data-name='nameTab']").innerText.toLowerCase().includes(name.toLowerCase())) {
				hideRow(row);
				continue;
			}

			if (owned === "yes" || owned === "no") {
				const isOwned = row.find("p[class*='count___']").innerText !== "None";

				if ((isOwned && owned === "no") || (!isOwned && owned === "yes")) {
					hideRow(row);
					continue;
				}
			}

			if (benefit === "yes" || benefit === "no") {
				const hasBenefit = !!row.find(".increment.filled");

				if ((hasBenefit && benefit === "no") || (!hasBenefit && benefit === "yes")) {
					hideRow(row);
					continue;
				}
			}

			if (passive === "yes" || passive === "no") {
				const isPassive = !!row.find("[class*='dividendInfo___'] [class*='passive___']");

				if ((isPassive && passive === "no") || (!isPassive && passive === "yes")) {
					hideRow(row);
					continue;
				}
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
