"use strict";

(async () => {
	await loadDatabase();

	if (!settings.pages.api.marking) return;

	markSelections();

	function markSelections() {
		for (const field of document.findAll(".panel-body > p[class*='_fields']")) {
			const type = (() => {
				switch (field.classList[0].substring(0, 1)) {
					case "u":
						return "user";
					case "p":
						return "properties";
					case "f":
						return "faction";
					case "c":
						return "company";
					case "i":
						return "item_market";
					case "t":
						return "torn";
					default:
						return "user";
				}
			})();

			new MutationObserver((mutations, observer) => {
				observer.disconnect();

				toSpan(field);

				for (const selection of API_SELECTIONS[type]) {
					const span = field.find(`.selection[data-selection="${selection}"]`);
					if (!span) continue;

					span.classList.add("used");
				}
			}).observe(field, { childList: true });
		}

		function toSpan(field) {
			if (field.classList.contains("tt-modified")) return;

			field.classList.add("tt-modified");

			const selections = field.innerText
				.split(": ")
				.slice(1)
				.join(": ")
				.split(",")
				.map((selection) => selection.trim());

			const small = field.firstElementChild;

			small.innerHTML = "";
			small.appendChild(document.newElement({ type: "strong", text: "Available fields: " }));

			for (const selection of selections) {
				small.appendChild(document.newElement({ type: "span", text: selection, class: "selection", dataset: { selection } }));

				if (selections.indexOf(selection) !== selections.length - 1) {
					small.appendChild(document.createTextNode(", "));
				}
			}
		}
	}
})();
