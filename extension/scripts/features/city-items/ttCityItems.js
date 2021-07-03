"use strict";

(async () => {
	if (!getPageStatus().access) return;

	const feature = featureManager.registerFeature(
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
	let containerObserver;

	async function showHighlight() {
		if (hasContainer) return;

		await requireElement("#map .highlightItemMarket");

		hasContainer = true;

		// Show container
		const { content, collapsed, container } = createContainer("City Items", { class: "mt10", nextElement: document.find("#tab-menu") });

		const items = getAllItems();
		handleContainer();

		// FIXME - Show items in container.
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

		function handleContainer() {
			const map = document.find("#map");
			if (settings.pages.city.onlyOpenContainer) {
				if (!collapsed) map.classList.add("highlight-items");

				containerObserver = new MutationObserver((mutations) => {
					if (mutations[0].target.classList.contains("collapsed")) map.classList.remove("highlight-items");
					else map.classList.add("highlight-items");
				});
				containerObserver.observe(container.find(".title"), { attributes: true, attributeFilter: ["class"] });
			} else {
				map.classList.add("highlight-items");
			}
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

		if (containerObserver) {
			containerObserver.disconnect();
			containerObserver = undefined;
		}

		hasContainer = false;
	}
})();
