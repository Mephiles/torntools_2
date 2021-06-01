"use strict";

const SETUP_PAGES = {
	initialize: setupInitialize,
	dashboard: setupDashboard,
	market: setupMarketSearch,
	stocks: setupStocksOverview,
};
const LOAD_PAGES = {
	market: loadMarketSearch,
	// stocks: setupStocksOverview,
};

let initiatedPages = {};

(async () => {
	document.body.style.minWidth = `${Math.min(416, screen.availWidth * 0.8)}px`;

	showLoadingPlaceholder(document.body, true);

	await loadDatabase();

	document.body.classList.add(getPageTheme());

	if (api.torn.error) {
		document.find(".error").classList.remove("hidden");
		document.find(".error").innerText = api.torn.error;
	}

	for (const navigation of document.findAll("#pages .main-nav li")) {
		navigation.addEventListener("click", async () => {
			await showPage(navigation.getAttribute("to"));
		});
	}
	document.find("#pages .right-nav li[to='settings']").addEventListener("click", () => {
		chrome.runtime.openOptionsPage();
	});

	if (!settings.pages.popup.dashboard) document.find('#pages li[to="dashboard"]').classList.add("hidden");
	if (!settings.pages.popup.marketSearch) document.find('#pages li[to="market"]').classList.add("hidden");
	if (!settings.pages.popup.stocksOverview) document.find('#pages li[to="stocks"]').classList.add("hidden");

	if (!api.torn.key) {
		await showPage("initialize");
	} else {
		await showPage(settings.pages.popup.defaultTab);
	}

	showLoadingPlaceholder(document.body, false);
	document.body.classList.remove("loading");
})();

async function showPage(name) {
	document.find(`#${name}`).classList.add("active");

	for (const active of document.findAll("body > main.subpage.active, #pages li.active")) active.classList.remove("active");

	if (document.find(`#pages li[to="${name}"]`)) document.find(`#pages li[to="${name}"]`).classList.add("active");
	document.find(`#${name}`).classList.add("active");

	if ((name in SETUP_PAGES && !(name in initiatedPages)) || !initiatedPages[name]) {
		await SETUP_PAGES[name]();
		initiatedPages[name] = true;
	}
	if (name in LOAD_PAGES) {
		await LOAD_PAGES[name]();
	}
}

async function setupInitialize() {
	document.find("#pages").classList.add("hidden");

	document.find("#set_api_key").addEventListener("click", () => {
		const key = document.find("#api_key").value;

		changeAPIKey(key)
			.then(async () => {
				document.find("#pages").classList.remove("hidden");

				await showPage(settings.pages.popup.defaultTab);
			})
			.catch((error) => {
				document.find(".error").classList.remove("hidden");
				document.find(".error").innerText = error.error;
			});
	});

	document.find("#api_quicklink").addEventListener("click", () => {
		chrome.tabs.update({
			url: "https://www.torn.com/preferences.php#tab=api",
		});
	});
}

