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
				"settings.pages.global.keepAttackHistory",
			],
		},
		() => {
			if (!hasAPIData()) return "No API access.";
		}
	);

	async function showBox() {
		await requireElement(".basic-information .info-table .user-info-value");

		const id = parseInt(
			document
				.find(".basic-information .info-table .user-info-value > *:first-child")
				.innerText.trim()
				.match(/\[([0-9]*)]/i)[1]
		);

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

			content.appendChild(document.newElement({ type: "div", class: "section user-stats", text: "Stats" }));
		}

		async function buildSpy() {
			if (!settings.pages.profile.boxSpy) return;

			content.appendChild(document.newElement({ type: "div", class: "section spy-information", text: "Spy" }));
		}

		async function buildStakeouts() {
			if (!settings.pages.profile.boxStakeout) return;

			const hasStakeout = id in stakeouts;

			const checkbox = createCheckbox({ description: "Stakeout this user." });
			checkbox.setChecked(hasStakeout);
			checkbox.onChange(() => {
				if (checkbox.isChecked()) {
					ttStorage.change({
						stakeouts: {
							[id]: { alerts: { okay: false, hospital: false, landing: false, online: false, life: false } },
						},
					});

					alerts.classList.remove("hidden");
				} else {
					ttStorage.change({ stakeouts: { [id]: undefined } });

					alerts.classList.add("hidden");
				}
			});

			const isOkay = createCheckbox({ description: "is okay" });
			isOkay.onChange(() => {
				if (!(id in stakeouts)) return;

				ttStorage.change({ stakeouts: { [id]: { alerts: { okay: isOkay.isChecked() } } } });
			});

			const isInHospital = createCheckbox({ description: "is in hospital" });
			isInHospital.onChange(() => {
				if (!(id in stakeouts)) return;

				ttStorage.change({ stakeouts: { [id]: { alerts: { hospital: isInHospital.isChecked() } } } });
			});

			const lands = createCheckbox({ description: "lands" });
			lands.onChange(() => {
				if (!(id in stakeouts)) return;

				ttStorage.change({ stakeouts: { [id]: { alerts: { landing: lands.isChecked() } } } });
			});

			const comesOnline = createCheckbox({ description: "comes online" });
			comesOnline.onChange(() => {
				if (!(id in stakeouts)) return;

				ttStorage.change({ stakeouts: { [id]: { alerts: { online: comesOnline.isChecked() } } } });
			});

			const lifeDrops = createTextbox({ description: { before: "life drops below", after: "%" }, type: "number", attributes: { min: 0, max: 100 } });
			lifeDrops.onChange(() => {
				if (!(id in stakeouts)) return;

				ttStorage.change({ stakeouts: { [id]: { alerts: { life: parseInt(lifeDrops.getValue()) || false } } } });
			});

			const alerts = document.newElement({
				type: "div",
				class: "alerts",
				children: [isOkay.element, isInHospital.element, lands.element, comesOnline.element, lifeDrops.element],
			});

			if (hasStakeout) {
				isOkay.setChecked(stakeouts[id].alerts.okay);
				isInHospital.setChecked(stakeouts[id].alerts.hospital);
				lands.setChecked(stakeouts[id].alerts.landing);
				comesOnline.setChecked(stakeouts[id].alerts.online);
				lifeDrops.setValue(stakeouts[id].alerts.life === false ? "" : stakeouts[id].alerts.life);
			} else {
				alerts.classList.add("hidden");
			}

			content.appendChild(document.newElement({ type: "div", class: "section stakeout", children: [checkbox.element, alerts] }));
		}

		async function buildAttackHistory() {
			if (!settings.pages.profile.boxAttackHistory || !settings.pages.global.keepAttackHistory) return;

			const section = document.newElement({ type: "div", class: "section attack-history" });

			if (id in attackHistory.history) {
				const history = attackHistory.history[id];

				const table = createTable(
					[
						{ id: "win", title: "Wins", class: "positive", width: 40, cellRenderer: "string" },
						{ id: "defend", title: "Defends", class: "positive last-cell", width: 60, cellRenderer: "string" },
						{ id: "lose", title: "Lost", class: "negative", width: 30, cellRenderer: "string" },
						{ id: "defend_lost", title: "Defends lost", class: "negative", width: 80, cellRenderer: "string" },
						{ id: "stalemate", title: "Stalemates", class: "negative", width: 70, cellRenderer: "string" },
						{ id: "escapes", title: "Escapes", class: "negative last-cell", width: 60, cellRenderer: "string" },
						{ id: "respect_base", title: "Respect", class: "neutral", width: 50, cellRenderer: "respect" },
					],
					[history],
					{
						cellRenderers: {
							respect: (respectArray) => {
								let respect = respectArray.length ? respectArray.totalSum() / respectArray.length : 0;
								if (respect > 0) respect = formatNumber(respect, { decimals: 2 });
								else respect = "/";

								console.log("DKK data", respectArray);
								return { element: document.createTextNode(respect), dispose: () => {} };
							},
						},
						stretchColumns: true,
					}
				);

				section.appendChild(table.element);
			} else {
				section.appendChild(document.newElement({ type: "span", class: "no-history", text: "There is no attack history." }));
			}

			content.appendChild(section);
		}
	}

	function removeBox() {
		removeContainer("User Information");
	}
})();
