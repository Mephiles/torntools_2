"use strict";

(async () => {
	if (!getPageStatus().access) return;

	const feature = featureManager.registerFeature(
		"Vault Sharing",
		"properties",
		() => settings.pages.property.vaultSharing,
		initialise,
		startFeature,
		dispose,
		{
			storage: ["settings.pages.property.vaultSharing"],
		},
		null
	);

	function initialise() {
		window.addEventListener("hashchange", () => {
			if (!feature.enabled()) return;

			startFeature();
		});
	}

	function startFeature() {
		if (getHashParameters().get("tab") !== "vault") return;

		showContainer();
	}

	async function showContainer() {
		await requireElement(".vault-wrap");

		const { content } = createContainer("Vault Sharing", { previousElement: document.find(".vault-wrap"), class: "mt10" });
	}

	function dispose() {
		removeContainer("Vault Sharing");
	}
})();
