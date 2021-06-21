"use strict";

(async () => {
	if (!getPageStatus().access) return;

	const feature = featureManager.registerFeature(
		"Quick Crimes",
		"crimes",
		() => settings.pages.crimes.quickCrimes,
		initialise,
		loadCrimes,
		dispose,
		{
			storage: ["settings.pages.crimes.quickCrimes"],
		},
		null
	);

	function initialise() {
		CUSTOM_LISTENERS[EVENT_CHANNELS.CRIMES_LOADED].push(() => {
			if (!feature.enabled()) return;

			loadCrimes();
		});
		CUSTOM_LISTENERS[EVENT_CHANNELS.CRIMES_CRIME].push(() => {
			if (!feature.enabled()) return;

			loadCrimes();
		});
	}

	async function loadCrimes() {
		await requireElement("form[name='crimes']");

		const { content, options } = createContainer("Quick Crimes", {
			previousElement: document.find(".content-title"),
			allowDragging: true,
		});
		content.appendChild(document.newElement({ type: "div", class: "inner-content" }));

		options.appendChild(
			document.newElement({
				type: "div",
				class: "option",
				id: "edit-items-button",
				children: [document.newElement({ type: "i", class: "fas fa-plus" }), "Edit"],
				events: {
					click: (event) => {
						event.stopPropagation();

						const enabled = options.find("#edit-items-button").classList.toggle("tt-overlay-item");

						// FIXME - Show quick crimes as overlay items.
						// FIXME - Show normal crimes as overlay items.

						if (enabled) document.find(".tt-overlay").classList.remove("hidden");
						else document.find(".tt-overlay").classList.add("hidden");

						// FIXME - Remove items when clicking them.
						if (enabled) {
							// for (const item of document.findAll("ul.items-cont[aria-expanded='true'] > li")) {
							// 	if (!allowQuickItem(parseInt(item.dataset.item), item.dataset.category)) continue;
							//
							// 	item.addEventListener("click", onItemClickQuickEdit);
							// }
						} else {
							// for (const item of document.findAll("ul.items-cont[aria-expanded='true'] > li")) {
							// 	if (!allowQuickItem(parseInt(item.dataset.item), item.dataset.category)) continue;
							//
							// 	item.removeEventListener("click", onItemClickQuickEdit);
							// }
						}
					},
				},
			})
		);

		for (const quickCrime of quick.crimes) {
			addQuickCrime(quickCrime, false);
		}

		makeDraggable();

		function makeDraggable() {
			const form = document.find("form[name='crimes']");
			if (!form || !form.hasAttribute("action")) return;

			const action = `${location.origin}/${form.getAttribute("action")}`;
			const step = getSearchParameters(action).get("step");
			if (!["docrime2", "docrime4"].includes(step)) return;

			for (const crime of form.findAll("ul.item")) {
				if (crime.hasAttribute("draggable")) continue;

				crime.setAttribute("draggable", "true");
				crime.addEventListener("dragstart", onDragStart);
				crime.addEventListener("dragend", onDragEnd);
			}
		}

		function onDragStart(event) {
			event.dataTransfer.setData("text/plain", null);

			setTimeout(() => {
				document.find("#quickCrimes > main").classList.add("drag-progress");
				if (document.find("#quickCrimes .temp.quick-item")) return;

				const form = document.find("form[name='crimes']");
				const nerve = parseInt(form.find("input[name='nervetake']").value);

				const action = `${location.origin}/${form.getAttribute("action")}`;
				const step = getSearchParameters(action).get("step");

				const data = {
					step,
					nerve,
					name: event.target.find(".choice-container input").value,
					icon: event.target.find(".title img").src,
					text: event.target.find(".bonus").innerText.trim(),
				};

				addQuickCrime(data, true);
			});
		}

		async function onDragEnd() {
			if (document.find("#quickCrimes .temp.quick-item")) {
				document.find("#quickCrimes .temp.quick-item").remove();
			}

			document.find("#quickCrimes > main").classList.remove("drag-progress");

			await saveCrimes();
		}

		function addQuickCrime(data, temporary) {
			const content = findContainer("Quick Crimes", { selector: ":scope > main" });
			const innerContent = content.find(".inner-content");

			const { step, nerve, name, icon, text } = data;

			if (innerContent.find(`.quick-item[data-id='${name}']`)) return;

			const closeIcon = document.newElement({
				type: "i",
				class: "fas fa-times tt-close-icon",
				attributes: { title: "Remove quick access. " },
				events: {
					click: async (event) => {
						event.stopPropagation();
						closeIcon.dispatchEvent(new Event("mouseout"));
						itemWrap.remove();
						await saveCrimes();
					},
				},
			});

			const itemWrap = document.newElement({
				type: "form",
				class: temporary ? "temp quick-item" : "quick-item",
				dataset: data,
				children: [
					document.newElement({ type: "input", attributes: { name: "nervetake", type: "hidden", value: nerve } }),
					document.newElement({ type: "input", attributes: { name: "crime", type: "hidden", value: name } }),
					document.newElement({
						type: "ul",
						class: "item",
						children: [
							document.newElement({ type: "div", class: "pic", attributes: { style: `background-image: url(${icon})` } }),
							document.newElement({ type: "div", class: "text", text: `${text} (-${nerve} nerve)` }),
						],
					}),
					closeIcon,
				],
				attributes: {
					action: `crimes.php?step=${step}`,
					method: "post",
					name: "crimes",
				},
			});
			innerContent.appendChild(itemWrap);
		}

		async function saveCrimes() {
			const content = findContainer("Quick Crimes", { selector: ":scope > main" });

			await ttStorage.change({
				quick: {
					crimes: [...content.findAll(".quick-item")].map((crime) => ({
						step: crime.dataset.step,
						nerve: parseInt(crime.dataset.nerve),
						name: crime.dataset.name,
						icon: crime.dataset.icon,
						text: crime.dataset.text,
					})),
				},
			});
		}
	}

	function dispose() {
		removeContainer("Quick Crimes");
	}
})();
