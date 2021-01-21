"use strict";

(async () => {
	if(!settings.pages.city.enable) return;
	await loadDatabase();
	await requireMapLoaded();
	console.log('TT - City: Ready');

	const container = createItemContainer();

	if(!settings.pages.city.closedHighlight) {
		if(!isContainerClosed(container)) {
			addHighlightForItems();
		}
		addContainerClosedEventListenerForHighlightOfItems(container);
	}
	else {
		addHighlightForItems();
	}
})();

function requireMapLoaded() {
	return requireElement("#map .leaflet-marker-pane .highlightItemMarket");
}

//#region Container
function createItemContainer() {
	const items = groupBy(getItemIDsOnMap());
	const { content, container } = createContainerElement();
	if(items.length) {
		addTotalItemsValueToContainer(content, items);
		addItemsToContainer(content, items);
	}
	else {
		addNoItemsToContainer(content);
	}
	return container;
}

function addTotalItemsValueToContainer(contentElement, groupedItems) {
	if(!settings.pages.city.showValue) return;

	let totalValue = 0;
	let count = 0;
	for(const groupedItem of groupedItems) {
		const item = getItemFromId(groupedItem.key);
		if(!item) continue;

		totalValue += item.market_value * groupedItem.count;
		count += groupedItem.count;
	}

	const span1 = span(`City Items Value (${count}):`, 'label');
	const span2 = span(`$${formatNumber(totalValue)}`, 'value');
	const e = div('tt-city-totalvalue');
	e.appendChild(span1);
	e.appendChild(span2);
	contentElement.appendChild(e);
}

function addItemsToContainer(contentElement, groupedItems) {
	const itemContainer = div('tt-city-itemlist');
	for(const groupedItem of groupedItems) {
		const item = getItemFromId(groupedItem.key);
		if(!item) continue;

		const itemDiv = div('tt-city-item');

		const prefix = groupedItem.count > 1 ? span(`${groupedItem.count}x`) : undefined;
		const suffix = span(`($${formatNumber(item.market_value, { shorten: true })})`);
		const itemLink = a(item.name, `https://www.torn.com/imarket.php#/p=shop&step=shop&type=&searchname=${item.name}`);
		
		prefix && itemDiv.appendChild(prefix);
		itemDiv.appendChild(itemLink);
		itemDiv.appendChild(suffix);
		
		itemContainer.appendChild(itemDiv);
	}
	contentElement.appendChild(itemContainer);
}

function addNoItemsToContainer(contentElement) {
	contentElement.appendChild(div('tt-city-noitems', 'No items found'));
}

function addContainerClosedEventListenerForHighlightOfItems(containerElement) {
	containerElement.find('.title').addEventListener("click", (a, b) => {
		const closed = isContainerClosed(containerElement);
		if (closed) {
			removeHighlightFromItems();
		} 
		else {
			addHighlightForItems();
		}
	});
}

function isContainerClosed(containerElement) {
	return containerElement.find('.title').classList.contains("collapsed");
}

function createContainerElement() {
	return createContainer("City Items", {
		id: 'tt-city-items-container',
		nextElement: document.find("#tab-menu"),
		spacer: true
	});
}

function getItemFromId(itemId) {
	const item = torndata.items[itemId];
	if(!item) {
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
		element.classList.add('tt-city-itemonmap');
	}
}

function removeHighlightFromItems() {
	const elements = getItemElements();
	for (let element of elements) {
		element.classList.remove('tt-city-itemonmap');
	}
}

function* getItemElements() {
	for (let element of document.findAll("#map .leaflet-marker-pane *")) {
		let src = element.getAttribute("src") || '';
		if (src.indexOf("https://www.torn.com/images/items/") > -1) {
			yield element;
		}
	}
}
//#endregion

//#region DOM Stuff
const div = (className, text) => document.newElement({ type: 'div', class: className, text });
const span = (text, className) => document.newElement({ type: 'span', class: className, text });
const a = (text, href, className) => { const e = document.newElement({ type: 'a', class: className, text }); e.setAttribute("href", href); return e; };
//#endregion

//#region Utility
function groupBy(list) {
	const glist = [];
	for(const element of list) {
		const gListElement = glist.find(e => e.key === element);
		if(gListElement) {
			gListElement.count++;
		}
		else {
			glist.push({ key: element, count: 1 });
		}
	}
	return glist;
}
//#endregion