"use strict";

let networthInterval = false;

(async () => {
	if (isFlying() || isAbroad()) return;

	await loadDatabase();
	console.log("TT: Home - Loading script. ");

	let homeFeatures = new HomeFeatures();
	homeFeatures.init();

	storageListeners.settings.push(function () {
		homeFeatures.init();
	});
	storageListeners.userdata.push(async (oldUserdata) => {
		if (oldUserdata.networth && userdata.networth && oldUserdata.networth.date !== userdata.networth.date) {
			featureManager.reload("Live Networth");
		}
	});

	console.log("TT: Home - Script loaded.");
})();

class HomeFeatures {
	constructor() {}

	init() {
		requireContent().then(async () => {
			this.liveNetworth();
			this.effectiveBattleStats();

			this.load();
		});
	}
	load() {
		featureManager.load("Live Networth");
		featureManager.load("Effective Battle Stats");
	}

	liveNetworth() {
		featureManager.new({
			name: "Live Networth",
			scope: "home",
			enabled: !!(settings.apiUsage.user.networth && settings.pages.home.networthDetails && hasAPIData()),
			func: feature,
			runWhenDisabled: true,
		});

		async function feature() {
			if (networthInterval) {
				clearInterval(networthInterval);
				networthInterval = false;
			}

			if (settings.apiUsage.user.networth && settings.pages.home.networthDetails && hasAPIData()) {
				const { content } = createContainer("Live Networth", {
					collapsible: false,
					showHeader: false,
					applyRounding: false,
					parentElement: document.find("h5=General Information").parentElement.nextElementSibling.find("ul.info-cont-wrap"),
				});

				if (!userdata.networth || Date.now() - userdata.networth.date >= TO_MILLIS.MINUTES * 5) {
					chrome.runtime.sendMessage({ action: "updateData", type: "networth" });
					return;
				}

				if (settings.apiUsage.user.networth && settings.pages.home.networthDetails && hasAPIData()) {
					const { content } = createContainer("Live Networth", {
						collapsible: false,
						showHeader: false,
						parentElement: document.find("h5=General Information").parentElement.nextElementSibling.find("ul.info-cont-wrap"),
					});

					if (!userdata.networth || Date.now() - userdata.networth.date >= TO_MILLIS.MINUTES * 5) {
						chrome.runtime.sendMessage({ action: "updateData", type: "networth" });
						return;
					}

					let networthRow = newRow("(Live) Networth", `$${formatNumber(userdata.networth.total)}`);
					networthRow.style.backgroundColor = "#65c90069";

					// Networth last updated info icon
					let infoIcon = document.newElement({
						type: "i",
						class: "networth-info-icon",
						attributes: {
							seconds: (Date.now() - userdata.networth.date) / 1000,
							title: "Last updated " + formatTime({ milliseconds: userdata.networth.date }, { type: "ago" }),
							style: "margin-left: 9px;",
						},
					});
					networthRow.find(".desc").appendChild(infoIcon);
					content.appendChild(networthRow);

					// Update 'last updated'
					networthInterval = setInterval(() => {
						let seconds = parseInt(infoIcon.getAttribute("seconds")) + 1;

						infoIcon.setAttribute("title", `Last updated: ${formatTime({ milliseconds: Date.now() - seconds * 1000 }, { type: "ago" })}`);
						infoIcon.setAttribute("seconds", seconds);
					}, 1000);

					const table = document.newElement({
						type: "table",
						class: "tt-networth-comparison",
						children: [
							document.newElement({
								type: "tr",
								children: ["Type", "Value", "Change"].map((value) => document.newElement({ type: "th", text: value })),
							}),
						],
					});

					for (let type of [
						"Cash (Wallet and Vault)",
						"Points",
						"Items",
						"Bazaar",
						"Display Case",
						"Bank",
						"Trade",
						"Piggy Bank",
						"Stock Market",
						"Company",
						"Bookie",
						"Auction House",
						"Cayman",
						"Total",
					]) {
						let current, previous;

						let name = type.toLowerCase().replaceAll(" ", "");
						if (type === "Trade") name = "pending";

						if (type.includes("Cash")) {
							current = userdata.networth.wallet + userdata.networth.vault;
							previous = userdata.personalstats.networthwallet + userdata.personalstats.networthvault;
						} else if (type === "Total") {
							current = userdata.networth.total;
							previous = userdata.personalstats.networth;
						} else {
							current = userdata.networth[name];
							previous = userdata.personalstats[`networth` + name];
						}
						if (current === previous) continue;

						const isPositive = current > previous;

						table.appendChild(
							document.newElement({
								type: "tr",
								children: [
									document.newElement({ type: "td", text: type }),
									document.newElement({ type: "td", text: `$${formatNumber(current, { shorten: true })}` }),
									document.newElement({
										type: "td",
										text: `${isPositive ? "+" : "-"}$${formatNumber(Math.abs(current - previous), { shorten: true })}`,
										class: isPositive ? "positive" : "negative",
									}),
								],
							})
						);
					}

					content.appendChild(
						document.newElement({
							type: "li",
							class: "comparison",
							children: [
								table,
								document.newElement({
									type: "div",
									class: "tt-networth-footer",
									text: "Networth change compared to Torn's last known Networth",
								}),
							],
						})
					);

					function newRow(name, value) {
						return document.newElement({
							type: "li",
							children: [
								document.newElement({
									type: "div",
									class: "divider",
									children: [document.newElement({ type: "span", text: name, style: { backgroundColor: "transparent" } })],
								}),
								document.newElement({
									type: "div",
									class: "desc",
									children: [document.newElement({ type: "span", text: value, style: { paddingLeft: "3px" } })],
								}),
							],
						});
					}
				} else {
					removeContainer("Live Networth");
				}
			} else {
				removeContainer("Live Networth");
			}
		}
	}
	effectiveBattleStats() {
		featureManager.new({
			name: "Effective Battle Stats",
			scope: "home",
			enabled: settings.pages.home.effectiveStats,
			func: feature,
			runWhenDisabled: true,
		});

		async function feature() {
			if (settings.pages.home.effectiveStats) {
				const statsContainer = document.find("h5=Battle Stats").parentElement.nextElementSibling.find("ul.info-cont-wrap");
				const { content } = createContainer("Effective Battle Stats", { collapsible: false, applyRounding: false, parentElement: statsContainer });

				let effectiveTotal = 0;
				const stats = ["Strength", "Defense", "Speed", "Dexterity"];
				for (let i = 0; i < stats.length; i++) {
					const base = parseInt(statsContainer.find(`li:nth-child(${i + 1}) .desc`).innerText.replace(/,/g, ""));
					let modifier = statsContainer.find(`li:nth-child(${i + 1}) .mod`).innerText;
					if (modifier.charAt(0) === "+") modifier = modifier = parseInt(modifier.slice(1, -1)) / 100 + 1;
					else modifier = modifier = 1 - parseInt(modifier.slice(1, -1)) / 100;
					const effective = (base * modifier).dropDecimals();

					effectiveTotal += effective;
					content.appendChild(await newRow(stats[i], formatNumber(effective)));
				}

				content.appendChild(await newRow("Total", formatNumber(effectiveTotal, false)));

				async function newRow(name, value) {
					return document.newElement({
						type: "li",
						children: [
							document.newElement({
								type: "div",
								class: "divider",
								children: [document.newElement({ type: "span", text: name, style: { backgroundColor: "transparent" } })],
							}),
							document.newElement({
								type: "div",
								class: "desc",
								style: { width: (await checkMobile()) ? "180px" : "184px" },
								children: [document.newElement({ type: "span", text: value, style: { paddingLeft: "3px" } })],
							}),
						],
					});
				}
			} else {
				removeContainer("Effective Battle Stats");
			}
		}
	}
}
