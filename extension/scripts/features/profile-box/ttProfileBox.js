"use strict";

(async () => {
	if (!getPageStatus().access) return;
	if (isOwnProfile()) return;

	featureManager.registerFeature(
		"Profile Box",
		"profile",
		() => settings.pages.profile.box,
		null,
		showBox,
		removeBox,
		{
			storage: ["settings.pages.profile.box"],
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
			content.appendChild(document.newElement({ type: "div", class: "user-stats", text: "Stats" }));
		}

		async function buildSpy() {
			content.appendChild(document.newElement({ type: "div", class: "spy-information", text: "Spy" }));
		}

		async function buildStakeouts() {
			content.appendChild(document.newElement({ type: "div", class: "stakeout", text: "Stakeout" }));
		}

		async function buildAttackHistory() {
			content.appendChild(document.newElement({ type: "div", class: "attack-history", text: "Attack History" }));
		}
	}

	function removeBox() {
		removeContainer("User Information");
	}
})();
