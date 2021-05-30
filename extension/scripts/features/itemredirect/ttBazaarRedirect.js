"use strict";

(async () => {
	featureManager.registerFeature(
		"Bazaar Redirect",
		"bazaar",
		() => settings.pages.bazaar.redirects,
		null,
		addHighlight,
		removeHighlight,
		{
			storage: ["settings.pages.bazaar.redirects"],
		},
		null
	);

	async function addHighlight() {
		await requireElement("[class*='rowItems_'] [class*='item_']");
		const params = getSearchParameters();
		if (params.has("tt_itemid") && !(await checkMobile())) {
			const itemID = params.get("tt_itemid");
			const itemPrice = params.get("tt_itemprice");
			const itemName = torndata.items[itemID].name;

			let foundItem = false;
			for (const item of document.findAll("[class*='rowItems_'] [class*='item_']")) {
				if (
					item.find("[class*='name_']").innerText.trim() === itemName &&
					item.find("[class*='price_']").lastChild.textContent.replace(/[\n\$, ]/g, "") === itemPrice
				) {
					foundItem = true;
					item.classList.add("tt-flash");
					item.scrollIntoView({ behavior: "smooth" });
					break;
				}
			}

			if (!foundItem) {
				document.find(".info-msg-cont .msg").appendChild(
					document.newElement({
						type: "div",
						class: "tt-bazaar-redirect",
						children: [
							"Could not find ",
							document.newElement({ type: "span", text: itemName, class: "bold" }),
							". Please try using the Search function.",
						],
					})
				);
				const script = document.newElement({
					type: "script",
					attributes: { type: "text/javascript" },
					html: `const bazaarSearch = document.querySelector("div[class*='item__'] input");
							bazaarSearch.value = "${itemName}";
							bazaarSearch._valueTracker.setValue("");
							bazaarSearch.dispatchEvent(new Event('input', {bubbles: true, simulated: true}));`,
				});

				document.find("head").appendChild(script);
				setTimeout(() => script.remove(), 100);
			}
		}
	}

	function removeHighlight() {
		if (document.find(".tt-bazaar-redirect")) document.find(".tt-bazaar-redirect").remove();
		document.findAll(".tt-flash").forEach((x) => x.classList.remove("tt-flash"));
	}
})();
