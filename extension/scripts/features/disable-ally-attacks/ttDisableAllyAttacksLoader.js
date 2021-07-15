"use strict";

(async () => {
	if (!getPageStatus().access) return;

	const feature = featureManager.registerFeature(
		"Disable Ally Attacks",
		"loader",
		() => settings.pages.profile.disableAllyAttacks,
		startListener,
		disableAttackButton,
		() => {},
		{
			storage: ["settings.pages.profile.disableAllyAttacks", "settings.allyFactionsIDs"],
		},
		null
	);

	async function startListener() {
		addFetchListener(({ detail: { page, json, fetch } }) => {
			if (page !== "loader" || !json || !json.DB || !json.DB.defenderUser || !json.DB.defenderUser.factionID) return;
			disableAttackButton(json.DB.defenderUser.factionID);
		});
	}

	let closedOption = false;
	function disableAttackButton(factionID) {
		if (document.find(".tt-disable-ally-attack") || closedOption) return;
		if (
			!closedOption &&
			!isNaN(factionID) &&
			(hasAPIData() &&
			factionID === userdata.faction.faction_id) ||
			settings.allyFactionsIDs.some((ally) => ally === factionID || ally.toString() === factionID)
		) {
			const coordinates = document.find("[class*='players__'] #defender [class*='modal__']").getBoundingClientRect();
			const stopperDiv = document.newElement({
				type: "div",
				class: "tt-disable-ally-attack",
				text: "This player is an ally. Click here if you are sure to attack.",
				attributes: {
					style: `
						left: ${coordinates.left}px;
						top: ${coordinates.top}px;
						position: absolute;
						background-color: #999;
						z-index: 100000;
						width: ${coordinates.width}px;
						height: ${coordinates.height}px;
					`,
				},
			});
			document.body.appendChild(stopperDiv);
			stopperDiv.addEventListener("click", (event) => {
				closedOption = true;
				event.preventDefault();
				event.stopImmediatePropagation();
				if (confirm("Are you sure you want to attack this ally ?")) event.target.remove();
			});
		}
	}
})();
