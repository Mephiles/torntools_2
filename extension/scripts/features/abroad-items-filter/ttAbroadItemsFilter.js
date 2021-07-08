"use strict";

(async () => {
	if (!getPageStatus().access) return;

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
		// Create all checkboxes beforehand
		const cbProfitOnly = createCheckbox("Only Profit");
		cbProfitOnly.onChange(applyFilters);
		const profitOnlyFilter = document.newElement({
			type: "div",
			class: "profitOnlyFilter",
			children: [
				document.newElement({ type: "strong", text: "Profit" }),
				cbProfitOnly.element,
			],
		});
		const cbsCategories = createCheckboxList(
			[
				{ id: "plushie", description: "Plushies" },
				{ id: "flower", description: "Flowers" },
				{ id: "drug", description: "Drugs" },
				{ id: "weapon", description: "Weapons" },
				{ id: "armor", description: "Armor" },
				{ id: "other", description: "Other" },
			],
			"column"
		);
		cbsCategories.onSelectionChange(applyFilters);
		const categoryFilter = document.newElement({
			type: "div",
			class: "categoryFilter",
			children: [
				document.newElement({ type: "strong", text: "Categories" }),
				cbsCategories.element,
			],
		});
		// Append them ALL
		content.appendChild(document.newElement({
			type: "div",
			class: "statistics",
			children: [
				"Showing ",
				document.newElement({ type: "strong", class: "count", text: "X" }),
				" of ",
				document.newElement({ type: "strong", class: "total", text: "Y" }),
				" items",
			],
		}));
		content.appendChild(document.newElement({
			type: "div",
			class: "content",
			children: [
				profitOnlyFilter,
				categoryFilter
			],
		}));

		cbProfitOnly.setChecked(filters.abroadItems.profitOnly);
		cbsCategories.setSelections(filters.abroadItems.categories);

		applyFilters();

		async function applyFilters() {
			const profitOnly = settings.pages.travel.travelProfits && cbProfitOnly.isChecked();
			const categories = cbsCategories.getSelections();
			const categoriesExtra = [];

			// Categories
			for (const category of categories) {
				switch (category) {
					case "weapon":
						categoriesExtra.push("primary");
						categoriesExtra.push("secondary");
						categoriesExtra.push("defensive");
						categoriesExtra.push("melee");
						categoriesExtra.push("temporary");
						break;
					case "other":
						categoriesExtra.push("other");
						categoriesExtra.push("enhancer");
						categoriesExtra.push("clothing");
						categoriesExtra.push("alcohol");
						break;
				}
			}

			// Filtering
			for (const li of document.findAll(".users-list > li")) {
				showRow(li);

				if (profitOnly && parseInt(li.find(".tt-travel-market-cell").getAttribute("value")) < 0) {
					hideRow(li);
					continue;
				}

				if (categories.length || categoriesExtra.length) {
					const itemCategory = li.find(".type").lastChild.textContent.trim().toLowerCase();
					const matchesCategory = [...categories, ...categoriesExtra].some((category) => itemCategory === category);
					if (!matchesCategory) {
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

			updateStatistics();
		}

		function showRow(row) {
			row.classList.remove("hidden");
		}

		function hideRow(row) {
			row.classList.add("hidden");
		}

		function updateStatistics() {
			content.find(".count").innerText = document.findAll(".users-list > li:not(.hidden)").length;
			content.find(".total").innerText = document.findAll(".users-list > li").length;
		}
	}

	function removeFilter() {
		removeContainer("Item Filters");
		document.findAll(".users-list > li.hidden").forEach(x => x.classList.remove("hidden"));
	}
})();