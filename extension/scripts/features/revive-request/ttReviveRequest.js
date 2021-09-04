"use strict";

(async () => {
	if ((await checkDevice()).mobile) return "Not supported on mobile!";
	else if (isFlying()) return;

	const page = getPage();

	const feature = featureManager.registerFeature(
		"Revive Request",
		"global",
		() => settings.pages.global.reviveProvider,
		initialiseListeners,
		startFeature,
		removeButton,
		{
			storage: ["settings.pages.global.reviveProvider"],
		},
		() => {
			switch (settings.pages.global.reviveProvider) {
				case "nuke":
					if (!hasAPIData()) return "No API access.";
					break;
			}
		}
	);

	async function initialiseListeners() {
		new MutationObserver(() => {
			if (!feature.enabled()) return;

			if (isHospitalised()) showButton();
			else removeButton();
		}).observe(document.body, { attributes: true, attributeFilter: ["data-layout"] });

		if (page === "russianRoulette") {
			await requireElement("#react-root");

			new MutationObserver(() => {
				if (!isHospitalised()) return;

				showButton();
			}).observe(document.find("#react-root"), { childList: true });
		} else if (page === "forums") {
			await requireElement("#forums-page-wrap");

			new MutationObserver((mutations) => {
				if (
					!isHospitalised() ||
					![...mutations]
						.filter((mutation) => mutation.addedNodes.length)
						.flatMap((mutation) => [...mutation.addedNodes])
						.map((node) => node.className)
						.filter((name) => !!name)
						.some((name) => name.includes("content-title"))
				)
					return;

				showButton();
			}).observe(document.find("#forums-page-wrap"), { childList: true });
		}
	}

	function startFeature() {
		if (isHospitalised()) showButton();
		else removeButton();
	}

	function showButton() {
		const button = document.newElement({
			type: "button",
			class: "tt-revive",
			children: [document.newElement({ type: "i", class: "fas fa-stethoscope" }), document.newElement({ type: "span", text: "Request Revive" })],
			events: { click: requestRevive },
		});

		const parent = getParent();
		if (!parent) return;

		if (page === "item" && parent.id === "top-page-links-list") {
			parent.appendChild(button);
		} else {
			parent.insertAdjacentElement("beforebegin", button);
		}

		function getParent() {
			return (
				(page === "item" && document.find("#top-page-links-list")) ||
				document.find(".links-footer, .content-title .clear, .forums-main-wrap, [class*='linksContainer___']") ||
				document.find(".links-top-wrap")
			);
		}

		async function requestRevive() {
			const provider = settings.pages.global.reviveProvider || "";

			const details = getUserDetails();
			if (details.error) return false; // FIXME - Show error message.

			button.setAttribute("disabled", "");

			const { id, name } = details;

			let country = document.body.dataset.country;
			if (country === "uk") country = "United Kingdom";
			else if (country === "uae") country = "UAE";
			else country = capitalizeText(country.replaceAll("-", " "), { everyWord: true });

			if (provider === "nuke") {
				const faction = "Damage Inc";

				const response = await fetchData("nukefamily", {
					section: "dev/reviveme.php",
					method: "POST",
					body: {
						uid: id,
						Player: name,
						Faction: faction,
						Country: country,
						AppInfo: `TornTools v${chrome.runtime.getManifest().version}`,
					},
					relay: true,
					silent: true,
					succeedOnError: true,
				});

				if (response.error) {
					// FIXME - Show error message.
					button.removeAttribute("disabled");
					console.log("DKK nuke error", response);
				} else {
					// FIXME - Handle response.
					console.log("DKK nuke", response);
				}
			} else {
				// FIXME - Implement others.
				console.log("DKK request revive", settings.pages.global.reviveProvider);
			}
		}
	}

	function isHospitalised() {
		return document.body.dataset.layout === "hospital";
	}

	function removeButton() {
		document.find(".tt-revive")?.remove();
	}
})();
