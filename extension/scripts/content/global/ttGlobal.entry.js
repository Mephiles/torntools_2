"use strict";

let featureManager, globalFeatures;

(async () => {
	await loadDatabase();
	console.log("TT: Global Entry - Loading script. ");

	featureManager = new FeatureManager();
	globalFeatures = new GlobalFeatures();

	globalFeatures.init();

	storageListeners.settings.push(() => {
		globalFeatures.init();
		featureManager.display(settings.featureDisplay);
	});
	storageListeners.userdata.push(() => {
		globalFeatures.init();
	});

	// await loadGlobalEntry();

	console.log("TT: Global Entry - Script loaded.");

	requireContent().then(() => {
		featureManager.createPopup();
	});
})();

class GlobalFeatures {
	constructor() {}

	init() {
		this.alignLeft();
		this.hideLevelUpgrade();
		this.hideLeaveButton();
		this.hideIcons();
		this.hideAreas();
		// this.hideChats(); // todo
		// this.cleanFlight(); // todo
		this.chatFontSize();
		this.highlightRefills(); 

		requireElement("#chatRoot").then((chats) => {
			this.blockZalgo(chats);
		});

		// mobile check
		checkMobile().then((mobile) => {
			if (mobile) document.documentElement.classList.add("tt-mobile");
			else document.documentElement.classList.remove("tt-mobile");
		});

		if (getSearchParameters().has("popped")) document.documentElement.classList.add("tt-popout");
		else document.documentElement.classList.remove("tt-popout");

		this.forceUpdate().catch(() => {});
		this.load();
	}
	load() {
		featureManager.load("Align Left");
		featureManager.load("Hide Level Upgrade");
		featureManager.load("Hide Leave Buttons");
		featureManager.load("Hide Icons");
		featureManager.load("Hide Areas");
		// featureManager.load("Hide Chats");
		// featureManager.load("Clean Flight");
		featureManager.load("Chat Font Size");
		featureManager.load("Highlight Energy Refill");
		featureManager.load("Highlight Nerve Refill");
	}

	alignLeft() {
		featureManager.new({
			name: "Align Left",
			scope: "global",
			enabled: settings.pages.global.alignLeft,
			func: feature,
			runWhenDisabled: true,
		});

		async function feature() {
			if (settings.pages.global.alignLeft) document.documentElement.classList.add("tt-align-left");
			else document.documentElement.classList.remove("tt-align-left");
		}
	}
	hideLevelUpgrade() {
		featureManager.new({
			name: "Hide Level Upgrade",
			scope: "global",
			enabled: settings.pages.global.hideLevelUpgrade,
			func: feature,
			runWhenDisabled: true,
		});

		async function feature() {
			document.documentElement.style.setProperty("--torntools-hide-upgrade-button", settings.pages.global.hideLevelUpgrade ? "none" : "block");
		}
	}
	hideLeaveButton() {
		featureManager.new({
			name: "Hide Leave Buttons",
			scope: "global",
			enabled: settings.pages.global.hideQuitButtons,
			func: feature,
			runWhenDisabled: true,
		});

		async function feature() {
			document.documentElement.style.setProperty("--torntools-hide-leave-button", settings.pages.global.hideQuitButtons ? "none" : "flex");
		}
	}
	hideIcons() {
		featureManager.new({
			name: "Hide Icons",
			scope: "global",
			enabled: settings.hideIcons.length > 0,
			func: feature,
			runWhenDisabled: true,
		});

		async function feature() {
			for (let icon of ALL_ICONS) {
				document.documentElement.style.setProperty(`--torntools-hide-icons-${icon}`, settings.hideIcons.includes(icon) ? "none" : "initial");
			}
		}
	}
	hideAreas() {
		featureManager.new({
			name: "Hide Areas",
			scope: "global",
			enabled: settings.hideAreas.length > 0,
			func: feature,
			runWhenDisabled: true,
		});

		async function feature() {
			for (let area of ALL_AREAS.map((area) => area.class)) {
				document.documentElement.style.setProperty(`--torntools-hide-area-${area}`, settings.hideAreas.includes(area) ? "none" : "initial");
			}
		}
	}
	hideChats() {
		featureManager.new({
			name: "Hide Chats",
			scope: "global",
			enabled: settings.hideChats,
			func: feature,
			runWhenDisabled: true,
		});

		async function feature() {
			// todo
		}
	}
	cleanFlight() {
		featureManager.new({
			name: "Clean Flight",
			scope: "global",
			enabled: settings.cleanFlight,
			func: feature,
			runWhenDisabled: true,
		});

		async function feature() {
			// todo
		}
	}
	chatFontSize() {
		featureManager.new({
			name: "Chat Font Size",
			scope: "global",
			enabled: settings.pages.chat.fontSize !== 12,
			func: feature,
			runWhenDisabled: true,
		});

		async function feature() {
			document.documentElement.style.setProperty("--torntools-chat-font-size", `${settings.pages.chat.fontSize || 12}px`);
		}
	}
	highlightRefills() {
		featureManager.new({
			name: "Highlight Energy Refill",
			scope: "global",
			enabled: settings.pages.sidebar.highlightEnergy,
			func: feature_energy,
			runWhenDisabled: true,
		});
		featureManager.new({
			name: "Highlight Nerve Refill",
			scope: "global",
			enabled: settings.pages.sidebar.highlightNerve,
			func: feature_nerve,
			runWhenDisabled: true,
		});

		async function feature_energy() {
			if (hasAPIData()) {
				document.documentElement.style.setProperty(
					"--torntools-highlight-energy",
					!userdata.refills.energy_refill_used && settings.pages.sidebar.highlightEnergy ? `#6e8820` : "#333"
				);
			} else throw 'No api data';
		}
		async function feature_nerve() {
			if (hasAPIData()) {
				document.documentElement.style.setProperty(
					"--torntools-highlight-nerve",
					!userdata.refills.nerve_refill_used && settings.pages.sidebar.highlightNerve ? `#6e8820` : "#333"
				);
			} else throw "No api data";
		}
	}
	blockZalgo(chats) {
		featureManager.new({
			name: "Block Zalgo",
			scope: "global",
			enabled: settings.pages.chat.blockZalgo,
			func: feature,
			runWhenDisabled: true,
		});
		featureManager.load("Block Zalgo");

		async function feature() {
			if (settings.pages.chat.blockZalgo) chats.classList.add("no-zalgo");
			else chats.classList.remove("no-zalgo");
		}
	}

	async forceUpdate() {
		await requireContent();

		document.find("#sidebarroot ul[class*='status-icons']").setAttribute("updated", Date.now());
	}
}
