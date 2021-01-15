"use strict";

let pendingActions = {};

(async () => {
	await loadDatabase();
	console.log("TT: Items - Loading script. ");

	let itemsFeatures = new ItemsFeatures();
	itemsFeatures.init();

	storageListeners.settings.push(function () {
		itemsFeatures.init();
		featureManager.display(settings.featureDisplay);
	});

	itemsFeatures.loadItemsOnce();

	console.log("TT: Items - Script loaded.");
})();

class ItemsFeatures {
	constructor() {}

	init() {
		requireContent().then(() => {
			this.quickItems();

			featureManager.load("Quick Items");
		});
		this.requireItemsLoaded().then(() => {
			this.setupQuickDragListeners().catch((error) => console.error("Couldn't make the items draggable for quick items.", error));

			this.highlightBloodbags();
			this.itemValues();
			this.itemMarketIcons();
			this.drugDetails();

			featureManager.load("Highlight Bloodbags");
			featureManager.load("Item Values");
			featureManager.load("Item Market Icons");
			featureManager.load("Drug Details");
		});
	}

	// Page Features
	quickItems() {
		// feature function has a 'this' call in it
		let feature = async () => {
			if (settings.pages.items.quickItems) {
				const { content, options } = createContainer("Quick Items", {
					nextElement: document.find(".equipped-items-wrap"),
					spacer: true,
					allowDragging: true,
				});
				content.appendChild(document.newElement({ type: "div", class: "inner-content" }));
				content.appendChild(document.newElement({ type: "div", class: "response-wrap" }));
				options.appendChild(
					document.newElement({
						type: "div",
						class: "option",
						id: "edit-items-button",
						children: [document.newElement({ type: "i", class: "fas fa-plus" }), " Add"],
						events: {
							click: (event) => {
								event.stopPropagation();

								document.find("ul.items-cont[aria-expanded='true']").classList.toggle("tt-overlay-item");
								options.find("#edit-items-button").classList.toggle("tt-overlay-item");
								if (document.find(".tt-overlay").classList.toggle("hidden")) {
									for (let item of document.findAll("ul.items-cont[aria-expanded='true'] > li")) {
										if (!this.allowQuickItem(item.getAttribute("data-category"))) continue;

										item.removeEventListener("click", this.onItemClickQuickEdit);
									}
								} else {
									for (let item of document.findAll("ul.items-cont[aria-expanded='true'] > li")) {
										if (!this.allowQuickItem(item.getAttribute("data-category"))) continue;

										item.addEventListener("click", this.onItemClickQuickEdit);
									}
								}
							},
						},
					})
				);

				for (let id of quick.items) {
					this.addQuickItem(id, false);
				}
			} else {
				removeContainer("Quick Items");
			}
		};

		featureManager.new({
			name: "Quick Items",
			scope: "items",
			enabled: settings.pages.items.quickItems,
			func: feature,
			runWhenDisabled: true,
		});
	}
	highlightBloodbags() {
		featureManager.new({
			name: "Highlight Bloodbags",
			scope: "items",
			enabled: settings.pages.items.highlightBloodBags !== "none",
			func: feature,
			runWhenDisabled: true,
		});

		async function feature() {
			// noinspection JSIncompatibleTypesComparison
			if (settings.pages.items.highlightBloodBags !== "none") {
				const allowedBlood = ALLOWED_BLOOD[settings.pages.items.highlightBloodBags];

				for (let item of document.findAll("ul.items-cont[aria-expanded=true] > li[data-category='Medical']")) {
					if (!item.find(".name-wrap")) continue;
					item.find(".name-wrap").classList.remove("good-blood", "bad-blood");

					if (!item.getAttribute("data-sort").includes("Blood Bag : ")) continue; // is not a filled blood bag
					if (parseInt(item.getAttribute("data-item")) === 1012) continue; // is an irradiated blood bag

					item.find(".name-wrap").classList.add(allowedBlood.includes(parseInt(item.getAttribute("data-item"))) ? "good-blood" : "bad-blood");
				}
			} else {
				for (let bb of document.findAll(".good-blood, .bad-blood")) {
					bb.classList.remove("good-blood", "bad-blood");
				}
			}
		}
	}
	itemValues() {
		featureManager.new({
			name: "Item Values",
			scope: "items",
			enabled: settings.pages.items.values,
			func: feature,
			runWhenDisabled: true,
		});

		async function feature() {
			if (settings.pages.items.values && hasAPIData() && settings.apiUsage.user.inventory) {
				const list = document.find(".items-cont[aria-expanded=true]");
				const type = list.getAttribute("data-info");

				let total;
				if (type === "All") total = userdata.inventory.map((x) => x.quantity * x.market_price).reduce((a, b) => (a += b), 0);
				else
					total = userdata.inventory
						.filter((x) => x.type === type)
						.map((x) => x.quantity * x.market_price)
						.reduce((a, b) => (a += b), 0);

				for (let item of list.findAll(":scope > li[data-item]")) {
					const id = item.getAttribute("data-item");
					const price = torndata.items[id].market_value;

					const parent = mobile ? item.find(".name-wrap") : item.find(".bonuses-wrap") || item.find(".name-wrap");

					const quantity = parseInt(item.find(".item-amount.qty").innerText) || 1;
					const totalPrice = quantity * parseInt(price);

					if (parent.find(".tt-item-price")) continue;

					let priceElement;
					if (item.find(".bonuses-wrap")) {
						priceElement = document.newElement({ type: "li", class: "bonus left tt-item-price" });
					} else {
						priceElement = document.newElement({ type: "span", class: "tt-item-price" });

						if (item.find("button.group-arrow")) {
							priceElement.style.paddingRight = "30px";
						}
					}
					if (mobile) {
						priceElement.setAttribute("style", `position: absolute; right: -10px; top: 10px; float: unset !important; font-size: 11px;`);
						parent.find(".name").setAttribute("style", "position: relative; top: -3px;");
						parent.find(".qty").setAttribute("style", "position: relative; top: -3px;");
					}

					if (totalPrice) {
						if (quantity === 1) {
							priceElement.appendChild(document.newElement({ type: "span", text: `$${formatNumber(price)}` }));
						} else {
							priceElement.appendChild(document.newElement({ type: "span", text: `$${formatNumber(price)} | ` }));
							priceElement.appendChild(document.newElement({ type: "span", text: `${quantity}x = `, class: "tt-item-quantity" }));
							priceElement.appendChild(document.newElement({ type: "span", text: `$${formatNumber(totalPrice)}` }));
						}
					} else if (price === 0) {
						priceElement.innerText = `N/A`;
					} else {
						priceElement.innerText = `$${formatNumber(price)}`;
					}

					parent.appendChild(priceElement);
				}

				if (list.find(":scope > li > .tt-item-price")) list.find(":scope > li > .tt-item-price").parentElement.remove();

				list.insertBefore(
					document.newElement({
						type: "li",
						class: "tt-ignore",
						children: [
							document.newElement({
								type: "li",
								text: `Total Value: $${formatNumber(total, { decimals: 0 })}`,
								class: "tt-item-price",
							}),
						],
					}),
					list.firstElementChild
				);
			} else {
				for (const price of document.findAll(".tt-item-price, #category-wrap .tt-ignore")) {
					price.remove();
				}
			}
		}
	}
	itemMarketIcons() {
		featureManager.new({
			name: "Item Market Icons",
			scope: "items",
			enabled: settings.pages.items.marketLinks,
			func: feature,
			runWhenDisabled: true,
		});

		async function feature() {
			if (settings.pages.items.marketLinks && !(await checkMobile())) {
				// TODO - Display market links.
			} else {
			}
		}
	}
	drugDetails() {
		featureManager.new({
			name: "Drug Details",
			scope: "items",
			enabled: settings.pages.items.drugDetails,
		});
	}

