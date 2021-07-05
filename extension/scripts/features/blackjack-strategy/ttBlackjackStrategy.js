"use strict";

(async () => {
	if (!getPageStatus().access) return;

	featureManager.registerFeature(
		"Blackjack Strategy",
		"casino",
		() => settings.pages.casino.blackjack,
		null,
		executeStrategy,
		null,
		{
			storage: ["settings.pages.casino.blackjack"],
		},
		null
	);

	function executeStrategy() {}
})();
