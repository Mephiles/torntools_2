"use strict";

(async () => {
	if (!getPageStatus().access) return;

	featureManager.registerFeature(
		"City Items",
		"city",
		() => settings.pages.city.items,
		null,
		showHighlight,
		removeHighlight,
		{
			storage: ["settings.pages.city.items"],
		},
		null
	);

	let hasContainer = false;

	async function showHighlight() {
		if (hasContainer) return;

		await requireElement("#map .highlightItemMarket");

		hasContainer = true;

		// Show container
		const { content, options } = createContainer("City Items", { class: "mt10", nextElement: document.find("#tab-menu") });

		const items = getAllItems();
		handleHighlight();
		showValue();

		// FIXME - Show items in container. On hover, highlight the first found item of this type.
		// FIXME - Show value in container.

		function getAllItems() {
			const items = [];

			for (const marker of document.findAll("#map .leaflet-marker-icon[src*='https://www.torn.com/images/items/']")) {
				const id = marker.src.split("items/")[1].split("/")[0];

				marker.classList.add("city-item");
				marker.setAttribute("item-id", id);

				items.push(id);
			}

			return items;
		}

		function handleHighlight() {
			const checkbox = createCheckbox("Highlight items");

			highlight(filters.city.highlightItems);

			checkbox.setChecked(filters.city.highlightItems);
			checkbox.onChange(() => {
				const state = checkbox.isChecked();

				highlight(state);
				ttStorage.change({ filters: { city: { highlightItems: state } } });
			});

			options.appendChild(checkbox.element);

			function highlight(state) {
				const map = document.find("#map");

				if (state) map.classList.add("highlight-items");
				else map.classList.remove("highlight-items");
			}
		}

		function showValue() {
			// FIXME - Show value in container.

			// TODO - Calculate value and item count.
			let totalValue = 1000000;
			let itemCount = 1;

			content.appendChild(
				document.newElement({
					type: "div",
					class: "tt-city-total",
					children: [
						document.newElement({ type: "span", class: "tt-city-total-text", text: `Item Value (${itemCount}): ` }),
						document.newElement({ type: "span", class: "tt-city-total-value", text: formatNumber(totalValue, { currency: true }) }),
					],
				})
			);
		}
	}

	function removeHighlight() {
		removeContainer("City Items");

		for (const item of document.findAll(".city-item")) {
			item.classList.remove("city-item");
			item.removeAttribute("item-id");
		}

		const map = document.find("#map");
		if (map) map.classList.remove("highlight-items");

		hasContainer = false;
	}
})();
