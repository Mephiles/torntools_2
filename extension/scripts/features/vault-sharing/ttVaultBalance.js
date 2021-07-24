"use strict";

(async () => {
	if (await checkMobile()) return "Not supported on mobile!";

	featureManager.registerFeature(
		"Vault Balance",
		"sidebar",
		() => settings.pages.property.vaultSharing,
		null,
		showBalance,
		removeBalance,
		{
			storage: ["settings.pages.property.vaultSharing"],
		},
		null
	);

	async function showBalance() {
		await requireSidebar();

		removeBalance();

		let money = 0;

		const moneyBlock = document.find("#user-money").parentElement;
		moneyBlock.parentElement.insertBefore(
			document.newElement({
				type: "p",
				class: "tt-vault-balance",
				children: [
					document.newElement({ type: "span", class: "name", text: "Vault:" }),
					document.newElement({ type: "span", class: "value", text: formatNumber(money, { currency: true }) }),
				],
			}),
			moneyBlock.nextElementSibling
		);
	}

	function removeBalance() {
		const balance = document.find(".tt-vault-balance");
		if (balance) balance.remove();
	}
})();
