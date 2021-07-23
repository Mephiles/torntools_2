"use strict";

(async () => {
	const feature = featureManager.registerFeature(
		"Last Action",
		"last action",
		() => settings.scripts.lastAction.factionMember,
		addListener,
		addLastAction,
		removeLastAction,
		{
			storage: ["settings.scripts.lastAction.factionMember"],
		},
		null
	);

	function addListener() {
		if (isOwnFaction()) {
			CUSTOM_LISTENERS[EVENT_CHANNELS.FACTION_INFO].push(async () => {
				if (!feature.enabled()) return;

				await addLastAction(true);
			});
		}
	}

	async function addLastAction(force) {
		if (isOwnFaction() && !force) return;
		if (document.find(".tt-last-action")) return;
		await requireElement(".members-list .table-body > li");
		const lastActionList = (await fetchData("torn", { section: "faction", ...(isOwnFaction() ? {} : { id: parseInt(getSearchParameters().get("ID")) }) }))
			.members;
		const list = document.find(".members-list .table-body");
		list.classList.add("tt-modified");
		list.findAll(":scope > li").forEach((li) => {
			const userID = li.find(".user.name").dataset.placeholder.match(/(?<=\[)\d+(?=]$)/g)[0];
			li.insertAdjacentElement(
				"afterend",
				document.newElement({
					type: "div",
					class: "tt-last-action",
					text: `Last action: ${lastActionList[userID].last_action.relative}`,
				})
			);
		});
	}

	function removeLastAction() {
		const list = document.find(".members-list .table-body.tt-modified");
		if (list) {
			list.findAll(":scope > div.tt-last-action").forEach((x) => x.remove());
			list.classList.remove("tt-modified");
		}
	}
})();
