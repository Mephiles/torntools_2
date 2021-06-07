"use strict";

(async () => {
	featureManager.registerFeature(
		"TT Settings Link",
		"sidebar",
		() => settings.pages.sidebar.settingsLink,
		null,
		addLink,
		removeLink,
		{
			storage: ["settings.pages.sidebar.settingsLink"],
		},
		async () => {
			if (await checkMobile()) return "Not supported on mobile!";
		}
	);

	async function addLink() {
		await requireSidebar();

		const settingsA = document.newElement({
			type: "a",
			text: "TornTools Settings",
		});
		const ttSvg = await fetch(chrome.runtime.getURL("resources/images/svg-icons/icon_128.svg")).then((x) => x.text());
		const ttSettingsDiv = document.newElement({
			type: "div",
			class: "tt-settings pill",
			children: [settingsA],
		});
		ttSettingsDiv.insertAdjacentHTML("afterbegin", ttSvg);
		ttSettingsDiv.addEventListener("click", () => {
			if (document.find(".tt-settings-iframe")) return;
			const ttSettingsIframe = document.newElement({
				type: "iframe",
				class: "tt-settings-iframe",
				attributes: {
					src: chrome.runtime.getURL("pages/settings/settings.html"),
				},
			});
			const returnToTorn = document.newElement({
				type: "a",
				class: "tt-back",
				html: `
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 13">
						<path d="M16,13S14.22,4.41,6.42,4.41V1L0,6.7l6.42,5.9V8.75c4.24,0,7.37.38,9.58,4.25"></path>
						<path d="M16,12S14.22,3.41,6.42,3.41V0L0,5.7l6.42,5.9V7.75c4.24,0,7.37.38,9.58,4.25"></path>
					</svg>
					<span id="back">Back to TORN</span>
				`,
			});
			const tornContent = document.find(".content-wrapper[role*='main']");

			tornContent.style.display = "none";
			tornContent.insertAdjacentElement("afterend", returnToTorn);
			tornContent.insertAdjacentElement("afterend", ttSettingsIframe);
			document.body.classList.add("tt-align-left");
			returnToTorn.addEventListener("click", () => {
				returnToTorn.remove();
				ttSettingsIframe.remove();
				tornContent.style.display = "block";
				document.body.classList.remove("tt-align-left");
			});
		});
		document.find(".areasWrapper [class*='toggle-content__']").appendChild(ttSettingsDiv);
	}

	function removeLink() {
		const returnToTorn = document.find(".tt-back");
		if (returnToTorn) returnToTorn.remove();

		const ttSettingsIframe = document.find(".tt-settings-iframe");
		if (ttSettingsIframe) ttSettingsIframe.remove();

		const tornContent = document.find(".content-wrapper[role*='main']");
		if (tornContent.style.display === "none") tornContent.style.display = "block";

		document.body.classList.remove("tt-align-left");

		const sidebarLink = document.find(".tt-settings.pill");
		if (sidebarLink) sidebarLink.remove();
	}
})();
