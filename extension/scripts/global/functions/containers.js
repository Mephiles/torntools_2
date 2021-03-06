"use strict";

function createContainer(title, options = {}) {
	options = {
		id: title.camelCase(true),
		parentElement: false,
		nextElement: false,
		previousElement: false,
		showHeader: true,
		collapsible: true,
		applyRounding: true,
		spacer: false,
		contentBackground: true,
		allowDragging: false,
		...options,
	};

	const container = _createContainer(title, options);

	let parentElement;
	if (options.parentElement) parentElement = options.parentElement;
	else if (options.nextElement) parentElement = options.nextElement.parentElement;
	else if (options.previousElement) parentElement = options.previousElement.parentElement;
	else throw new Error("Not yet supported!");

	if (options.nextElement) parentElement.insertBefore(container, options.nextElement);
	else if (options.previousElement) parentElement.insertBefore(container, options.previousElement.nextSibling);
	else parentElement.appendChild(container);

	return { container, content: container.find(".content"), options: container.find(".options") };

	function _createContainer(title, options = {}) {
		if (document.find(`#${options.id}`)) document.find(`#${options.id}`).remove();

		let containerClasses = ["tt-container"];
		if (options.collapsible) containerClasses.push("collapsible");
		if (options.applyRounding) containerClasses.push("rounding");
		if (options.spacer) containerClasses.push("spacer");

		const theme = THEMES[settings.themes.containers];
		containerClasses.push(theme.containerClass);
		const container = document.newElement({ type: "div", class: containerClasses.join(" "), id: options.id });

		const collapsed = options.collapsible && (options.id in filters.containers ? filters.containers[options.id] : false);

		let html = "";
		if (options.showHeader)
			html += `
				<div class="title ${collapsed ? "collapsed" : ""}">
					<div class="text">${title}</div>
					<div class="options"></div>
					${options.collapsible ? '<i class="icon fas fa-caret-down"/>' : ""}
				</div>`;
		html += `<div class="content ${options.contentBackground ? "background" : ""}"></div>`;
		container.innerHTML = html;

		if (options.collapsible) {
			container.find(".title").addEventListener("click", async () => {
				container.find(".title").classList.toggle("collapsed");

				await ttStorage.change({ filters: { containers: { [options.id]: container.find(".title").classList.contains("collapsed") } } });
			});
		}
		if (options.allowDragging) {
			let content = container.find(".content");
			content.addEventListener("dragover", (event) => event.preventDefault());
			content.addEventListener("drop", (event) => {
				content.find(".temp.item").classList.remove("temp");
				container.find(".content").style.maxHeight = container.find(".content").scrollHeight + "px";

				// Firefox opens new tab when dropping item
				event.preventDefault();
				event.dataTransfer.clearData();
			});
			content.addEventListener("dragenter", () => {
				if (content.find(".temp.item")) {
					content.find(".temp.item").style.opacity = "1";
				}
			});
			content.addEventListener("dragleave", () => {
				if (content.find(".temp.item")) {
					content.find(".temp.item").style.opacity = "0.2";
				}
			});
		}

		return container;
	}
}

function findContainer(title, options = {}) {
	options = {
		id: title.camelCase(true),
		selector: false,
		...options,
	};

	if (!options.id) return false;

	const container = document.find(`#${options.id}`);
	if (!container) return false;

	if (options.selector) return container.find(options.selector);
	else return container;
}

function removeContainer(title, options = {}) {
	const container = findContainer(title, options);
	if (!container) return;

	container.remove();
}
