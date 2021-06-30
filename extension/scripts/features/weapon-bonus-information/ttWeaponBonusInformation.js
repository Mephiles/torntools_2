"use strict";

(async () => {
	if (!getPageStatus().access) return;

	const BONUSES = {
		Demoralized: {
			description:
				"Demoralized provides an additive 10% passive debuff to each of your opponents battle stats. Up to 5 of these may stack at once, for a 50% debuff to all stats.",
		},
	};

	featureManager.registerFeature(
		"Weapon Bonus Information",
		"attack log",
		// () => settings.pages.missions.hints,
		() => true,
		null,
		showInformation,
		null,
		{
			// storage: ["settings.pages.missions.hints"],
		},
		null
	);

	function showInformation() {
		// TODO - Freeze 				Snow Cannon				Debuff
		// TODO - Blindfire				Rheinmetall MG3			Damage Bonus
		// TODO - Poisoned				Blowgun					DOT
		// TODO - Burning				Flamethrower			DOT
		// TODO - Laceration			Bread Knife				DOT
		// TODO - Severe Burning		Molotov Cocktail		DOT
		// TODO - Spray					Dual SMGs				Damage Bonus
		// TODO - Emasculate			Pink MAC-10				Happy Bonus
		// TODO - Hazardous				Nock Gun				Damage Penalty
		// TODO - Storage				Handbag					Passive
		// TODO - Toxin					Poison Umbrella			Debuff
		// TODO - Sleep (unreleased)	Tranquilizer Gun		Debuff

		for (const log of document.findAll(".log-list > li")) {
			const icon = log.find(".message-wrap span:first-child").classList[0];

			let bonus;
			switch (icon) {
				case "attacking-events-demoralized":
					bonus = BONUSES.Demoralized;
					break;
				default:
					continue;
			}

			log.find(".message").appendChild(
				document.newElement({
					type: "div",
					class: "tt-bonus-information",
					html: `<i class="fas fa-info-circle" title="${bonus.description}"></i>`,
				})
			);

			console.log("DKK bonus", log, bonus);
		}
	}
})();
