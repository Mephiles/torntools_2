"use strict";

(async () => {
	const feature = featureManager.registerFeature(
		"Bounty Filter",
		"bounties",
		() => settings.pages.bounties.filter,
		initialiseListener,
		addFilter,
		removeFilter,
		{
			storage: ["settings.pages.bounties.filter"],
		},
		null
	);

	function initialiseListener() {
		new MutationObserver(() => {
			if (feature.enabled()) addFilter();
		}).observe(document.find(".content-wrapper"), { childList: true });
	}

	async function addFilter() {
		if (findContainer("Bounty Filter")) return;
		await requireElement(".bounties-list > li > ul > li .reward");
		const { options } = createContainer("Bounty Filter", {
			previousElement: document.find(".bounties-wrap .bounties-total"),
			onlyHeader: true,
			applyRounding: false,
		});
		const maxLevelInput = document.newElement({
			type: "input",
			attributes: {
				type: "number",
				min: "0",
				max: "100",
			}
		});
		const cbHideUnavailable = document.newElement({
			type: "input",
			id: "hideUnavailable",
			attributes: { type: "checkbox" },
		});
		options.appendChild(document.newElement({
			type: "span",
			children: [
				"Max Level",
				maxLevelInput,
				cbHideUnavailable,
				document.newElement({ type: "label", text: "Hide Unavailable", attributes: { for: "hideUnavailable" } })
			],
		}));

		// Setup saved filters
		maxLevelInput.value = filters.bounties.maxLevel;
		cbHideUnavailable.checked = filters.bounties.hideUnavailable;

		filterListing();
		maxLevelInput.addEventListener("input", filterListing);
		cbHideUnavailable.addEventListener("input", filterListing);
		async function filterListing() {
			// Get the set filters
			const tempMaxLevel = parseInt(maxLevelInput.value);
			const maxLevel = tempMaxLevel < 100 && tempMaxLevel > 0 ? tempMaxLevel : 100;
			maxLevelInput.value = maxLevel;
			const hideUnavailable = cbHideUnavailable.checked;

			// Save the filters
			await ttStorage.change({
				filters: {
					bounties: {
						maxLevel,
						hideUnavailable,
					},
				},
			});

			for (const bounty of [...document.findAll(".bounties-list > *:not(.clear)")]) {
				if (maxLevel > 0 && parseInt(bounty.find(".level").lastChild.textContent) > maxLevel) {
					hideBounty(bounty);
					continue;
				} else showBounty(bounty);
				if (hideUnavailable && bounty.find(".t-red")) {
					hideBounty(bounty);
					continue;
				} else showBounty(bounty);
			}
			function hideBounty(bounty) {
				bounty.classList.add("hidden");
			}
			function showBounty(bounty) {
				bounty.classList.remove("hidden");
			}
		}
	}

	function removeFilter() {
		removeContainer("Bounty Filter");
	}
})();
