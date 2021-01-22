"use strict";

(async () => {
    await loadDatabase();
    
    console.log("TT - City: Starting...");
    await requireMapLoaded();
    loadCity();
    listenToSettings();
	console.log("TT - City: Ready");
})();

function requireMapLoaded() {
	return requireElement("#map .leaflet-marker-pane .highlightItemMarket");
}

function loadCity(incomingSettings) {
    let scopedSettings = incomingSettings || settings;
    if (!scopedSettings.pages.city.highlight && !scopedSettings.pages.city.showValue) return;

    let container;
	if (scopedSettings.pages.city.showValue) {
		container = createItemContainer();
	}

	if (scopedSettings.pages.city.highlight) {
		if (scopedSettings.pages.city.closedHighlight) {
            addHighlightForItems();
		} else if (container) {
            if (!isContainerClosed(container)) {
				addHighlightForItems();
			}
			addContainerClosedEventListenerForHighlightOfItems(container);
		}
	}
}

function listenToSettings() {
	storageListeners.settings.push((newSettings) => {
        reset();
        loadCity(newSettings);
    });
}

function reset() {
	document.find("#tt-city-items-container")?.remove();
	removeHighlightFromItems();
}

//#region Container
function createItemContainer() {
	const items = groupBy(getItemIDsOnMap());
	const { content, container } = createContainerElement();
	if (items.length) {
		addTotalItemsValueToContainer(content, items);
		addItemsToContainer(content, items);
	} else {
		addNoItemsToContainer(content);
	}
	return container;
}

function addTotalItemsValueToContainer(contentElement, groupedItems) {
	let totalValue = 0;
	let count = 0;
	for (const groupedItem of groupedItems) {
		const item = getItemFromId(groupedItem.key);
		if (!item) continue;

		totalValue += item.market_value * groupedItem.count;
		count += groupedItem.count;
	}

	const e = div("tt-city-totalvalue");
	e.append(span(`City Items Value (${count}):`, "label"), span(`$${formatNumber(totalValue)}`, "value"));
	contentElement.append(e);
}

function addItemsToContainer(contentElement, groupedItems) {
	const itemContainer = div("tt-city-itemlist");
	for (const groupedItem of groupedItems) {
		const item = getItemFromId(groupedItem.key);
		if (!item) continue;

		const itemDiv = div("tt-city-item");

		if (groupedItem.count > 1) {
			itemDiv.append(span(`${groupedItem.count}x`));
		}
		itemDiv.append(
			a(item.name, `https://www.torn.com/imarket.php#/p=shop&step=shop&type=&searchname=${item.name}`),
			span(`($${formatNumber(item.market_value, { shorten: true })})`)
		);

		itemContainer.append(itemDiv);
	}
	contentElement.append(itemContainer);
}

function addNoItemsToContainer(contentElement) {
	contentElement.append(div("tt-city-noitems", "No items found"));
}

function addContainerClosedEventListenerForHighlightOfItems(containerElement) {
	containerElement.find(".title").addEventListener("click", () => {
		const closed = isContainerClosed(containerElement);
		if (closed) {
			removeHighlightFromItems();
		} else {
			addHighlightForItems();
		}
	});
}

function isContainerClosed(containerElement) {
	return containerElement.find(".title").classList.contains("collapsed");
}

function createContainerElement() {
	return createContainer("City Items", {
		id: "tt-city-items-container",
		nextElement: document.find("#tab-menu"),
		spacer: true,
	});
}

function getItemFromId(itemId) {
	const item = torndata.items[itemId];
	if (!item) {
		console.warn(`TT - City: TornData unknown item id '${itemId}'`);
	}
	return item;
}
//#endregion

//#region Map Items/Highlight
function* getItemIDsOnMap() {
	const elements = getItemElements();
	for (let element of elements) {
		let src = element.getAttribute("src");
		let id = src.split("items/")[1].split("/")[0];
		yield id;
	}
}

function addHighlightForItems() {
	const elements = getItemElements();
	for (let element of elements) {
		element.classList.add("tt-city-itemonmap");
	}
}

function removeHighlightFromItems() {
	const elements = getItemElements();
	for (let element of elements) {
		element.classList.remove("tt-city-itemonmap");
	}
}

function* getItemElements() {
	for (let element of document.findAll("#map .leaflet-marker-pane *")) {
		let src = element.getAttribute("src") || "";
		if (src.includes("https://www.torn.com/images/items/")) {
			yield element;
		}
	}
}
//#endregion

//#region DOM Stuff
const div = (className, text) => document.newElement({ type: "div", class: className, text });
const span = (text, className) => document.newElement({ type: "span", class: className, text });
const a = (text, href, className) => document.newElement({ type: "a", class: className, text, href });
//#endregion

//#region Utility
function groupBy(list) {
	const glist = [];
	for (const element of list) {
		const gListElement = glist.find((e) => e.key === element);
		if (gListElement) {
			gListElement.count++;
		} else {
			glist.push({ key: element, count: 1 });
		}
	}
	return glist;
}
//#endregion
