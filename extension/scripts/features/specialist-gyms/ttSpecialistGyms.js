"use strict";

(async () => {
	if (!getPageStatus().access) return;

	const feature = featureManager.registerFeature(
		"Specialist Gyms",
		"gym",
		() => settings.pages.gym.specialist,
		initialiseListeners,
		startFeature,
		dispose,
		{
			storage: ["settings.pages.gym.specialist"],
		},
		null
	);

	const SPECIALITY_GYMS = {
		balboas: ["defense", "dexterity"],
		frontline: ["strength", "speed"],
		gym3000: ["strength"],
		isoyamas: ["defense"],
		rebound: ["speed"],
		elites: ["dexterity"],
	};

	let battleStats = {};

	function initialiseListeners() {
		CUSTOM_LISTENERS[EVENT_CHANNELS.GYM_LOAD].push(({ stats }) => {
			if (!feature.enabled()) return;

			battleStats = stats;
			updateStats();
		});
		CUSTOM_LISTENERS[EVENT_CHANNELS.GYM_TRAIN].push(({ stats }) => {
			if (!feature.enabled()) return;

			battleStats = stats;
			updateStats();
		});
	}

	function startFeature() {
		const { content } = createContainer("Specialist Gyms", { class: "mt10" });

		// FIXME - Load gyms from storage.
		content.appendChild(createSection("frontline"));
		content.appendChild(createSection("isoyamas"));

		function createSection(gym) {
			const select = document.newElement({ type: "select", html: getGyms() });
			const section = document.newElement({
				type: "div",
				class: "specialist-gym",
				children: [select, document.newElement({ type: "span", class: "specialist-gym-text" })],
			});

			select.value = gym;

			select.addEventListener("change", () => {
				// FIXME - Save gym change.
				updateStats();
			});

			return section;

			function getGyms() {
				return `
					<option value="balboas">Balboas Gym (def/dex)</option>
					<option value="frontline">Frontline Fitness (str/spd)</option>
					<option value="gym3000">Gym 3000 (str)</option>
					<option value="isoyamas">Mr. Isoyamas (def)</option>
					<option value="rebound">Total Rebound (spd)</option>
					<option value="elites">Elites (dex)</option>
				`;
			}
		}
	}

	function updateStats() {
		// FIXME - Update stats.
		console.log("DKK updateStats 1", battleStats);

		for (const section of document.findAll(".specialist-gym")) {
			const gym = section.find("select").value;

			console.log("DKK updateStats 2", gym);
		}
	}

	function dispose() {
		removeContainer("Specialist Gyms");
	}
})();
