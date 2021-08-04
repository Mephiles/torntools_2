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

		const { content, options } = createContainer("User Information", {
			nextElement: document.find(".medals-wrapper") || document.find(".basic-information")?.closest(".profile-wrapper"),
			class: "mt10",
		});

		const relativeValue = createCheckbox({ description: "Relative values" });
		relativeValue.setChecked(settings.pages.profile.boxFetch);
		relativeValue.onChange(() => {
			for (const field of content.findAll(".relative-field")) {
				field.innerText = relativeValue.isChecked()
					? formatNumber(field.dataset.relative, { decimals: 0, forceOperation: true })
					: formatNumber(field.dataset.value, { decimals: 0 });
			}
		});
		options.appendChild(relativeValue.element);

		if (filters.profile.fetch) {
			buildStats().catch((error) => console.log("TT - Couldn't build the stats part of the profile box.", error));
			buildSpy().catch((error) => console.log("TT - Couldn't build the spy part of the profile box.", error));
		} else {
			const button = document.newElement({
				type: "button",
				class: "tt-btn",
				text: "Fetch data from the API.",
				events: {
					async click() {
						showLoadingPlaceholder(section, true);
						button.classList.add("hidden");

						let finished = 0;

						buildStats()
							.catch((error) => console.log("TT - Couldn't build the stats part of the profile box.", error))
							.then(handleBuild);
						buildSpy()
							.catch((error) => console.log("TT - Couldn't build the spy part of the profile box.", error))
							.then(handleBuild);

						function handleBuild() {
							finished++;

							if (finished === 1) {
								section.remove();
							} else if (finished === 2) {
								for (const section of [...content.findAll(".section[order]")].sort(
									(a, b) => parseInt(a.getAttribute("order")) - parseInt(b.getAttribute("order"))
								))
									section.parentElement.appendChild(section);
							}
						}
					},
				},
			});

			const section = document.newElement({
				type: "div",
				class: "manually-fetch",
				children: [button],
			});

			content.appendChild(section);
		}

		buildStakeouts().catch((error) => console.log("TT - Couldn't build the stakeout part of the profile box.", error));
		buildAttackHistory().catch((error) => console.log("TT - Couldn't build the attack history part of the profile box.", error));

		async function buildStats() {
			if (!settings.pages.profile.boxStats) return;

			content.appendChild(document.newElement({ type: "div", class: "section user-stats", text: "Stats", attributes: { order: 1 } }));
		}

		async function buildSpy() {
			if (!settings.pages.profile.boxSpy && settings.apiUsage.user.battlestats) return;

			const section = document.newElement({ type: "div", class: "section spy-information", attributes: { order: 2 } });
			content.appendChild(section);

			showLoadingPlaceholder(section, true);

			let errors = [];
			let spy = false;
			if (settings.external.yata) {
				try {
					let result;
					if (ttCache.hasValue("yata-spy", id)) {
						result = ttCache.get("yata-spy", id);
					} else {
						result = (await fetchData("yata", { relay: true, section: "spy", id, includeKey: true, silent: true }))?.spies[id];

						if (result) {
							result = {
								...result,
								update: result.update * 1000,
							};
						}

						ttCache.set({ [id]: result || false }, TO_MILLIS.SECONDS * 30, "yata-spy").then(() => {});
					}

					if (result) {
						spy = {
							defense: result.defense,
							dexterity: result.dexterity,
							speed: result.speed,
							strength: result.strength,
							total: result.total,

							type: false,
							timestamp: result.update,
							updated: formatTime(result.update, { type: "ago" }),
							source: "YATA",
						};
					}
				} catch (error) {
					if (error.code === 2 && error.error === "Player not found") errors.push({ service: "YATA", message: "You don't have an account." });
					else errors.push({ service: "YATA", message: `Unknown (${error.code}) - ${error.error}` });

					console.log("Couldn't load stat spy from YATA.", error);
				}
			}
			if (settings.external.tornstats) {
				try {
					let result;
					if (ttCache.hasValue("tornstats-spy", id)) {
						result = ttCache.get("tornstats-spy", id);
					} else {
						result = await fetchData("tornstats", { section: "spy", id, silent: true });

						result = {
							status: result.status,
							message: result.message,
							spy: result.spy,
						};

						ttCache.set({ [id]: result }, TO_MILLIS.SECONDS * 30, "tornstats-spy").then(() => {});
					}

					if (result.spy?.status) {
						// FIXME - Load timestamp.
						const timestamp = false;

						if (!spy || timestamp > spy.timestamp) {
							spy = {
								defense: result.spy.defense,
								dexterity: result.spy.dexterity,
								speed: result.spy.speed,
								strength: result.spy.strength,
								total: result.spy.total,

								type: result.spy.type,
								timestamp,
								updated: result.spy.difference,
								source: "TornStats",
							};
						}
					} else {
						if (!result.status) {
							if (result.message.includes("User not found.")) errors.push({ service: "TornStats", message: "You don't have an account." });
							else errors.push({ service: "TornStats", message: `Unknown - ${error.message}` });
						}
					}
				} catch (error) {
					errors.push({ service: "TornStats", message: `Unknown - ${error}` });
					console.log("Couldn't load stat spy from TornStats.", error);
				}
			}

			showLoadingPlaceholder(section, false);

			if (spy) {
				const table = createTable(
					[
						{ id: "stat", title: "Stat", width: 60, cellRenderer: "string" },
						{ id: "them", title: "Them", class: "their-stat", width: 80, cellRenderer: "number" },
						{ id: "you", title: "You", class: "your-stat", width: 80, cellRenderer: "relative" },
					],
					[
						{ stat: "Strength", them: spy.strength, you: { value: userdata.strength, relative: getRelative(spy.strength, userdata.strength) } },
						{ stat: "Defense", them: spy.defense, you: { value: userdata.defense, relative: getRelative(spy.defense, userdata.defense) } },
						{ stat: "Speed", them: spy.speed, you: { value: userdata.speed, relative: getRelative(spy.speed, userdata.speed) } },
						{
							stat: "Dexterity",
							them: spy.dexterity,
							you: { value: userdata.dexterity, relative: getRelative(spy.dexterity, userdata.dexterity) },
						},
						{ stat: "Total", them: spy.total, you: { value: userdata.total, relative: getRelative(spy.total, userdata.total) } },
					],
					{
						cellRenderers: {
							number: (number) => {
								return { element: document.createTextNode(formatNumber(number, { decimals: 0 })), dispose: () => {} };
							},
							relative: (data) => {
								const isRelative = filters.profile.relative;

								return {
									element: document.newElement({
										type: "span",
										class: "relative-field",
										text: isRelative
											? formatNumber(data.relative, { decimals: 0, forceOperation: true })
											: formatNumber(data.value, { decimals: 0 }),
										dataset: data,
									}),
									dispose: () => {},
								};
							},
						},
						rowClass: (rowData) => {
							if (rowData.them === "N/A" || rowData.you.value === "N/A") return "";

							return rowData.them > rowData.you.value ? "superior-them" : "superior-you";
						},
						stretchColumns: true,
					}
				);
				section.appendChild(table.element);

				let footer;
				if (spy.source && spy.type) footer = `Source: ${spy.source} (${spy.type}), ${spy.updated}`;
				else if (spy.source) footer = `Source: ${spy.source}, ${spy.updated}`;

				if (footer) section.appendChild(document.newElement({ type: "p", class: "spy-source", html: footer }));
			} else {
				section.appendChild(document.newElement({ type: "span", class: "no-spy", text: "There is no spy report." }));

				if (errors.length) {
					section.appendChild(
						document.newElement({
							type: "p",
							class: "no-spy-errors",
							html: errors.map(({ service, message }) => `${service} - ${message}`).join("<br>"),
						})
					);
				}
			}

			function getRelative(them, your) {
				return them === "N/A" || your === "N/A" ? "N/A" : your - them;
			}
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

			content.appendChild(
				document.newElement({ type: "div", class: "section stakeout", attributes: { order: 3 }, children: [checkbox.element, alerts] })
			);
		}

		async function buildAttackHistory() {
			if (!settings.pages.profile.boxAttackHistory || !settings.pages.global.keepAttackHistory) return;

			const section = document.newElement({ type: "div", class: "section attack-history", attributes: { order: 4 } });

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
