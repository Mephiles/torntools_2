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

		content.innerHTML = `
				<div class="filter-header">
					<div class="statistic">Showing <span class="filter-count">X</span> of <span class="filter-total">Y</span> items</div>
				</div>
				<div class="filter-content">
					${
						settings.pages.travel.travelProfits
							? `
					<div class="filter-wrap" id="profit-filter">
						<div class="filter-heading">Profit</div>
						<div class="filter-multi-wrap">
							<div class="tt-checkbox-wrap">
								<input type="checkbox" name="profit" id="only_profit">
								<label for="only_profit">Only Profit</label>
							</div>
						</div>
					</div>
					`
							: ""
					}
					<div class="filter-wrap" id="category-filter">
						<div class="filter-heading">Categories</div>
						<div class="filter-multi-wrap">
							<div class="tt-checkbox-wrap">
								<input type="checkbox" id="plushie" value="plushie">
								<label for="plushie">Plushies</label>
							</div>
							<div class="tt-checkbox-wrap">
								<input type="checkbox" id="flower" value="flower">
								<label for="flower">Flowers</label>
							</div>
							<div class="tt-checkbox-wrap">
								<input type="checkbox" id="drug" value="drug">
								<label for="drug">Drugs</label>
							</div>
							<div class="tt-checkbox-wrap">
								<input type="checkbox" id="weapon" value="weapon">
								<label for="weapon">Weapons</label>
							</div>
							<div class="tt-checkbox-wrap">
								<input type="checkbox" id="armor" value="armor">
								<label for="armor">Armor</label>
							</div>
							<div class="tt-checkbox-wrap">
								<input type="checkbox" id="other" value="other">
								<label for="other">Other</label>
							</div>
						</div>
					</div>
				</div>
			`;

		content.find("#only_profit").checked = filters.abroadItems.profitOnly;
		for (const category of filters.abroadItems.categories) {
			content.find(`#category-filter input[value="${category}"]`).checked = true;
		}

		// Event listeners
		for (const checkbox of content.findAll(".tt-checkbox-wrap input")) {
			checkbox.onclick = applyFilters;
		}

		applyFilters();

		async function applyFilters() {
			const profitOnly = settings.pages.travel.travelProfits && content.find("#only_profit").checked;
			const categories = [];
			const categoriesExtra = [];

			// Categories
			for (const checkbox of [...content.findAll("#category-filter .tt-checkbox-wrap input:checked")]) {
				const value = checkbox.getAttribute("value");

				switch (value) {
					case "weapon":
						categoriesExtra.push("primary");
						categoriesExtra.push("secondary");
						categoriesExtra.push("defensive");
						categoriesExtra.push("melee");
						categoriesExtra.push("temporary");
						break;
					case "other":
						categoriesExtra.push("enhancer");
						categoriesExtra.push("clothing");
						categoriesExtra.push("alcohol");
						// FIXME - Add more missing categories.
						break;
					default:
						categories.push(value);
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
					const itemCategory = li
						.find(".type")
						.innerText.split("\n")
						.filter((x) => !!x)[1]
						.toLowerCase();

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
			content.find(".statistic .filter-count").innerText = document.findAll(".users-list > li:not(.hidden)").length;
			content.find(".statistic .filter-total").innerText = document.findAll(".users-list > li").length;
		}
	}

	function removeFilter() {
		removeContainer("Item Filters");
	}
})();