async function setupDashboard() {
	const dashboard = document.find("#dashboard");

	dashboard.find("#mute-notifications").classList.add(settings.notifications.types.global ? "enabled" : "disabled");
	dashboard.find("#mute-notifications i").classList.add(settings.notifications.types.global ? "fa-bell" : "fa-bell-slash");
	dashboard.find("#mute-notifications span").innerText = settings.notifications.types.global ? "Notifications enabled" : "Notifications disabled";
	dashboard.find("#mute-notifications").addEventListener("click", () => {
		const newStatus = !settings.notifications.types.global;

		ttStorage.change({ settings: { notifications: { types: { global: newStatus } } } });

		if (newStatus) {
			dashboard.find("#mute-notifications").classList.add("enabled");
			dashboard.find("#mute-notifications").classList.remove("disabled");
			dashboard.find("#mute-notifications i").classList.add("fa-bell");
			dashboard.find("#mute-notifications i").classList.remove("fa-bell-slash");
			dashboard.find("#mute-notifications span").innerText = "Notifications enabled";
		} else {
			dashboard.find("#mute-notifications").classList.remove("enabled");
			dashboard.find("#mute-notifications").classList.add("disabled");
			dashboard.find("#mute-notifications i").classList.remove("fa-bell");
			dashboard.find("#mute-notifications i").classList.add("fa-bell-slash");
			dashboard.find("#mute-notifications span").innerText = "Notifications disabled";
		}
	});

	updateDashboard();
	storageListeners.userdata.push(updateDashboard);
	updateStakeouts();
	storageListeners.stakeouts.push(updateStakeouts);

	setInterval(() => {
		if (settings.apiUsage.user.bars)
			for (const bar of dashboard.findAll(".bar")) {
				updateBarTimer(bar);
			}
		if (settings.apiUsage.user.cooldowns)
			for (const cooldown of dashboard.findAll(".cooldowns .cooldown")) {
				updateCooldownTimer(cooldown);
			}
		updateUpdateTimer();
		updateStatusTimer();

		for (const countdown of document.findAll(".countdown.automatic[data-seconds]")) {
			const seconds = parseInt(countdown.dataset.seconds) - 1;

			if (seconds <= 0) {
				countdown.innerText = countdown.dataset.doneText || "Ready";
				// delete countdown.dataset.seconds;
				continue;
			}

			countdown.innerText = formatTime({ seconds }, JSON.parse(countdown.dataset.timeSettings));
			countdown.dataset.seconds = seconds;
		}
	}, 1000);

	dashboard.find(".stakeouts .heading a").href = `${chrome.extension.getURL("pages/targets/targets.html")}?page=stakeouts`;
	dashboard.find(".stakeouts .heading i").addEventListener("click", () => {
		const stakeoutSection = dashboard.find(".stakeouts .stakeout-list");

		if (stakeoutSection.classList.contains("hidden")) {
			stakeoutSection.classList.remove("hidden");
			dashboard.find(".stakeouts .heading i").classList.add("fa-caret-down");
			dashboard.find(".stakeouts .heading i").classList.remove("fa-caret-right");
		} else {
			stakeoutSection.classList.add("hidden");
			dashboard.find(".stakeouts .heading i").classList.remove("fa-caret-down");
			dashboard.find(".stakeouts .heading i").classList.add("fa-caret-right");
		}
	});

	function updateDashboard() {
		// Country and status
		if (settings.apiUsage.user.travel) updateStatus();
		// Bars
		if (settings.apiUsage.user.bars)
			for (const bar of ["energy", "nerve", "happy", "life", "chain"]) {
				updateBar(bar, userdata[bar]);
			}
		if (settings.apiUsage.user.travel) updateTravelBar();
		// Cooldowns
		if (settings.apiUsage.user.cooldowns)
			for (const cooldown of ["drug", "booster", "medical"]) {
				updateCooldown(cooldown, userdata.cooldowns[cooldown]);
			}
		// Extra information
		updateExtra();
		updateActions();
		setupStakeouts();

		function updateStatus() {
			if (userdata.travel.time_left) {
				dashboard.find("#country").innerText = `Traveling to ${userdata.travel.destination}`;
				dashboard.find(".status-wrap").classList.add("hidden");
			} else {
				dashboard.find("#country").innerText = userdata.travel.destination;

				const status = userdata.status.state === "abroad" ? "okay" : userdata.status.state.toLowerCase();

				dashboard.find("#status").innerText = capitalizeText(status);
				dashboard.find("#status").setAttribute("class", status);
				dashboard.find(".status-wrap").classList.remove("hidden");

				if (userdata.status.until) {
					dashboard.find("#status").dataset.until = userdata.status.until * 1000;
				} else delete dashboard.find("#status").dataset.until;

				updateStatusTimer();
			}
		}

		function updateBar(name, bar) {
			const current = bar ? bar.current : 0;
			let maximum = bar ? bar.maximum : 100;
			let tickAt = (userdata.server_time + (bar ? bar.ticktime : 0)) * 1000;
			let fullAt = (userdata.server_time + bar.fulltime) * 1000;

			if (current === maximum) fullAt = "full";
			else if (current > maximum) fullAt = "over";

			if (name === "chain") {
				if (current === 0) {
					dashboard.find(`#${name}`).classList.add("hidden");
					return;
				}
				dashboard.find(`#${name}`).classList.remove("hidden");

				if (current !== maximum) maximum = getNextChainBonus(current);
				if (bar.cooldown !== 0) {
					dashboard.find(`#${name}`).classList.add("cooldown");
					fullAt = (userdata.server_time + bar.cooldown) * 1000;
					tickAt = (userdata.server_time + bar.cooldown) * 1000;
				} else {
					dashboard.find(`#${name}`).classList.remove("cooldown");
					fullAt = (userdata.server_time + bar.timeout) * 1000;
					tickAt = (userdata.server_time + bar.timeout) * 1000;
				}
			}

			dashboard.find(`#${name} .progress .value`).style.width = `${(current / maximum) * 100}%`;
			dashboard.find(`#${name} .bar-info .bar-label`).innerText = `${current}/${maximum}`;

			dashboard.find(`#${name} .bar-info`).dataset.full_at = fullAt;
			dashboard.find(`#${name} .bar-info`).dataset.tick_at = tickAt;
			if (bar.interval) {
				dashboard.find(`#${name} .bar-info`).dataset.tick_time = bar.interval * 1000;
			}

			updateBarTimer(dashboard.find(`#${name}`));
		}

		function updateTravelBar() {
			if (!userdata.travel.time_left) {
				dashboard.find("#traveling").classList.add("hidden");
				return;
			}
			dashboard.find("#traveling").classList.remove("hidden");

			const maximum = userdata.travel.timestamp - userdata.travel.departed;
			const current = maximum - userdata.travel.time_left;

			dashboard.find("#traveling .progress .value").style.width = `${(current / maximum) * 100}%`;
			dashboard.find("#traveling .bar-info .bar-label").innerText = formatTime(userdata.travel.timestamp * 1000);

			dashboard.find("#traveling .bar-info").dataset.tick_at = userdata.travel.timestamp * 1000;
			dashboard.find("#traveling .bar-info").dataset.full_at = userdata.travel.timestamp * 1000;

			updateBarTimer(dashboard.find("#traveling"));
		}

		function updateCooldown(name, cooldown) {
			dashboard.find(`#${name}-cooldown`).dataset.completed_at = userdata.timestamp && cooldown ? (userdata.timestamp + cooldown) * 1000 : 0;

			updateCooldownTimer(dashboard.find(`#${name}-cooldown`));
		}

		function updateExtra() {
			if (settings.apiUsage.user.events)
				dashboard.find(".extra .events .count").innerText = Object.values(userdata.events).filter((event) => !event.seen).length;
			if (settings.apiUsage.user.messages)
				dashboard.find(".extra .messages .count").innerText = Object.values(userdata.messages).filter((message) => !message.seen).length;
			if (settings.apiUsage.user.money) dashboard.find(".extra .wallet .count").innerText = `$${formatNumber(userdata.money_onhand)}`;
		}

		function updateActions() {
			dashboard.find("#last-update").dataset.updated_at = userdata.date;

			updateUpdateTimer();
		}

		function setupStakeouts() {
			if (settings.pages.popup.showStakeouts && Object.keys(stakeouts).length && !(Object.keys(stakeouts).length === 1 && stakeouts.date))
				dashboard.find(".stakeouts").classList.remove("hidden");
			else dashboard.find(".stakeouts").classList.add("hidden");
		}
	}

	function updateStatusTimer() {
		const current = Date.now();
		const status = dashboard.find("#status");
		if (!status.dataset.until) return;

		if (status.classList.contains("jail")) {
			status.innerText = `Jailed for ${formatTime({ milliseconds: status.dataset.until - current }, { type: "timer" })}`;
		} else if (status.classList.contains("hospital")) {
			status.innerText = `Hospitalized for ${formatTime({ milliseconds: status.dataset.until - current }, { type: "timer" })}`;
		}
	}

	function updateBarTimer(bar) {
		const name = bar.id;
		const current = Date.now();

		const barInfo = bar.find(".bar-info");
		const dataset = barInfo.dataset;

		let full_at = parseInt(dataset.full_at) || dataset.full_at;
		let tick_at = parseInt(dataset.tick_at);
		if (full_at <= current) full_at = "full";

		if (tick_at <= current) {
			if (name === "traveling" || name === "chain") tick_at = current;
			else tick_at += parseInt(dataset.tick_time);
		}

		let full;
		if (full_at === "full" || full_at === "over") full = "FULL";
		else if (name === "chain" || (name === "happy" && full_at === "over"))
			full = `${formatTime({ seconds: toSeconds(full_at - current) }, { type: "timer", hideHours: true })}`;
		else if (name === "traveling") full = `Landing in ${formatTime({ seconds: toSeconds(full_at - current) }, { type: "timer" })}`;
		else {
			full = `Full in ${formatTime({ seconds: toSeconds(full_at - current) }, { type: "timer" })}`;

			if (settings.pages.popup.hoverBarTime) full += ` (${formatTime({ milliseconds: full_at }, { type: "normal" })})`;
		}

		let tick;
		if (name === "traveling") tick = formatTime({ seconds: toSeconds(tick_at - current) }, { type: "timer" });
		else tick = formatTime({ seconds: toSeconds(tick_at - current) }, { type: "timer", hideHours: true });

		if (name === "happy") {
			if (full_at === "over") {
				full = `Resets in ${full}`;
				barInfo.classList.add("reset-timer");
			} else {
				barInfo.classList.remove("reset-timer");
			}
		} else if (name === "chain") {
			if (bar.classList.contains("cooldown")) full = `Cooldown over in ${full}`;
		}

		dataset.full = full;
		dataset.tick = tick;
	}

	function updateCooldownTimer(cooldown) {
		const dataset = cooldown.dataset;
		const current = Date.now();

		const completed_at = !isNaN(parseInt(dataset.completed_at)) ? parseInt(dataset.completed_at) : false;

		cooldown.find(".cooldown-label").innerText = formatTime({ milliseconds: completed_at ? completed_at - current : 0 }, { type: "timer" });

		if (completed_at) {
			cooldown.find(".cooldown-label").innerText = formatTime({ milliseconds: completed_at - current }, { type: "timer", daysToHours: true });
		} else {
			cooldown.find(".cooldown-label").innerText = formatTime({ milliseconds: 0 }, { type: "timer", daysToHours: true });
		}
	}

	function updateUpdateTimer() {
		Date.now();
		const updatedAt = parseInt(dashboard.find("#last-update").dataset.updated_at);

		dashboard.find("#last-update").innerText = formatTime({ milliseconds: updatedAt }, { type: "ago", agoFilter: TO_MILLIS.SECONDS });
	}

	function updateStakeouts() {
		if (settings.pages.popup.showStakeouts && Object.keys(stakeouts).length && !(Object.keys(stakeouts).length === 1 && stakeouts.date)) {
			dashboard.find(".stakeouts").classList.remove("hidden");

			const stakeoutList = dashboard.find(".stakeouts .stakeout-list");
			stakeoutList.innerHTML = "";

			for (const id in stakeouts) {
				if (isNaN(parseInt(id))) continue;

				let activity, name, lastAction, lifeCurrent, lifeMaximum, state, stateColor, stateTimer;

				if (stakeouts[id].info && Object.keys(stakeouts[id].info).length) {
					activity = stakeouts[id].info.last_action.status;
					name = stakeouts[id].info.name;
					lastAction = stakeouts[id].info.last_action.relative;
					lifeCurrent = stakeouts[id].info.life.current;
					lifeMaximum = stakeouts[id].info.life.maximum;
					state = stakeouts[id].info.status.state;
					stateColor = stakeouts[id].info.status.color;
					stateTimer = stakeouts[id].info.status.until;
				} else {
					activity = "N/A";
					name = id;
					lastAction = "N/A";
					lifeCurrent = 0;
					lifeMaximum = 100;
					state = "Unknown";
					stateColor = "gray";
					stateTimer = 0;
				}

				const removeStakeoutButton = document.newElement({
					type: "div",
					class: "delete-stakeout-wrap",
					children: [document.newElement({ type: "i", class: "delete-stakeout fas fa-trash-alt" })],
				});
				removeStakeoutButton.addEventListener("click", () => {
					delete stakeouts[id];

					ttStorage.set({ stakeouts });
				});

				const lifeBar = document.newElement({
					type: "div",
					children: [
						document.newElement({ type: "span", text: "Life: " }),
						document.newElement({
							type: "div",
							class: "progress",
							children: [
								document.newElement({
									type: "div",
									class: "value",
									style: { width: `${((lifeCurrent / lifeMaximum) * 100).toFixed(0)}%` },
								}),
							],
						}),
					],
				});
				const current = Date.now();

				stakeoutList.appendChild(
					document.newElement({
						type: "div",
						class: "user",
						children: [
							document.newElement({
								type: "div",
								class: "row information",
								children: [
									document.newElement({
										type: "div",
										class: "activity",
										html: `
											<span class="status ${activity.toLowerCase()}"></span>
											<a href="https://www.torn.com/profiles.php?XID=${id}" target="_blank">${name}</a>
										`,
									}),
									removeStakeoutButton,
								],
							}),
							document.newElement({
								type: "div",
								class: "row detailed",
								children: [lifeBar, document.newElement({ type: "span", class: "lastAction", text: `Last action: ${lastAction}` })],
							}),
							buildState(),
						],
					})
				);

				function buildState() {
					const row = document.newElement({
						type: "div",
						class: `row state ${stateColor}`,
						children: [document.newElement({ type: "span", class: `state `, text: state })],
					});

					if (stateTimer > 0) {
						console.log("DKK state", { stateTimer, current });
						row.appendChild(document.newElement({ type: "span", class: "duration", text: "for" }));
						row.appendChild(
							document.newElement({
								type: "span",
								class: "duration countdown automatic",
								text: formatTime({ seconds: (stateTimer - current) / 1000 }, { type: "wordTimer", extraShort: true, showDays: true }),
								dataset: {
									seconds: (stateTimer - current) / 1000,
									timeSettings: JSON.stringify({ type: "wordTimer", extraShort: true, showDays: true }),
								},
							})
						);
					}

					return row;
				}
			}
		} else dashboard.find(".stakeouts").classList.add("hidden");
	}
}

