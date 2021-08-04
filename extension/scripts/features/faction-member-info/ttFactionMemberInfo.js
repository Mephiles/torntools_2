"use strict";

(async () => {
	if (!isOwnFaction) return;

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
			if (!hasFactionAPIAccess()) return "No API access!";
		},
		{ liveReload: true }
	);

	let lastActionState = settings.scripts.lastAction.factionMember;
	function addListener() {
		CUSTOM_LISTENERS[EVENT_CHANNELS.FACTION_INFO].push(async () => {
			if (!feature.enabled()) return;

			await addInfo(true);
		});
		CUSTOM_LISTENERS[EVENT_CHANNELS.FEATURE_ENABLED].push(async (featureName) => {
			if (!feature.enabled()) return;

			if (featureName === "Last Action") {
				lastActionState = true;
				await addInfo(true);
			}
		});
		CUSTOM_LISTENERS[EVENT_CHANNELS.FEATURE_DISABLED].push(async (featureName) => {
			if (!feature.enabled()) return;

			if (featureName === "Last Action") {
				lastActionState = false;
				await addInfo(true);
			}
		});
	}

	async function addInfo(force) {
		if (!force) return;
		removeInfo();

		await requireElement(".members-list .table-body > li");
		if (lastActionState) await requireElement(".members-list .table-body.tt-modified > .tt-last-action");

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

			ttCache.set({ [userdata.faction.faction_id]: donations }, TO_MILLIS.SECONDS * 60, "faction-members-donations").then(() => {});
		}

		document.findAll(".members-list .table-body > li").forEach((li) => {
			const userID = li.find(".user.name").dataset.placeholder.match(/(?<=\[)\d+(?=]$)/g)[0];
			const memberInfo = document.newElement({
				type: "div",
				class: "tt-member-info"
			});
			const parent = lastActionState && li.nextSibling?.className?.includes("tt-last-action") ? li.nextSibling : memberInfo;
			if (donations[userID]) {
				if (donations[userID].points_balance) {
					parent.appendChild(
						document.newElement({
							type: "div",
							class: "tt-points-balance",
							text: `Point Balance: ${formatNumber(donations[userID].points_balance)}`,
						})
					);
				}
				if (donations[userID].money_balance) {
					parent.appendChild(
						document.newElement({
							type: "div",
							class: "tt-money-balance",
							text: `Money Balance: ${formatNumber(donations[userID].money_balance, { currency: true })}`,
						})
					);
				}
			}

			if (lastActionState && li.nextSibling?.className?.includes("tt-last-action")) {
				li.nextSibling.classList.add("modified");
			} else if (added) {
				li.insertAdjacentElement("afterend", memberInfo);
			}
		});
	}

	function removeInfo() {
		document.findAll(".tt-member-info").forEach((x) => x.remove());
	}
})();
