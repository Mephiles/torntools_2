"use strict";

(async () => {
	if (!isOwnFaction()) return;

	const feature = featureManager.registerFeature(
		"Member Info",
		"faction",
		() => settings.pages.faction.memberInfo,
		addListener,
		addInfo,
		removeInfo,
		{
			storage: ["settings.pages.faction.memberInfo"],
		},
		() => {
			if (!hasAPIData() || !hasFactionAPIAccess()) return "No API access!";
		},
		{ liveReload: true }
	);

	function addListener() {
		CUSTOM_LISTENERS[EVENT_CHANNELS.FACTION_INFO].push(async () => {
			if (!feature.enabled()) return;

			await addInfo(true);
		});
	}

	async function addInfo(force) {
		if (!force) return;
		if (document.find(".tt-money-balance, .tt-points-balance")) return;

		await requireElement(".members-list .table-body > li");

		let donations;
		if (ttCache.hasValue("faction-members-donations", userdata.faction.faction_id)) {
			donations = ttCache.get("faction-members-donations", userdata.faction.faction_id);
		} else {
			donations = (
				await fetchData("torn", {
					section: "faction",
					selections: ["donations"],
					silent: true,
					succeedOnError: true,
				})
			).donations;

			ttCache.set({ [userdata.faction.faction_id]: donations }, TO_MILLIS.SECONDS * 30, "faction-members-donations").then(() => {});
		}

		document.findAll(".members-list .table-body > li").forEach((li) => {
			const userID = li.find(".user.name").dataset.placeholder.match(/(?<=\[)\d+(?=]$)/g)[0];
			if (donations[userID]) {
				if (donations[userID].money_balance) {
					if (li.nextSibling?.className?.includes("tt-last-action")) {
						li.nextSibling.insertAdjacentElement(
							"afterend",
							document.newElement({
								type: "div",
								class: "tt-money-balance",
								text: `Money Balance: ${formatNumber(donations[userID].money_balance, { currency: true })}`,
							})
						);
					} else {
						li.insertAdjacentElement(
							"afterend",
							document.newElement({
								type: "div",
								class: "tt-money-balance",
								text: `Money Balance: ${formatNumber(donations[userID].money_balance, { currency: true })}`,
							})
						);
					}
				}
				if (donations[userID].points_balance) {
					if (li.nextSibling?.className?.includes("tt-last-action")) {
						li.nextSibling.insertAdjacentElement(
							"afterend",
							document.newElement({
								type: "div",
								class: "tt-points-balance",
								text: `Point Balance: ${formatNumber(donations[userID].points_balance)}`,
							})
						);
					} else {
						li.insertAdjacentElement(
							"afterend",
							document.newElement({
								type: "div",
								class: "tt-points-balance",
								text: `Point Balance: ${formatNumber(donations[userID].points_balance)}`,
							})
						);
					}
				}
			}
		});
	}

	function removeInfo() {
		document.findAll(".members-list .table-body > .tt-money-balance, .members-list .table-body > .tt-points-balance").forEach((x) => x.remove());
	}
})();
