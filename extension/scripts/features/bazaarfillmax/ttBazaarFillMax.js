"use strict";

(async () => {
	const feature = featureManager.registerFeature(
		"Fill Max",
		"bazaar",
		() => settings.pages.bazaar.fillMax,
		initialiseListeners,
		addFillMax,
		removeFillMax,
		{
			storage: ["settings.pages.bazaar.fillMax"],
		},
		null
	);

	async function initialiseListeners() {
		if (!(await checkMobile())) return;
		addFetchListener((event) => {
			if (!feature.enabled) return;

			const { page, json, fetch } = event.detail;
			if (page !== "bazaar") return;
			if (new URL(fetch.url).searchParams.get("step") !== "getBazaarItems") return;

			maxBuyListener({}, true);
		});
	}

	async function addFillMax() {
		if (!(await checkMobile())) document.addEventListener("click", maxBuyListener);
		else maxBuyListener(); //mobile function
	}

	async function removeFillMax() {
		if (!(await checkMobile())) {
			document.removeEventListener("click", maxBuyListener);
			document.findAll(".tt-max-buy").forEach((x) => x.remove());
		} else {
			await requireElement("[class*='buyForm___']");
			document.findAll("[class*='buyForm___']").forEach((x) => {
				x.classList.remove("tt-fill-max");
				x.find(".tt-max-buy").remove();
			});
		}
	}

	async function maxBuyListener(clickEvent = "") {
		if (!(await checkMobile())) {
			if (!clickEvent.target.classList.contains("^=controlPanelButton__")) return;
			requireElement("[class*='buyMenu__']").then(() => addButtonAndListener(document.find("[class*='buyMenu__']")));
		} else {
			await requireElement("[class*='buyForm___']");
			document.findAll("[class*='itemDescription__']:not(.tt-fill-max)").forEach((buyForm) => {
				buyForm.classList.add("tt-fill-max");
				addButtonAndListener(buyForm);
			});
		}

		function addButtonAndListener(parent) {
			const fillMax = document.newElement({ type: "span", text: "fill max", class: "tt-max-buy" });
			const buyButton = parent.find("[class*='buy_']");
			buyButton.classList.add("tt-buy");
			buyButton.parentElement.appendChild(fillMax);
			fillMax.addEventListener("click", async (event) => {
				event.stopPropagation();
				let max = (await checkMobile())
					? parseInt(parent.find("[class*='amount__']").firstElementChild.innerText)
					: parseInt(parent.find("[class*='amount__']").childNodes[1].textContent);
				if (!settings.pages.bazaar.maxBuyIgnoreCash) {
					const price = parseInt(parent.find("[class*='price_']").innerText.replace(/[,$]/g, ""));
					const money = parseInt(document.find("#user-money").dataset.money);
					if (Math.floor(money / price) < max) max = Math.floor(money / price);
				}
				if (max > 10000) max = 10000;

				parent.find("[class*='buyAmountInput_']").value = max;
				parent.find("[class*='buyAmountInput_']").dispatchEvent(new Event("input", { bubbles: true }));
			});
		}
	}
})();
