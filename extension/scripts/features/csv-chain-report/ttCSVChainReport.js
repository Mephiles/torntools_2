"use strict";

(async () => {
	featureManager.registerFeature(
		"Chain Report to CSV",
		"faction",
		() => settings.pages.faction.csvChainReport,
		null,
		addCSVContainer,
		removeCSVContainer,
		{
			storage: ["settings.pages.faction.csvChainReport"],
		},
		null
	);

	async function addCSVContainer() {
		await requireElement(".members-stats-col.respect");
		const { options } = createContainer("Chain Report", {
			previousElement: document.find(".content-wrapper .content-title"),
			onlyHeader: true,
		});
		const ttExportButton = document.newElement({
			type: "div",
			id: "ttExportButton",
			children: [
				document.newElement({ type: "i", class: "fa fa-table" }),
				document.newElement({ type: "span", class: "text", text: "CSV" }),
				document.newElement({ type: "a", id: "ttExportLink" }),
			],
		});
		ttExportButton.addEventListener("click", () => {
			let table = "data:text/csv;charset=utf-8,";
			table += document.find(".report-title-faction-name").textContent + "\r\n";
			table += "Members;Respect;Avg;Attacks;Leave;Mug;Hosp;War;Bonus;Assist;Retal;Overseas;Draw;Escape;Loss\r\n";
			const members = document.findAll(".members-names-rows > *");
			const info = document.findAll(".members-stats-rows > *");
			isHonorBarsEnabled(members[0]);
			members.forEach((member, index) => {
				const userNameNode = member.find(".user.name");
				table +=
					honorBarsEnabled
						? userNameNode.dataset.placeholder
						: userNameNode.textContent + " " + userNameNode.href.getNumber()
					+ ";";
				const memberInfo = info[index];
				memberInfo.findAll(".members-stats-cols > *").forEach((infoItem) => (table += infoItem.textContent + ";"));
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

	function removeCSVContainer() {
		removeContainer("Chain Report");
	}
})();