	// Other content functions
	requireItemsLoaded() {
		return requireElement(".items-cont[aria-expanded=true] > li > .title-wrap");
	}
	loadItemsOnce() {
		document.addEventListener("click", (event) => {
			if (event.target.classList.contains("close-act")) {
				const responseWrap = findParent(event.target, { class: "response-wrap" });

				if (responseWrap) responseWrap.style.display = "none";
			}
		});
		setInterval(() => {
			for (let timer of document.findAll(".counter-wrap.tt-modified")) {
				let secondsLeft;
				if ("secondsLeft" in timer.dataset) secondsLeft = parseInt(timer.dataset.secondsLeft);
				else secondsLeft = parseInt(timer.dataset.time);
				secondsLeft--;

				timer.innerText = formatTime({ seconds: secondsLeft }, { type: "timer" });

				timer.dataset.secondsLeft = `${secondsLeft}`;
			}
		}, 1000);

		addXHRListener((event) => {
			const { page, json, xhr } = event.detail;

			if (page === "item" && json) {
				const params = new URLSearchParams(xhr.requestBody);
				const step = params.get("step");

				if (step === "useItem") {
					if (!json.success) return;

					if (params.get("step") !== "useItem") return;
					if (params.has("fac") && params.get("fac") !== "0") return;

					if (json.items) {
						for (const item of json.items.itemAppear) {
							this.updateItemAmount(parseInt(item.ID), parseInt(item.qty));
						}
						for (const item of json.items.itemDisappear) {
							this.updateItemAmount(parseInt(item.ID), -parseInt(item.qty));
						}
					} else {
						this.updateItemAmount(parseInt(params.get("itemID")), -1);
					}
				} else if (step === "sendItemAction") {
					if (!json.success) return;

					const actionId = json.confirm ? json.itemID : params.get("XID");
					const item = json.confirm ? params.get("itemID") : pendingActions[actionId].item;
					const amount = json.amount;

					if (json.confirm) pendingActions[actionId] = { item };
					else {
						delete pendingActions[actionId];

						this.updateItemAmount(item, -amount);
					}
				} else if (step === "getCategoryList" || step === "getNotAllItemsListWithoutGroups" || step === "getItemsListByItemId") {
					const tab = document.find("ul.items-cont.tab-menu-cont[style='display: block;'], ul.items-cont.tab-menu-cont:not([style])");
					if (!tab) return;

					new MutationObserver((mutations, observer) => {
						if (document.find("li.ajax-item-loader")) return;

						this.init();
						// highlightBloodBags().catch((error) => console.error("Couldn't highlight the correct blood bags.", error));
						// showItemValues().catch((error) => console.error("Couldn't show the item values.", error));
						// showItemMarketIcons().catch((error) => console.error("Couldn't show the market icons.", error));

						observer.disconnect();
					}).observe(tab, { subtree: true, childList: true });
				}
			} else if (page === "inventory" && json) {
				const params = new URLSearchParams(xhr.requestBody);
				const step = params.get("step");

				if (step === "info") {
					this.showDrugDetails(parseInt(params.get("itemID"))).catch((error) => console.error("Couldn't show drug details.", error));
				}
			}
		});

		this.requireItemsLoaded().then(() => {
			for (let icon of document.findAll("ul[role=tablist] li:not(.no-items):not(.m-show):not(.hide)")) {
				icon.addEventListener("click", () => this.requireItemsLoaded().then(initializeItems));
			}
		});
	}
	addQuickItem(id, temporary = false) {
		const content = findContainer("Quick Items", { selector: ".content" });
		const innerContent = content.find(".inner-content");
		const responseWrap = content.find(".response-wrap");

		if (innerContent.find(`.item[item-id='${id}']`)) return;
		if (!this.allowQuickItem(torndata.items[id].type)) return;

		let itemWrap = document.newElement({
			type: "div",
			class: temporary ? "temp item" : "item",
			attributes: { "item-id": id },
			events: {
				click: () => {
					this.getAction({
						type: "post",
						action: "item.php",
						data: { step: "useItem", id: id, itemID: id },
						success: (str) => {
							const response = JSON.parse(str);

							const links = ["<a href='#' class='close-act t-blue h'>Close</a>"];
							if (response.links) {
								for (let link of response.links) {
									links.push(`<a class="t-blue h m-left10 ${link.class}" href="${link.url}" ${link.attr}>${link.title}</a>`);
								}
							}

							responseWrap.style.display = "block";
							responseWrap.innerHTML = `
								<div class="action-wrap use-act use-action">
									<form data-action="useItem" method="post">
										<p>${response.text}</p>
										<p>${links.join("")}</p>
										<div class="clear"></div>
									</form>
								</div>
							`;

							for (let count of responseWrap.findAll(".counter-wrap")) {
								count.classList.add("tt-modified");
								count.innerText = formatTime({ seconds: parseInt(count.dataset.time) }, { type: "timer" });
							}

							if (response.items) {
								for (const item of response.items.itemAppear) {
									this.updateItemAmount(parseInt(item.ID), parseInt(item.qty));
								}
								for (const item of response.items.itemDisappear) {
									this.updateItemAmount(parseInt(item.ID), -parseInt(item.qty));
								}
							} else {
								this.updateItemAmount(id, -1);
							}
						},
					});
				},
			},
		});
		itemWrap.appendChild(
			document.newElement({ type: "div", class: "pic", attributes: { style: `background-image: url(/images/items/${id}/medium.png)` } })
		);
		if (hasAPIData()) {
			itemWrap.appendChild(document.newElement({ type: "div", class: "text", text: torndata.items[id].name }));

			if (settings.apiUsage.user.inventory) {
				let amount = findItemsInList(userdata.inventory, { ID: id }, { single: true });
				amount = amount ? amount.quantity : 0;

				itemWrap.appendChild(document.newElement({ type: "div", class: "sub-text quantity", attributes: { quantity: amount }, text: amount + "x" }));
			}
		} else {
			itemWrap.appendChild(document.newElement({ type: "div", class: "text", text: id }));
		}
		itemWrap.appendChild(
			document.newElement({
				type: "i",
				class: "fas fa-times tt-close-icon",
				events: {
					click: async (event) => {
						event.stopPropagation();
						itemWrap.remove();

						await this.saveQuickItems();
					},
				},
			})
		);
		innerContent.appendChild(itemWrap);
	}
	allowQuickItem(category) {
		return ["Medical", "Drug", "Energy Drink", "Alcohol", "Candy", "Booster"].includes(category);
	}
	async saveQuickItems() {
		const content = findContainer("Quick Items", { selector: ".content" });

		await ttStorage.change({ quick: { items: [...content.findAll(".item")].map((x) => parseInt(x.getAttribute("item-id"))) } });
	}
	async setupQuickDragListeners() {
		for (let item of document.findAll(".items-cont[aria-expanded=true] > li[data-item]")) {
			if (!this.allowQuickItem(item.getAttribute("data-category"))) continue;

			const titleWrap = item.find(".title-wrap");

			titleWrap.setAttribute("draggable", "true");
			titleWrap.addEventListener("dragstart", onDragStart);
			titleWrap.addEventListener("dragend", onDragEnd);
		}

		function onDragStart(event) {
			event.dataTransfer.setData("text/plain", null);

			setTimeout(() => {
				document.find("#quickItems .content").classList.add("drag-progress");
				if (document.find("#quickItems .temp.item")) return;

				let id = parseInt(event.target.parentElement.getAttribute("data-item"));

				this.addQuickItem(id, true);
				// enableInjectListener();
			}, 10);
		}

		async function onDragEnd(event) {
			if (document.find("#quickItems .temp.item")) {
				document.find("#quickItems .temp.item").remove();
			}

			document.find("#quickItems .content").classList.remove("drag-progress");

			await this.saveQuickItems();
		}
	}
	async onItemClickQuickEdit(event) {
		event.stopPropagation();
		event.preventDefault();

		const target = findParent(event.target, { hasAttribute: "data-item" });
		const id = parseInt(target.getAttribute("data-item"));

		this.addQuickItem(id, false);

		await this.saveQuickItems();
	}
	updateItemAmount(id, change) {
		const quickQuantity = findContainer("Quick Items", { selector: `.item[item-id="${id}"] .quantity` });
		if (quickQuantity) {
			let newQuantity = parseInt(quickQuantity.getAttribute("quantity")) + change;

			quickQuantity.innerText = newQuantity + "x";
			quickQuantity.setAttribute("quantity", newQuantity);
		}

		for (const item of document.findAll(`.items-cont > li[data-item="${id}"]`)) {
			const priceElement = item.find(".tt-item-price");
			if (!priceElement) continue;
			const quantityElement = priceElement.find(".tt-item-quantity");

			let price = torndata.items[id].market_value;
			let newQuantity = parseInt(quantityElement.innerText.match(/([0-9]*)x = /i)[1]) + change;

			if (newQuantity === 1) {
				priceElement.innerHTML = "";
				priceElement.appendChild(document.newElement({ type: "span", text: `$${formatNumber(price)}` }));
			} else {
				quantityElement.innerText = `${newQuantity}x = `;
				priceElement.find("span:last-child").innerText = `$${formatNumber(price * newQuantity)}`;
			}
		}
	}
	async showDrugDetails(id) {
		if (settings.pages.items.drugDetails) {
			const element = document.find(".show-item-info");

			requireElement(".ajax-placeholder", { invert: true, parent: element }).then(() => {
				const details = DRUG_INFORMATION[id];
				if (!details) return;

				// Remove current info
				for (const effect of element.findAll(".item-effect")) {
					effect.remove();
				}

				const info = element.find(".info-msg");
				// Pros
				if (details.pros) {
					info.appendChild(document.newElement({ type: "div", class: "item-effect mt10", text: "Pros:", attributes: { color: "tGreen" } }));

					for (let effect of details.pros) {
						info.appendChild(document.newElement({ type: "div", class: "item-effect tabbed", text: effect, attributes: { color: "tGreen" } }));
					}
				}

				// Cons
				if (details.cons) {
					info.appendChild(document.newElement({ type: "div", class: "item-effect", text: "Con", attributes: { color: "tRed" } }));

					for (let effect of details.cons) {
						info.appendChild(document.newElement({ type: "div", class: "item-effect tabbed", text: effect, attributes: { color: "tRed" } }));
					}
				}

				// Cooldown
				if (details.cooldown) {
					info.appendChild(
						document.newElement({ type: "div", class: "item-effect", text: `Cooldown: ${details.cooldown}`, attributes: { color: "tRed" } })
					);
				}

				// Overdose
				if (details.overdose) {
					info.appendChild(document.newElement({ type: "div", class: "item-effect", text: "Overdose:", attributes: { color: "tRed" } }));

					// bars
					if (details.overdose.bars) {
						info.appendChild(document.newElement({ type: "div", class: "item-effect tabbed", text: "Bars", attributes: { color: "tRed" } }));

						for (let effect of details.overdose.bars) {
							info.appendChild(
								document.newElement({ type: "div", class: "item-effect double-tabbed", text: effect, attributes: { color: "tRed" } })
							);
						}
					}

					// hospital time
					if (details.overdose.hosp_time) {
						info.appendChild(
							document.newElement({
								type: "div",
								class: "item-effect tabbed",
								text: `Hospital: ${details.overdose.hosp_time}`,
								attributes: { color: "tRed" },
							})
						);
					}

					// extra
					if (details.overdose.extra) {
						info.appendChild(
							document.newElement({
								type: "div",
								class: "item-effect tabbed",
								text: `Extra: ${details.overdose.extra}`,
								attributes: { color: "tRed" },
							})
						);
					}
				}
			});
		}
	}

	// Torn function
	getAction(options) {
		options = {
			success: () => {},
			action: location.pathname,
			type: "get",
			data: {},
			async: true,
			...options,
		};

		return $.ajax({
			url: "https://www.torn.com/" + addRFC(options.action),
			type: options.type,
			data: options.data,
			async: options.async,
			success: (msg) => options.success(msg),
			error: (xhr, ajaxOptions, error) => {
				console.error("Error during action call.", error);
			},
		});
	}
}
