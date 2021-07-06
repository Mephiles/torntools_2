"use strict";

(async () => {
	const feature = featureManager.registerFeature(
		"Hide Unavailable Bounties",
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
		addXHRListener(({ detail: { page, json } }) => {
			if (page !== "bounties") return;
			if (feature.enabled()) addFilter();
		});
	}

	async function addFilter() {
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

		maxLevelInput.addEventListener("input", filterListing);
		cbHideUnavailable.addEventListener("input", filterListing);
		async function filterListing() {
			// Get the filters
			const maxLevel = maxLevelInput.value;
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

			document.findAll(".bounties-list > *").forEach((bounty) => {
				if (maxLevel > 0 && parseInt(bounty.find(".level").lastChild.textContent)) hideBounty(bounty);
				else showBounty(bounty);
				if (hideUnavailable && bounty.find(".t-red")) hideBounty(bounty);
				else showBounty(bounty);
			});
			function hideBounty(bounty) {
				bounty.classList.add("hidden");
			}
			function showBounty() {
				bounty.classList.remove("hidden");
			}
		}
	}

	function removeFilter() {
		removeContainer("Bounty Filter");
	}
})();
