"use strict";

(async () => {
	if (!getPageStatus().access) return;
	if (isOwnProfile()) return;

	featureManager.registerFeature(
		"Profile Box",
		"profile",
		() =>
			settings.pages.profile.box &&
			(settings.pages.profile.boxStats || settings.pages.profile.boxSpy || settings.pages.profile.boxStakeout || settings.pages.profile.boxAttackHistory),
		null,
		showBox,
		removeBox,
		{
			storage: [
				"settings.pages.profile.box",
				"settings.pages.profile.boxStats",
				"settings.pages.profile.boxSpy",
				"settings.pages.profile.boxStakeout",
				"settings.pages.profile.boxAttackHistory",
			],
		},
		() => {
			if (!hasAPIData()) return "No API access.";
		}
	);

	async function showBox() {
		await requireElement(".profile-wrapper");

		const { content } = createContainer("User Information", {
			nextElement: document.find(".medals-wrapper") || document.find(".basic-information")?.closest(".profile-wrapper"),
			class: "mt10",
		});

		buildStats().catch((error) => console.log("TT - Couldn't build the stats part of the profile box.", error));
		buildSpy().catch((error) => console.log("TT - Couldn't build the spy part of the profile box.", error));
		buildStakeouts().catch((error) => console.log("TT - Couldn't build the stakeout part of the profile box.", error));
		buildAttackHistory().catch((error) => console.log("TT - Couldn't build the attack history part of the profile box.", error));

		async function buildStats() {
			if (!settings.pages.profile.boxStats) return;

			content.appendChild(document.newElement({ type: "div", class: "user-stats", text: "Stats" }));
		}

		async function buildSpy() {
			if (!settings.pages.profile.boxSpy) return;

			content.appendChild(document.newElement({ type: "div", class: "spy-information", text: "Spy" }));
		}

		async function buildStakeouts() {
			if (!settings.pages.profile.boxStakeout) return;

			content.appendChild(document.newElement({ type: "div", class: "stakeout", text: "Stakeout" }));
		}

		async function buildAttackHistory() {
			if (!settings.pages.profile.boxAttackHistory) return;

			content.appendChild(document.newElement({ type: "div", class: "attack-history", text: "Attack History" }));
		}
	}

	function removeBox() {
		removeContainer("User Information");
	}
})();