async function setupMarketSearch() {
	// setup itemlist
	const itemSelection = document.find("#market .item-list");

	for (const id in torndata.items) {
		const name = torndata.items[id].name;

		const div = document.newElement({ type: "li", class: "item", id: name.toLowerCase().replace(/\s+/g, "").replace(":", "_"), text: name });

		itemSelection.appendChild(div);

		// display item if clicked on it
		div.addEventListener("click", async () => {
			itemSelection.classList.add("hidden");

			showMarketInfo(id);
		});
	}

	// setup searchbar
	document.find("#market #search-bar").addEventListener("keyup", (event) => {
		const keyword = event.target.value.toLowerCase();

		if (!keyword) {
			itemSelection.classList.add("hidden");
			return;
		}

		for (const item of document.findAll("#market .item-list li")) {
			if (item.textContent.toLowerCase().includes(keyword)) {
				item.classList.remove("hidden");
				itemSelection.classList.remove("hidden");
			} else {
				item.classList.add("hidden");
			}
		}
	});
	document.find("#market #search-bar").addEventListener("click", (event) => {
		event.target.value = "";

		document.find("#market .item-list").classList.add("hidden");
		document.find("#market #item-information").classList.add("hidden");
	});

	function showMarketInfo(id) {
		const viewItem = document.find("#market #item-information");
		viewItem.find(".market").classList.add("hidden");

		fetchApi("torn", { section: "market", id, selections: ["bazaar", "itemmarket"] })
			.then((result) => {
				const list = viewItem.find(".market");
				list.innerHTML = "";

				let found = false;

				for (const type of Object.keys(result)) {
					let text;
					if (type === "itemmarket") text = "Item Market";
					else text = capitalizeText(type);

					const wrap = document.newElement({ type: "div" });

					wrap.appendChild(document.newElement({ type: "h4", text }));

					if (result[type]) {
						found = true;

						for (const item of result[type].slice(0, 3)) {
							wrap.appendChild(
								document.newElement({
									type: "div",
									class: "price",
									text: `${item.quantity}x | $${formatNumber(item.cost)}`,
								})
							);
						}
					} else {
						wrap.appendChild(
							document.newElement({
								type: "div",
								class: "price no-price",
								text: "No price found.",
							})
						);
					}

					list.appendChild(wrap);
				}

				if (!isSellable(id) && !found) {
					list.classList.add("untradable");
					list.innerHTML = "Item is not sellable!";
				}
				viewItem.find(".market").classList.remove("hidden");
			})
			.catch((error) => {
				document.find(".error").classList.remove("hidden");
				document.find(".error").innerText = error.error;
			});

		const item = torndata.items[id];
		viewItem.find(".circulation").innerText = formatNumber(item.circulation);
		viewItem.find(".value").innerText = `$${formatNumber(item.market_value)}`;
		viewItem.find(".name").innerText = item.name;
		viewItem.find(".name").href = `https://www.torn.com/imarket.php#/p=shop&step=shop&type=&searchname=${item.name}`;
		viewItem.find(".image").src = item.image;

		viewItem.classList.remove("hidden");
	}
}

