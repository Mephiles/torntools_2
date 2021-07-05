"use strict";

(async () => {
	featureManager.registerFeature(
		"Hide Unavailable Bounties",
		"bounties",
		() => settings.pages.bounties.filter,
		null,
		addFilter,
		removeFilter,
		{
			storage: ["settings.pages.bounties.filter"],
		},
		null
	);

	async function addFilter() {
		await requireElement(".bounties-wrap .gallery-wrapper.pagination");
		const { options } = createContainer("Chain Report", {
			previousElement: document.find(".bounties-wrap .bounties-total"),
			onlyHeader: true,
		});
		const maxLevelInput = document.newElement({
			type: "input",
			attributes: {
				type: "number",
				min: "0",
				max: "100",
			}
		});
		const cbHideUnavailable = document.newElement({
			type: "input",
			id: "hideUnavailable",
			attributes: { type: "checkbox" },
		});
		options.appendChild(document.newElement({
			type: "span",
			children: [
				"Max Level",
				maxLevelInput,
				cbHideUnavailable,
				document.newElement({ type: "label", text: "Hide Unavailable", attributes: { for: "hideUnavailable" } })
			],
		}));
		maxLevelInput.addEventListener("input", filterListing);
		cbHideUnavailable.addEventListener("input", filterListing);
		function filterListing() {
			
		}

		const { options } = createContainer("Chain Report", {
			previousElement: document.find(".content-wrapper .content-title"),
			onlyHeader: true,
		});
		const ttExportButton = document.newElement({
			type: "div",
			id: "ttExportButton",
			html: `
				<i class="fa fa-table"></i>
				<span class="text">CSV</span>
				<a id="ttExportLink"></a>`,
		});
		ttExportButton.addEventListener("click", () => {
			let table = "data:text/csv;charset=utf-8,";
			table += document.find(".report-title-faction-name").innerText + "\r\n";
			table += "Members;Respect;Avg;Attacks;Leave;Mug;Hosp;War;Bonus;Assist;Retal;Overseas;Draw;Escape;Loss\r\n";
			const members = document.findAll(".members-names-rows > *");
			const info = document.findAll(".members-stats-rows > *");
			members.forEach((member, index) => {
				table += member.find(".user.name").dataset.placeholder + ";";
				const memberInfo = info[index];
				memberInfo.findAll(".members-stats-cols > *").forEach((infoItem) => (table += infoItem.innerText + ";"));
				table += "\r\n";
			});
			const chainID = getSearchParameters().get("chainID");
			const encodedUri = encodeURI(table);
			const ttExportLink = options.find("#ttExportLink");
			ttExportLink.setAttribute("href", encodedUri);
			ttExportLink.setAttribute("download", `Chain Report [${chainID}].csv`);
			ttExportLink.click();
		});
		options.insertAdjacentElement("afterbegin", ttExportButton);
	}

	function removeFilter() {
		removeContainer("Chain Report");
	}
})();
