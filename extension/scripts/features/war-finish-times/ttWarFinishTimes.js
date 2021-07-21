"use strict";

(async () => {
	const feature = featureManager.registerFeature(
		"War Finish Times",
		"faction",
		() => settings.pages.faction.warFinishTimes,
		startListeners,
		addFinishTimes,
		removeFunction,
		{
			storage: ["settings.pages.faction.warFinishTimes"],
		},
		null
	);

	function startListeners() {
		if (isOwnFaction()) {
			CUSTOM_LISTENERS[EVENT_CHANNELS.FACTION_MAIN].push(() => {
				if (feature.enabled()) addFinishTimes();
			});
		}
	}

	async function addFinishTimes() {
		await requireElement("#react-root .f-war-list");

		document.findAll(".f-war-list.war-new .status-wrap .timer:not(.tt-timer)").forEach((warTimer) => {
			const timerParts = warTimer.innerText.split(":").map((x) => parseInt(x));
			const msTime = Date.now() + timerParts[0] * 24 * 60 * 60 * 1000 + timerParts[1] * 60 * 60 * 1000 + timerParts[2] * 60 * 1000 + timerParts[3] * 1000;

			const timerElement = document.newElement({
				type: "div",
				class: "timer tt-timer",
				text: ,
				attributes: { mseconds: msTime },
			});
			warTimer.insertAdjacentElement("afterend", timerElement);
			const timerID = setInterval(() => {
				if (!document.body.contains(timerElement)) clearInterval(timerID);
				const mseconds = timerElement.getAttribute("mseconds");
				timerElement.innerText = `${formatTime(mseconds)} ${formatDate(mseconds)}`
			}, 1000);
		});
	}

	async function removeFunction() {
		document.findAll(".f-war-list.war-new .status-wrap .timer.tt-timer").forEach(x => x.remove());
	}
})();
