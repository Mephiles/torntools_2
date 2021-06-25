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

		addButton();
		await loadGraph();

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
					.catch((error) => ({ message: error.error, status: false }));

				responseElement.innerText = message;
				responseElement.classList.add(status ? "success" : "error");

				button.removeAttribute("disabled");
			});

			wrapper.appendChild(button);
			content.appendChild(wrapper);
		}

		async function loadGraph() {
			const wrapper = document.newElement({ type: "div", class: "tornstats-graph-wrapper" });
			content.appendChild(wrapper);

			showLoadingPlaceholder(wrapper, true);

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
					result = {
						status: false,
						message: error.error,
					};
				}
			}

			if (!result.status) {
				let text = result.message;

				// FIXME - Properly handle error message.
				// if (err.indexOf("Not enough data found") > -1) {
				// 	text = "Not enough data found on TornStats.";
				// } else if (err.indexOf("User not found") > -1) {
				// 	text = "Can't display graph because no TornStats account was found. Please register an account @ www.tornstats.com";
				// }

				console.log("TT - Couldn't load graph data from TornStats.", result);
				showError(text);
				return;
			}

			const width = mobile ? "312" : "784";
			const height = mobile ? "200" : "250";
			const canvas = document.newElement({ type: "canvas", attributes: { width, height } });
			wrapper.appendChild(canvas);

			const context = canvas.getContext("2d");

			createChart();

			showLoadingPlaceholder(wrapper, false);

			function showError(message) {
				wrapper.appendChild(document.newElement({ type: "div", class: "tornstats-response error", text: message }));

				showLoadingPlaceholder(wrapper, false);
			}

			function createChart() {
				return new Chart(context, {
					type: "line",
					data: {
						labels: result.data.map((x) => formatDate({ seconds: x.timestamp })),
						datasets: [
							getDataset("Strength", "#3366cc", false),
							getDataset("Defense", "#dc3912", false),
							getDataset("Speed", "#ff9901", false),
							getDataset("Dexterity", "#109618", false),
							getDataset("Total", "#990199", true),
						],
					},
					options: {
						interaction: {
							mode: "index",
							intersect: false,
						},
						plugins: {
							legend: {
								position: mobile ? "down" : "right",
								labels: {
									boxWidth: 10,
									usePointStyle: true,
									pointStyle: "circle",
								},
							},
							tooltip: {
								callbacks: {
									label: (context) => `${context.dataset.label}: ${formatNumber(context.parsed.y)}`,
								},
							},
						},
					},
				});

				function getDataset(stat, color, hidden) {
					const field = stat.toLowerCase();

					return {
						label: stat,
						data: result.data.map((x) => x[field]),
						borderColor: [color],
						pointRadius: 0,
						pointBackgroundColor: color,
						pointHoverRadius: 5,
						hidden,
					};
				}
			}
		}
	}

	function removeGraph() {
		removeContainer("Graph");
	}
})();
