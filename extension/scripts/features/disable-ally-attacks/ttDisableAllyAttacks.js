"use strict";

(async () => {
	if (!getPageStatus().access) return;
	if (isOwnProfile()) return;

	const feature = featureManager.registerFeature(
		"Disable Ally Attacks",
		"profile",
		() => settings.pages.profile.disableAllyAttacks && settings.alliedFactions.length,
		startObserver,
		disableAttackButton,
		enableButton,
		{
			storage: ["settings.pages.profile.disableAllyAttacks", "settings.alliedFactions"],
		},
		null
	);

	async function startObserver() {
		await requireElement(".profile-container");

		new MutationObserver(() => {
			if (feature.enabled()) disableAttackButton();
		}).observe(document.find(".profile-container"), { childList: true });
	}

	function listenerFunction(event) {
		event.preventDefault();
		event.stopImmediatePropagation();
		if (confirm("Are you sure you want to attack this ally ?")) {
			window.location = document.find(".profile-buttons .profile-button-attack").href;
		}
	}

	async function disableAttackButton() {
		await requireElement(".user-info-value [href*='/factions.php']");

		enableButton();

		const factionID = parseInt(document.find(".user-info-value [href*='/factions.php']").href.replace(/\D+/g, ""));
		const factionName = document.find(".user-info-value [href*='/factions.php']").innerText.trim();
		if (
			(hasAPIData() && factionID === userdata.faction.faction_id) ||
			settings.alliedFactions.some((ally) => {
				if (isIntNumber(ally)) return ally === factionID || ally.toString() === factionName;
				else return ally.trim() === factionName;
			})
		) {
			const crossSvgNode = crossSvg();
			document.find(".profile-buttons .profile-button-attack").insertAdjacentElement("beforeend", crossSvgNode);
			crossSvgNode.addEventListener("click", listenerFunction, { capture: true });
		}
	}

	function enableButton() {
		document.findAll(".tt-cross").forEach((x) => x.remove());
	}
})();
