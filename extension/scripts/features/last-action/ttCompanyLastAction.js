"use strict";

(async () => {
	const feature = featureManager.registerFeature(
		"Last Action",
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

		const own = isOwnCompany();
		if (own && getHashParameters().get("option") !== "employees") return;

		await requireElement(".employee-list-wrap .employee-list > li, .employees-wrap .employees-list > li");

		const id = own ? "own" : parseInt(getHashParameters().get("ID"));
		if (!id) return; // FIXME - Find a way to go around this.

		let employees;
		if (ttCache.hasValue("company-employees", id)) {
			employees = ttCache.get("company-employees", id);
		} else {
			employees = (
				await fetchData("torn", {
					section: "company",
					...(isNaN(id) ? {} : { id }),
					selections: ["profile"],
					silent: true,
					succeedOnError: true,
				})
			).company.employees;

			ttCache.set({ [id]: employees }, TO_MILLIS.SECONDS * 30, "company-employees").then(() => {});
		}

		let list;
		if (isOwnCompany()) {
			list = document.find(".employee-list-wrap .employee-list");
			list.findAll(":scope > li").forEach((li) => {
				const employeeID = li.dataset.user;
				li.insertAdjacentElement(
					"afterend",
					document.newElement({
						type: "div",
						class: "tt-last-action",
						text: `Last action: ${employees[employeeID].last_action.relative}`,
					})
				);
			});
		} else {
			list = document.find(".employees-wrap .employees-list");
			list.findAll(":scope > li").forEach((li) => {
				const employeeID = li.find(".user.name").dataset.placeholder.match(/(?<=\[)\d+(?=]$)/g)[0];
				li.insertAdjacentElement(
					"afterend",
					document.newElement({
						type: "div",
						class: "tt-last-action joblist",
						text: `Last action: ${employees[employeeID].last_action.relative}`,
					})
				);
			});
		}
		list.classList.add("tt-modified");
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
