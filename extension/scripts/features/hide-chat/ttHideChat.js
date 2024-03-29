"use strict";

(async () => {
	const feature = featureManager.registerFeature(
		"Hide Chat",
		"chat",
		() => settings.pages.chat.hideChatButton,
		initialiseListeners,
		showButton,
		removeButton,
		{
			storage: ["settings.pages.chat.hideChatButton"],
		}
	);

	async function initialiseListeners() {
		await requireChatsLoaded();

		new MutationObserver((mutations) => {
			if (!feature.enabled()) return;
			if (![...mutations].some((mutation) => mutation.addedNodes.length)) return;

			showButton();
		}).observe(document.find("#chatRoot [class*='chat-box-settings_'] [class*='overview_']"), { childList: true });
	}

	async function showButton() {
		const settingsBox = await document.find("#chatRoot [class*='chat-box-settings_']");
		if (!settingsBox.classList.contains("^=chat-active_")) return;

		const overview = settingsBox.find("[class*='overview_']");
		if (overview.find(".tt-hide-chat-option")) return;

		const checkbox = createCheckbox({ description: "Hide chats with TornTools.", class: "tt-hide-chat-option" });
		checkbox.setChecked(settings.pages.chat.hideChat);
		checkbox.onChange(() => {
			const checked = checkbox.isChecked();

			if (checked) hideChats();
			else showChats();

			ttStorage.change({ settings: { pages: { chat: { hideChat: checked } } } });
		});

		overview.appendChild(checkbox.element);

		if (settings.pages.chat.hideChat) await hideChats();
	}

	async function hideChats() {
		const root = await document.find("#chatRoot");

		root.classList.add("tt-chat-hidden");
	}

	async function showChats() {
		document.find("#chatRoot")?.classList.remove("tt-chat-hidden");
	}

	function removeButton() {
		document.find(".tt-hide-chat-option")?.remove();
		showChats();
	}
})();
