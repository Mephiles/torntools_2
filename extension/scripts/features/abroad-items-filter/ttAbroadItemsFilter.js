"use strict";

(async () => {
	if (!isAbroad()) return;
	if (!getPageStatus().access) return;
	if (getSearchParameters().get("page")) return;

	featureManager.registerFeature(
		"Item Filter",
		"travel",
		() => settings.pages.travel.itemFilter,
		null,
		addFilter,
		removeFilter,
		{
			storage: ["settings.pages.travel.itemFilter"],
		},
		null
	);

	function addFilter() {
		const { content } = createContainer("Item Filters", {
			nextElement: document.find(".travel-agency-market"),
		});

		const statistics = createStatistics();
		content.appendChild(statistics.element);

		const filterContent = document.newElement({
			type: "div",
			class: "content",
		});

		const profitOnlyFilter = createFilterSection({
			title: "Profit",
			checkbox: "Only Profit",
			defaults: filters.abroadItems.profitOnly,
			callback: filtering,
		});
		filterContent.appendChild(profitOnlyFilter.element);

		const categoryFilter = createFilterSection({
			title: "Status",
			checkboxes: [
				{ id: "plushie", description: "Plushies" },
				{ id: "flower", description: "Flowers" },
				{ id: "drug", description: "Drugs" },
				{ id: "weapon", description: "Weapons" },
				{ id: "temporary", description: "Temporary" },
				{ id: "other", description: "Other" },
			],
			defaults: filters.abroadItems.categories,
			callback: filtering,
		});
		filterContent.appendChild(categoryFilter.element);

		content.appendChild(filterContent);

		filtering();

		async function filtering() {
			const profitOnly = settings.pages.travel.travelProfits && profitOnlyFilter.isChecked(content);
			const categories = categoryFilter.getSelections(content);

			for (const li of document.findAll(".users-list > li")) {
				showRow(li);

				if (profitOnly && parseInt(li.find(".tt-travel-market-cell").getAttribute("value")) < 0) {
					hideRow(li);
					continue;
				}

				if (categories.length) {
					const itemCategory = li.find(".type").lastChild.textContent.trim().toLowerCase();
					if (
						!categories.includes(itemCategory) ||
						(["melee", "primary", "secondary"].includes(itemCategory) && !categories.includes("weapon")) ||
						(["alcohol", "clothing", "other"].includes(itemCategory) && !categories.includes("other")) ||
						!categories.includes("other")
					) {
						hideRow(li);
						continue;
					}
				}
			}

			await ttStorage.change({
				filters: {
					abroadItems: {
						profitOnly,
						categories,
					},
				},
			});

			statistics.updateStatistics(
				document.findAll(".users-list > li:not(.hidden)").length,
				document.findAll(".users-list > li").length,
				content
			);
		}

		function showRow(row) {
			row.classList.remove("hidden");
		}

		function hideRow(row) {
			row.classList.add("hidden");
		}
	}

	function removeFilter() {
		removeContainer("Item Filters");
		document.findAll(".users-list > li.hidden").forEach((x) => x.classList.remove("hidden"));
	}
})();
