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

	function showGraph() {
		const { content } = createContainer("Graph");
	}

	function removeGraph() {
		removeContainer("Graph");
	}
})();
