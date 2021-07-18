"use strict";

(async () => {
	startListener();
	const feature = featureManager.registerFeature(
		"Disable Ally Attacks",
		"loader",
		() => settings.pages.profile.disableAllyAttacks,
		startListener,
		disableAttackButton,
		removeWarning,
		{
			storage: ["settings.pages.profile.disableAllyAttacks", "settings.allyFactionsIDs"],
		},
		null
	);

	let closedOption = false;
	async function startListener() {
		addFetchListener(({ detail: { page, json, fetch } }) => {
			if (closedOption || !feature.enabled() || page !== "loader" || !json || !json.DB || !json.DB.defenderUser || !json.DB.defenderUser.factionID) return;
			disableAttackButton(json.DB.defenderUser.factionID);
		});
	}

	async function disableAttackButton(factionID) {
		if (document.find(".tt-disable-ally-attack")) return;
		await requireElement("[class*='players__'] #defender [class*='modal__']");
		if (
			!isNaN(factionID) &&
			(hasAPIData() &&
			factionID === userdata.faction.faction_id) ||
			settings.allyFactionsIDs.some((ally) => ally === factionID || ally.toString() === factionID)
		) {
			const warningDiv = document.newElement({
				type: "div",
				class: "tt-disable-ally-attack",
				text: "Blocked by TornTools. This player is an ally. Click here if you are sure to attack.",
			});
			document.find("[class*='players__'] #defender [class*='modal__']").insertAdjacentElement("afterbegin", warningDiv);
			warningDiv.addEventListener("click", (event) => {
				event.preventDefault();
				event.stopImmediatePropagation();
				if (confirm("Are you sure you want to attack this ally ?")) {
					event.target.remove();
					closedOption = true;
				};
			});
		}
	}

	function removeWarning() {
		document.findAll(".tt-disable-ally-attack").forEach(x => x.remove());
	}
})();
