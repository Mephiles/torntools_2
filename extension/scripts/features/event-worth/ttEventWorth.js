"use strict";

(async () => {
	const feature = featureManager.registerFeature(
		"Event Worth",
		"events",
		() => settings.pages.events.eventWorth,
		startListener,
		addWorth,
		removeWorth,
		{
			storage: ["settings.pages.events.eventWorth"],
		},
		null
	);

	async function startListener() {
		await requireElement("form#masssell .no-messages");
		addXHRListener(({ detail: { page, xhr } }) => {
			if (page === "events") addWorth();
		});
	}

	async function addWorth() {
		await requireElement("form#masssell .no-messages");

		const regexes = [
			/(?<=bought ).*(?= of)|(?<=your points that were on the market for \$).*(?=\.)/g,
			/(?<=bought ).*(?=x)|(?<=from your bazaar for \$).*(?=\.)/g
		];
		document.findAll("form#masssell .mail-link[id]").forEach(li => {
			regexes.forEach((regex) => {
				const matches = li.innerText.match(regex);
				if (matches?.length === 2) {
					li.setAttribute("title", `(worth ${
						formatNumber(matches[1].replaceAll(",", "") / matches[0].replaceAll(",", ""), { currency: true })
					} each)`);
					li.classList.add("tt-modified");
				}
			});
		});
	}

	function removeWorth() {
		document.findAll("form#masssell .tt-modified.mail-link[id]").forEach(x => {
			x.removeAttribute("title");
			x.classList.remove("tt-modified");
		});
	}
})();
