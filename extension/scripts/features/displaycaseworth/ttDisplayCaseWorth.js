"use strict";

(async () => {
	const feature = featureManager.registerFeature(
		"Display Case Worth",
		"display case",
		() => settings.pages.displayCase.worth,
		xhrListener,
		addWorth,
		removeWorth,
		{
			storage: ["settings.pages.displayCase.worth"],
		},
		() => {
			if (!hasAPIData()) return "No API access.";
		}
	);

	function xhrListener() {
		addXHRListener(({ detail: { page, xhr, json } }) => {
			if (feature.enabled() && page === "displaycase" && (xhr.requestBody === "step=display" || xhr.requestBody.startsWith("userID="))) addWorth();
		});
	}

	async function addWorth() {
		const displayCaseUserId = window.location.hash.split("/").length > 1 ? window.location.hash.split("/").last() : "";
		if (displayCaseUserId && !isNaN(displayCaseUserId) && parseInt(displayCaseUserId) !== userdata.player_id) {
			await requireElement(".info-msg-cont .msg");
			fetchApi("torn", { section: "user", id: displayCaseUserId, selections: ["display"] })
				.then((result) => {
					let total = 0;

					for (const item of result.display) {
						total += item.market_price * item.quantity;
					}

					document.find(".info-msg-cont .msg").appendChild(
						document.newElement({
							type: "div",
							class: "tt-display-worth",
							text: "This display cabinet is worth ",
							children: [
								document.newElement({
									type: "span",
									text: formatNumber(total, { currency: true }) + ".",
								}),
							],
						})
					);
				})
				.catch((error) => {
					document.find(".info-msg-cont .msg").appendChild(
						document.newElement({
							type: "div",
							class: "tt-display-worth",
							text: "TORN API returned error:" + error.toString(),
						})
					);
					console.log("TT - Display Cabinet Worth API Error:", error);
				});
		} else {
			fetchApi("torn", { section: "user", id: userdata.player_id, selections: ["display"] })
				.then(async (result) => {
					let total = 0;

					for (const item of result.display) {
						total += item.market_price * item.quantity;
					}

					document.find(".display-cabinet").insertAdjacentElement(
						"beforebegin",
						await newTornInfoBox(
							`
						This display cabinet is worth 
							<span>${formatNumber(total, { currency: true })}</span>.`,
							"tt-display-worth"
						)
					);
				})
				.catch(async (error) => {
					document.find(".display-cabinet").insertAdjacentElement(
						"beforebegin",
						await newTornInfoBox(
							`
						TORN API returned error: 
							${error.toString()}
						.`,
							"tt-display-worth"
						)
					);
					console.log("TT - Display Cabinet Worth API Error:", error);
				});
		}
	}

	function removeWorth() {
		document.find(".tt-display-worth").remove();
	}
})();
