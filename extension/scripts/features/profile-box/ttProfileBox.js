"use strict";

(async () => {
	if (!getPageStatus().access) return;
	if (isOwnProfile()) return;

	const STATS = [
		// Basic rewards.
		{ name: "Awards", type: "basic", getter: (data) => data.awards },
		{ name: "Networth", type: "basic", getter: (data) => data.personalstats.networth, formatter: "currency" },
		{ name: "User Activity", type: "basic", getter: (data) => data.personalstats.useractivity },
		// FIXME - Decide type of these stats.
		{ name: "Stat Enhancers Used", type: "basic", getter: (data) => data.personalstats.statenhancersused },
	];

	const key_dict = {
		attacks: {
			attackswon: "Attacks: Won",
			attackslost: "Attacks: Lost",
			attacksdraw: "Attacks: Draw",
			attacksstealthed: "Attacks: Stealthed",
			attackhits: "Attacks: Total Hits",
			attackmisses: "Attacks: Misses",
			attacksassisted: "Attacks: Assisted",
			attackswonabroad: "Attacks: Won Abroad",
			highestbeaten: "Attacks: Highest Lvl Beaten",
			largestmug: "Attacks: Largest Mug",
			moneymugged: "Attacks: Money Mugged",
			onehitkills: "Attacks: One Hit Kills",
			attackdamage: "Attacks: Total Damage",
			yourunaway: "Attacks: Escaped",
			unarmoredwon: "Attacks: Unarmored Wins",
			weaponsbought: "Attacks: Weapons Bought",
			attackcriticalhits: "Attacks: Critical Hits",
			bestdamage: "Attacks: Best Damage",
			bestkillstreak: "Attacks: Best Killstreak",
			arrestsmade: "Attacks: Arrests",
			roundsfired: "Attacks: Ammo: Fired",
			incendiaryammoused: "Attacks: Ammo: Incendiary",
			piercingammoused: "Attacks: Ammo: Piercing",
			tracerammoused: "Attacks: Ammo: Tracer",
			specialammoused: "Attacks: Ammo: Special Total",
			hollowammoused: "Attacks: Ammo: Hollow Point",
			elo: "Attacks: Elo rating",
		},
		bounties: {
			bountiesplaced: "Bounties: Placed",
			bountiescollected: "Bounties: Completed",
			totalbountyreward: "Bounties: Rewards",
			totalbountyspent: "Bounties: Spent On",
			receivedbountyvalue: "Bounties: Received",
			bountiesreceived: "Bounties: Times Bountied",
		},
		crimes: {
			selling_illegal_products: "Crimes: Sell illegal products",
			theft: "Crimes: Theft",
			auto_theft: "Crimes: Auto theft",
			drug_deals: "Crimes: Drug deals",
			computer_crimes: "Crimes: Computer",
			murder: "Crimes: Murder",
			fraud_crimes: "Crimes: Fraud",
			other: "Crimes: Other",
			total: "Crimes: Total",
			organisedcrimes: "Crimes: Organised Crimes",
		},
		consumables: {
			candyused: "Consumables: Candy",
			energydrinkused: "Consumables: Energy Drinks",
			consumablesused: "Consumables: Total",
			alcoholused: "Consumables: Alcohol",
			boostersused: "Consumables: Boosters",
		},
		contracts: {
			contractscompleted: "Contracts: Completed",
			dukecontractscompleted: "Contracts: Duke",
			missionscompleted: "Contracts: Missions Completed",
			missioncreditsearned: "Contracts: Miss. Credits Earned",
		},
		defends: {
			defendswon: "Defends: Won",
			defendslost: "Defends: Lost",
			defendsstalemated: "Defends: Stalemated",
			defendslostabroad: "Defends: Lost Abroad",
		},
		drugs: {
			cantaken: "Drugs: Cannabis",
			exttaken: "Drugs: Ecstasy",
			lsdtaken: "Drugs: LSD",
			shrtaken: "Drugs: Shrooms",
			xantaken: "Drugs: Xanax",
			victaken: "Drugs: Vicodin",
			drugsused: "Drugs: Total",
			kettaken: "Drugs: Ketamine",
			opitaken: "Drugs: Opium",
			spetaken: "Drugs: Speed",
			pcptaken: "Drugs: PCP",
			overdosed: "Drugs: Overdosed",
		},
		finishers: {
			chahits: "Finishers: Mechanical",
			axehits: "Finishers: Clubbing",
			grehits: "Finishers: Temporary",
			pishits: "Finishers: Pistol",
			rifhits: "Finishers: Rifle",
			smghits: "Finishers: SMG",
			piehits: "Finishers: Piercing",
			slahits: "Finishers: Slashing",
			shohits: "Finishers: Shotgun",
			heahits: "Finishers: Heavy Artillery",
			machits: "Finishers: Machine Guns",
			h2hhits: "Finishers: Unarmed",
		},
		items: {
			itemsbought: "Items: Bought",
			itemsboughtabroad: "Items: Bought Abroad",
			itemssent: "Items: Sent",
			auctionsells: "Items: Auctioned",
			cityfinds: "Items: Found in City",
			itemsdumped: "Items: Dumped",
		},
		refills: {
			nerverefills: "Refills: Nerve",
			tokenrefills: "Refills: Token",
			refills: "Refills: Energy",
		},
		revives: {
			revives: "Revives: Given",
			reviveskill: "Revives: Skill",
			revivesreceived: "Revives: Received",
		},
		travel: {
			argtravel: "Travel: Argentina",
			mextravel: "Travel: Mexico",
			dubtravel: "Travel: UAE",
			hawtravel: "Travel: Hawaii",
			japtravel: "Travel: Japan",
			lontravel: "Travel: UK",
			soutravel: "Travel: South Africa",
			switravel: "Travel: Switzerland",
			chitravel: "Travel: China",
			cantravel: "Travel: Canada",
			caytravel: "Travel: Cayman Islands",
			traveltimes: "Travel: Total",
			traveltime: "Travel: Time Spent",
		},
		other: {
			auctionswon: "Auctions Won",

			peopleboughtspent: "Bail Fees Spent",
			booksread: "Books Read",
			bloodwithdrawn: "Blood Bags Filled",

			classifiedadsplaced: "Classified Ads Placed",
			companymailssent: "Company Mail Sent",

			dumpfinds: "Dump Finds",
			dumpsearches: "Dump Searches",
			daysbeendonator: "Days Been A Donator",

			failedbusts: "Failed Busts",
			theyrunaway: "Foes Escaped",
			friendmailssent: "Friend Mail Sent",
			factionmailssent: "Faction Mail Sent",

			peoplebusted: "Jail: Busted",
			peoplebought: "Jail: Bailed",
			jailed: "Jail: Total",

			medicalitemsused: "Meds Used",
			medstolen: "Meds Stolen",
			meritsbought: "Merits Bought",
			rehabcost: "Money Spent On Rehab",

			pointsbought: "Points Bought",
			personalsplaced: "Personal Ads Placed",

			respectforfaction: "Respect Earned",
			rehabs: "Rehabs Done",
			racingpointsearned: "Racing: Points Earned",
			raceswon: "Racing: Won",
			racesentered: "Racing: Entered",

			spousemailssent: "Spouse Mail Sent",
			spydone: "Spies Done",
			cityitemsbought: "Shop Purchases",

			trainsreceived: "Times Trained",
			mailssent: "Total Mail Sent",
			hospital: "Times In Hospital",
			territorytime: "Territory Time",

			virusescoded: "Viruses Coded",
		},
	};

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

		if (settings.pages.profile.boxFetch) {
			showRelative();
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

						showRelative();
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

		function showRelative() {
			const relativeValue = createCheckbox({ description: "Relative values" });
			relativeValue.setChecked(filters.profile.relative);
			relativeValue.onChange(() => {
				for (const field of content.findAll(".relative-field")) {
					const isRelative = relativeValue.isChecked();

					const value = isRelative ? field.dataset.relative : field.dataset.value;

					// noinspection JSCheckFunctionSignatures
					const options = { ...(JSON.parse(field.dataset.options ?? false) || { decimals: 0 }), forceOperation: isRelative };

					field.innerText = formatNumber(value, options);
				}
			});
			options.appendChild(relativeValue.element);
		}

		async function buildStats() {
			if (!settings.pages.profile.boxStats || !settings.apiUsage.user.personalstats || !settings.apiUsage.user.crimes) return;

			const section = document.newElement({ type: "div", class: "section user-stats", attributes: { order: 1 } });
			content.appendChild(section);

			showLoadingPlaceholder(section, true);

			let data;
			if (ttCache.hasValue("profile-stats", userdata.faction.faction_id)) {
				data = ttCache.get("profile-stats", id);
			} else {
				try {
					data = await fetchData("torn", { section: "user", id, selections: ["profile", "personalstats", "crimes"], silent: true });

					ttCache.set({ [id]: data }, TO_MILLIS.HOURS * 6, "profile-stats").catch(() => {});
				} catch (error) {
					console.log("TT - Couldn't fetch users stats.", error);
				}
			}

			if (data) {
				// FIXME - Show data.

				buildCustom();
				buildOthers();

				const otherList = document.newElement({
					type: "button",
					class: "other-stats-button",
					text: "View other stats.",
					events: {
						click() {
							const isCustom = !content.find(".custom-stats").classList.toggle("hidden");

							if (isCustom) {
								content.find(".other-stats").classList.add("hidden");
								otherList.innerText = "View other stats.";
							} else {
								content.find(".other-stats").classList.remove("hidden");
								otherList.innerText = "View custom list.";
							}
						},
					},
				});

				const editButton = document.newElement({
					type: "button",
					class: "edit-stats",
					children: [document.newElement({ type: "i", class: "fas fa-cog" })],
					events: {
						click() {
							const overlay = document.find(".tt-overlay");

							if (overlay.classList.toggle("hidden")) {
								// Overlay is now hidden.
								// FIXME - Remove click listener.
							} else {
								// Overlay is now shown.
								// FIXME - Handle stat click.
							}
						},
					},
				});

				const actions = document.newElement({ type: "div", class: "stat-actions", children: [otherList, editButton] });
				section.appendChild(actions);
			} else {
				section.appendChild(document.newElement({ type: "div", class: "stats-error-message", text: "Failed to fetch data." }));
			}

			showLoadingPlaceholder(section, false);

			function createStatsTable(id, rows, hidden) {
				return createTable(
					[
						{ id: "stat", title: "Stat", width: 60, cellRenderer: "string" },
						{ id: "them", title: "Them", class: "their-stat", width: 80, cellRenderer: "number" },
						{ id: "you", title: "You", class: "your-stat", width: 80, cellRenderer: "number" },
					],
					rows,
					{
						class: `${id} ${hidden ? "hidden" : ""}`,
						cellRenderers: {
							number: (data) => {
								let node;
								if (typeof data === "object") {
									const isRelative = filters.profile.relative;

									const value = isRelative ? data.relative : data.value;
									const forceOperation = isRelative;

									const options = { decimals: 0, forceOperation };
									node = document.newElement({
										type: "span",
										class: "relative-field",
										text: formatNumber(value, options),
										dataset: { value: data.value, relative: data.relative, options },
									});
								} else {
									node = document.createTextNode(formatNumber(data, { decimals: 0 }));
								}

								return {
									element: node,
									dispose: () => {},
								};
							},
							currency: (data) => {
								let node;
								if (typeof data === "object") {
									const isRelative = filters.profile.relative;

									const value = isRelative ? data.relative : data.value;
									const forceOperation = isRelative;

									const options = { decimals: 0, currency: true, forceOperation };
									node = document.newElement({
										type: "span",
										class: "relative-field",
										text: formatNumber(value, options),
										dataset: { value: data.value, relative: data.relative, options },
									});
								} else {
									node = document.createTextNode(formatNumber(data, { decimals: 0, currency: true }));
								}

								return {
									element: node,
									dispose: () => {},
								};
							},
						},
						rowClass: (rowData) => {
							if (rowData.them === "N/A" || rowData.you.value === "N/A" || rowData.them === rowData.you.value) return "";

							return rowData.them > rowData.you.value ? "superior-them" : "superior-you";
						},
						stretchColumns: true,
					}
				);
			}

			function buildCustom() {
				// FIXME - Decide what to show.
				const stats = ["Networth"];

				const rows = stats
					.map((name) => {
						const stat = STATS.find((_stat) => _stat.name === name);
						if (!stat) return false;

						const them = stat.getter(data);
						const you = stat.getter(userdata);
						if (isNaN(them) || isNaN(you)) return false;

						const row = {
							stat: stat.name,
							them: them,
							you: { value: you, relative: them - you },
						};

						if (stat.formatter) row.cellRenderer = stat.formatter;

						return row;
					})
					.filter((value) => !!value);

				const table = createStatsTable("custom-stats", rows, false);
				section.appendChild(table.element);
			}

			function buildOthers() {
				// FIXME - Decide what to show.
				const stats = ["Networth"];

				const _stats = STATS.filter((stat) => !stats.includes(stat.name))
					.map((stat) => {
						const them = stat.getter(data);
						const you = stat.getter(userdata);
						if (isNaN(them) || isNaN(you)) return false;

						const row = {
							stat: stat.name,
							them: them,
							you: { value: you, relative: them - you },
							type: stat.type,
						};

						if (stat.formatter) row.cellRenderer = stat.formatter;

						return row;
					})
					.filter((value) => !!value);
				const types = [...new Set(_stats.map((stat) => stat.type))];

				// FIXME - Change table to allow stray rows.
				const _rows = types.flatMap((type) => {
					return [{ type: capitalizeText(type) }, ..._stats.filter((stat) => stat.type === type).sort((a, b) => a.name.localeCompare(b.name))];
				});

				console.log("DKK potential rows", _rows);

				// FIXME - Decide what to show.
				const rows = [];

				const table = createStatsTable("other-stats", rows, true);
				section.appendChild(table.element);
			}
		}

		async function buildSpy() {
			if (!settings.pages.profile.boxSpy || !settings.apiUsage.user.battlestats) return;

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
						{ id: "you", title: "You", class: "your-stat", width: 80, cellRenderer: "number" },
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
							number: (data) => {
								let node;
								if (typeof data === "object") {
									const isRelative = filters.profile.relative;

									const value = isRelative ? data.relative : data.value;
									const forceOperation = isRelative;

									const options = { decimals: 0, forceOperation };
									node = document.newElement({
										type: "span",
										class: "relative-field",
										text: formatNumber(value, options),
										dataset: { value: data.value, relative: data.relative, options },
									});
								} else {
									node = document.createTextNode(formatNumber(data, { decimals: 0 }));
								}

								return {
									element: node,
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

								return {
									element: document.createTextNode(respect),
									dispose: () => {},
								};
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
