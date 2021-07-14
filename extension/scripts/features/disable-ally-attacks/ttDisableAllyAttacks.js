"use strict";

(async () => {
	if (!getPageStatus().access) return;

	featureManager.registerFeature(
		"Disable Ally Attacks",
		"profile",
		() => settings.pages.profile.disableAllyAttacks,
		null,
		disableAttackButton,
		enableButton,
		{
			storage: ["settings.pages.profile.disableAllyAttacks", "settings.allyFactionsIDs"],
		},
		null
	);

	async function disableAttackButton() {
		await requireElement(".user-info-value [href*='/factions.php']");
		enableButton();
		const factionID = parseInt(document.find(".user-info-value [href*='/factions.php']").href.replace(/\D+/g, ""));
		const factionName = document.find(".user-info-value [href*='/factions.php']").innerText.trim();
		if (
			(hasAPIData() &&
			factionID === userdata.faction.faction_id) ||
			settings.allyFactionsIDs.some((ally) => {
				if (isIntNumber(ally)) return ally === factionID || ally.toString() === factionName;
				else return ally.trim() === factionName;
			})
			) {
			const crossSvg = await fetch(chrome.runtime.getURL("resources/images/svg-icons/cross.svg")).then((x) => x.text());
			const attackButton = document.find(".profile-buttons .profile-button-attack");
			attackButton.insertAdjacentHTML("beforeend", crossSvg);
			const attackSvg = attackButton.find(":scope > svg[class*='default__']");
			if (hasDarkMode()) attackSvg.setAttribute("fill", "url(#linear-gradient-disable-dark-mode)");
			else attackSvg.setAttribute("fill", "rgba(153, 153, 153, 0.4)");
		}
	}

	function enableButton() {
		document.findAll(".tt-cross").forEach((x) => x.remove());
		const attackSvg = document.find(".profile-buttons .profile-button-attack svg[class*='default__']");
		if (hasDarkMode() && attackSvg) attackSvg.setAttribute("fill", "url(#linear-gradient-dark-mode)");
		else if (attackSvg) attackSvg.setAttribute("fill", "url(#linear-gradient)");
	}
})();
