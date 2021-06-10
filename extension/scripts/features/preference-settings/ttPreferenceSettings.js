"use strict";

(async () => {
	featureManager.registerFeature("Preference Settings", "preferences", true, null, addContainer, dispose, null, null);

	function addContainer() {
		const { options } = createContainer("TornTools - Settings", { id: "tt-settings-container", onlyHeader: true, class: "mt10" });

		options.appendChild(
			document.newElement({
				type: "a",
				class: "preference-button",
				text: "Settings",
				href: chrome.runtime.getURL("pages/settings/settings.html"),
				attributes: {
					target: "_blank",
				},
			})
		);
	}

	function dispose() {
		removeContainer("TornTools - Settings", { id: "tt-settings-container" });
	}
})();
