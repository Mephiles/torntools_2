"use strict";

(async () => {
	if (!getPageStatus().access) return;

	featureManager.registerFeature(
		"Job Specials",
		"joblist",
		() => settings.pages.joblist.specials,
		null,
		showSpecials,
		removeSpecials,
		{
			storage: ["settings.pages.joblist.specials"],
		},
		null
	);

	async function showSpecials() {
		await requireElement(".content-wrapper .company-details");

		const { content } = createContainer("Job Specials", {
			previousElement: document.find(".company-details-wrap"),
			spacer: true,
		});

		const companyType = document.find(".details-wrap ul.info .m-title .m-show:not(.arrow-left)").innerText.trim();

		for (const stars of [1, 3, 5, 7, 10]) {
			const companyInfo = COMPANY_INFORMATION[companyType];
			const name = companyInfo[stars].name;
			const cost = companyInfo[stars].cost;
			const effect = companyInfo[stars].effect;

			content.appendChild(
				document.newElement({
					type: "div",
					class: "tt-comp-info-wrap",
					children: [
						document.newElement({ type: "div", class: "heading", text: `${name} (${stars}★)` }),
						document.newElement({ type: "hr" }),
						document.newElement({ type: "div", text: `${cost} ${cost === "Passive" ? "" : cost === "1" ? "job point" : "job points"}` }),
						document.newElement({ type: "hr" }),
						document.newElement({ type: "div", text: effect }),
					],
				})
			);
		}
	}

	function removeSpecials() {
		removeContainer("Job Specials");
	}
})();
