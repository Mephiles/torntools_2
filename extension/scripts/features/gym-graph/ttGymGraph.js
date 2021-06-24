"use strict";

(async () => {
	if (!getPageStatus().access) return;

	featureManager.registerFeature(
		"Graph",
		"gym",
		() => settings.pages.gym.graph,
		null,
		showGraph,
		removeGraph,
		{
			storage: ["settings.pages.gym.graph", "settings.external.tornstats"],
		},
		async () => {
			if (!hasAPIData()) return "No API access.";
			else if (!settings.external.tornstats) return "TornStats not enabled";

			await checkMobile();
		}
	);

	async function showGraph() {
		const { content } = createContainer("Graph", { class: "mt10" });

		showLoadingPlaceholder(content, true);

		addButton();
		await loadGraph();

		showLoadingPlaceholder(content, false);

		function addButton() {
			const wrapper = document.newElement({ type: "div", class: "tornstats-update" });

			const button = document.newElement({ type: "button", text: "Update TornStats", class: "tt-btn tornstats-button" });

			button.addEventListener("click", async () => {
				if (wrapper.find(".tornstats-response")) wrapper.find(".tornstats-response").remove();

				const responseElement = document.newElement({ type: "div", class: "tornstats-response" });
				wrapper.appendChild(responseElement);

				button.setAttribute("disabled", "");
				showLoadingPlaceholder(responseElement, true);

				const { message, status } = await fetchData("tornstats", { section: "battlestats/record" })
					.then((response) => {
						// FIXME - Improve message.
						console.log("DKK TS", response);

						return response;
					})
					.catch((error) => ({ message: error, status: false }));

				responseElement.innerText = message;
				responseElement.classList.add(status ? "success" : "error");

				button.removeAttribute("disabled");
			});

			wrapper.appendChild(button);
			content.appendChild(wrapper);
		}

		async function loadGraph() {
			let result;
			if (ttCache.hasValue("gym", "graph")) {
				result = ttCache.get("gym", "graph");
			} else {
				try {
					result = await fetchData("tornstats", { section: "battlestats/graph" });

					if (result.status) {
						ttCache.set({ graph: result }, TO_MILLIS.HOURS, "gym").then(() => {});
					}
				} catch (error) {
					console.log("TT - Failed to load graph from TornStats.", error);
					return;
				}
			}

			// FIXME - Show graph.
			console.log("DKK loadGraph", result);
		}
	}

	function removeGraph() {
		removeContainer("Graph");
	}
})();
