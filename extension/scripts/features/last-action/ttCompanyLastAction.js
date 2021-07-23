"use strict";

(async () => {
	const feature = featureManager.registerFeature(
		"Last Action - Company",
		"last action",
		() => settings.scripts.lastAction.company,
		addListener,
		addLastAction,
		removeLastAction,
		{
			storage: ["settings.scripts.lastAction.company"],
		},
		null
	);

	function addListener() {
		if (isOwnCompany()) {
			window.addEventListener("hashchange", () => {
				if (!feature.enabled()) return;

				addLastAction();
			});
		}
	}

	async function addLastAction() {
		if (document.find(".tt-last-action")) return;
		if (isOwnCompany()) {
			if (getHashParameters().get("option") !== "employees") return;
			await requireElement(".employee-list-wrap .employee-list > li");
			const lastActionList = (await fetchData("torn", { section: "company" })).company.employees;
			const list = document.find(".employee-list-wrap .employee-list");
			list.classList.add("tt-modified");
			list.findAll(":scope > li").forEach((li) => {
				const employeeID = li.dataset.user;
				li.insertAdjacentElement(
					"afterend",
					document.newElement({
						type: "div",
						class: "tt-last-action",
						text: `Last action: ${lastActionList[employeeID].last_action.relative}`,
					})
				);
			});
		} else {
			await requireElement(".employees-wrap .employees-list > li");
			const lastActionList = (await fetchData("torn", { section: "company", id: getHashParameters().get("ID") })).company.employees;
			const list = document.find(".employees-wrap .employees-list");
			list.classList.add("tt-modified");
			list.findAll(":scope > li").forEach((li) => {
				const employeeID = li.find(".user.name").dataset.placeholder.match(/(?<=\[)\d+(?=]$)/g)[0];
				li.insertAdjacentElement(
					"afterend",
					document.newElement({
						type: "div",
						class: "tt-last-action joblist",
						text: `Last action: ${lastActionList[employeeID].last_action.relative}`,
					})
				);
			});
		}
	}

	function removeLastAction() {
		const list = document.find(".employee-list-wrap .employee-list.tt-modified, .employees-wrap .employees-list.tt-modified");
		if (list) {
			list.findAll(":scope > div.tt-last-action").forEach((x) => x.remove());
			list.classList.remove("tt-modified");
		}
	}

	function isOwnCompany() {
		return location.pathname === "/companies.php";
	}
})();