async function loadMarketSearch() {
	document.find("#market #search-bar").focus();
}

async function setupStocksOverview() {
	const stocksOverview = document.find("#stocks");
	const userStocks = stocksOverview.find("#user-stocks");
	const allStocks = stocksOverview.find("#all-stocks");

	if (settings.apiUsage.user.stocks) {
		for (const buyId in userdata.stocks) {
			const stock = userdata.stocks[buyId];
			const id = stock.stock_id;

			const transactions = Object.entries(stock.transactions).map(([, value]) => value);
			const totalPrice = transactions.reduce((price, { shares, bought_price }) => price + shares * bought_price, 0);

			const boughtPrice = totalPrice / stock.total_shares;
			const profit = ((torndata.stocks[id].current_price - boughtPrice) * stock.total_shares).dropDecimals();

			const wrapper = document.newElement({ type: "div", class: "stock-wrap" });
			wrapper.appendChild(document.newElement("hr"));

			// Heading
			wrapper.appendChild(
				document.newElement({
					type: "a",
					class: "heading",
					href: `https://www.torn.com/stockexchange.php?stock=${torndata.stocks[id].acronym}`,
					attributes: { target: "_blank" },
					children: [
						document.newElement({
							type: "span",
							class: "name",
							text: `${torndata.stocks[id][torndata.stocks[id].name.length > 35 ? "acronym" : "name"]}`,
						}),
						document.newElement("br"),
						document.newElement({
							type: "span",
							class: "quantity",
							text: `(${formatNumber(stock.total_shares, { shorten: 2 })} share${applyPlural(stock.total_shares)})`,
						}),
					],
				})
			);
			wrapper.appendChild(
				document.newElement({
					type: "div",
					class: `profit ${getProfitClass(profit)}`,
					text: `${getProfitIndicator(profit)}$${formatNumber(Math.abs(profit))}`,
				})
			);

			// Price Information
			const priceContent = document.newElement({
				type: "div",
				class: "content price hidden",
				children: [
					document.newElement({
						type: "span",
						text: `Current price: $${formatNumber(torndata.stocks[id].current_price, { decimals: 3 })}`,
					}),
					document.newElement({
						type: "span",
						text: `Bought at: $${formatNumber(boughtPrice, { decimals: 3 })}`,
					}),
				],
			});

			wrapper.appendChild(
				document.newElement({
					type: "div",
					class: "information-section",
					children: [getPriceHeadingElement(priceContent), priceContent],
				})
			);

			// Benefit Information
			if (torndata.stocks[id].benefit) {
				const benefitContent = document.newElement({
					type: "div",
					class: "content benefit hidden",
					children: [
						document.newElement({
							type: "span",
							text: `Required stocks: ${formatNumber(stock.total_shares)}/${formatNumber(torndata.stocks[id].benefit.requirement)}`,
						}),
						document.newElement("br"),
						document.newElement({
							type: "span",
							class: `description ${stock.total_shares >= torndata.stocks[id].benefit.requirement ? "completed" : "not-completed"}`,
							text: `${torndata.stocks[id].benefit.description}.`,
						}),
					],
				});

				wrapper.appendChild(
					document.newElement({
						type: "div",
						class: "information-section",
						children: [getBenefitHeadingElement(benefitContent), benefitContent],
					})
				);
			}

			// Alerts
			if (id !== "0") addAlertsSection(wrapper, id, buyId);

			userStocks.appendChild(wrapper);
		}
	}

	for (let id in torndata.stocks) {
		if (id === "date") continue;
		id = parseInt(id);

		const wrapper = document.newElement({
			type: "div",
			class: "stock-wrap",
			attributes: { name: `${torndata.stocks[id].name} (${torndata.stocks[id].acronym})`.toLowerCase() },
		});
		wrapper.appendChild(document.newElement("hr"));

		// Heading
		wrapper.appendChild(
			document.newElement({
				type: "a",
				class: "heading",
				href: `https://www.torn.com/stockexchange.php?stock=${torndata.stocks[id].acronym}`,
				attributes: { target: "_blank" },
				children: [document.newElement({ type: "span", class: "name", text: torndata.stocks[id].name })],
			})
		);

		// Price Information
		const priceContent = document.newElement({
			type: "div",
			class: "content price hidden",
			children: [
				document.newElement({
					type: "span",
					text: `Current price: $${formatNumber(torndata.stocks[id].current_price, { decimals: 3 })}`,
				}),
			],
		});

		wrapper.appendChild(document.newElement({ type: "div", class: "information-section", children: [getPriceHeadingElement(priceContent), priceContent] }));

		// Benefit Information
		if (torndata.stocks[id].benefit) {
			console.log("DKK stock", isDividendStock(id), id, typeof id);
			const benefitContent = document.newElement({
				type: "div",
				class: "content benefit hidden",
				children: [
					document.newElement({ type: "span", text: `Stocks per increment: ${formatNumber(torndata.stocks[id].benefit.requirement)}` }),
					document.newElement("br"),
					document.newElement({ type: "span", class: "description", text: `${torndata.stocks[id].benefit.description}` }),
					document.newElement({
						type: "span",
						class: "duration",
						text: `${isDividendStock(id) ? "every" : "after"} ${torndata.stocks[id].benefit.frequency} days.`,
					}),
				],
			});

			wrapper.appendChild(
				document.newElement({
					type: "div",
					class: "information-section",
					children: [getBenefitHeadingElement(benefitContent), benefitContent],
				})
			);
		}

		// Alerts
		addAlertsSection(wrapper, id, id);

		allStocks.appendChild(wrapper);
	}

	// setup searchbar
	stocksOverview.find("#stock-search-bar").addEventListener("keyup", (event) => {
		const keyword = event.target.value.toLowerCase();

		if (!keyword) {
			userStocks.classList.remove("hidden");
			allStocks.classList.add("hidden");
			return;
		}

		for (const item of allStocks.findAll(".stock-wrap")) {
			if (item.getAttribute("name").includes(keyword) || keyword === "*") {
				item.classList.remove("hidden");
			} else {
				item.classList.add("hidden");
			}
		}

		userStocks.classList.add("hidden");
		allStocks.classList.remove("hidden");
	});
	stocksOverview.find("#stock-search-bar").addEventListener("click", (event) => {
		event.target.value = "";

		userStocks.classList.remove("hidden");
		allStocks.classList.add("hidden");
	});

	function getProfitClass(profit) {
		return profit > 0 ? "positive" : profit < 0 ? "negative" : "";
	}

	function getProfitIndicator(profit) {
		return profit > 0 ? "+" : profit < 0 ? "-" : "";
	}

	function addAlertsSection(wrapper, id, stockId) {
		const alertContent = document.newElement({
			type: "div",
			class: "content alerts hidden",
			children: [
				document.newElement({
					type: "div",
					children: [
						document.newElement({ type: "span", class: "title", text: "Price" }),
						document.newElement({
							type: "div",
							children: [
								document.newElement({ type: "label", attributes: { for: `stock-${stockId}-alert__reaches` }, text: "reaches" }),
								document.newElement({
									type: "input",
									id: `stock-${stockId}-alert__reaches`,
									attributes: { type: "number", min: 0 },
									value: () => {
										if (!(id in settings.notifications.types.stocks)) return "";

										return settings.notifications.types.stocks[id].priceReaches || "";
									},
									events: {
										change: async (event) => {
											await ttStorage.change({
												settings: {
													notifications: { types: { stocks: { [id]: { priceReaches: parseFloat(event.target.value) } } } },
												},
											});
										},
									},
								}),
							],
						}),
						document.newElement({
							type: "div",
							children: [
								document.newElement({ type: "label", attributes: { for: `stock-${stockId}-alert__falls` }, text: "falls to" }),
								document.newElement({
									type: "input",
									id: `stock-${stockId}-alert__falls`,
									attributes: { type: "number", min: 0 },
									value: () => {
										if (!(id in settings.notifications.types.stocks)) return "";

										return settings.notifications.types.stocks[id].priceFalls || "";
									},
									events: {
										change: async (event) => {
											await ttStorage.change({
												settings: {
													notifications: { types: { stocks: { [id]: { priceFalls: parseFloat(event.target.value) } } } },
												},
											});
										},
									},
								}),
							],
						}),
					],
				}),
			],
		});
		const alertHeading = document.newElement({
			type: "div",
			class: "heading",
			children: [
				document.newElement({ type: "span", class: "title", text: "Alerts" }),
				document.newElement({
					type: "i",
					class: "fas fa-chevron-down",
				}),
			],
			events: {
				click: (event) => {
					alertContent.classList[alertContent.classList.contains("hidden") ? "remove" : "add"]("hidden");

					rotateElement((event.target.classList.contains("heading") ? event.target : event.target.parentElement).find("i"), 180);
				},
			},
		});

		wrapper.appendChild(document.newElement({ type: "div", class: "information-section", children: [alertHeading, alertContent] }));
	}

	function getPriceHeadingElement(priceContent) {
		return document.newElement({
			type: "div",
			class: "heading",
			children: [
				document.newElement({ type: "span", class: "title", text: "Price Information" }),
				document.newElement({ type: "i", class: "fas fa-chevron-down" }),
			],
			events: {
				click: (event) => {
					priceContent.classList[priceContent.classList.contains("hidden") ? "remove" : "add"]("hidden");

					rotateElement((event.target.classList.contains("heading") ? event.target : event.target.parentElement).find("i"), 180);
				},
			},
		});
	}

	function getBenefitHeadingElement(benefitContent) {
		return document.newElement({
			type: "div",
			class: "heading",
			children: [
				document.newElement({ type: "span", class: "title", text: "Benefit Information" }),
				document.newElement({
					type: "i",
					class: "fas fa-chevron-down",
				}),
			],
			events: {
				click: (event) => {
					benefitContent.classList[benefitContent.classList.contains("hidden") ? "remove" : "add"]("hidden");

					rotateElement((event.target.classList.contains("heading") ? event.target : event.target.parentElement).find("i"), 180);
				},
			},
		});
	}
}
