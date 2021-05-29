"use strict";

(async () => {
	featureManager.registerFeature(
		"Age to Words",
		"profile",
		() => settings.pages.profile.ageToWords,
		null,
		addWords,
		removeWords,
		{
			storage: ["settings.pages.profile.ageToWords"],
		},
		null
	);

	async function addWords() {
		await requireElement(".box-info.age .box-value");

		const ageDiv = document.find(".box-info.age");
		ageDiv.find(".box-name").classList.add("hidden");
		const age = parseInt(document.find(".box-info.age .box-value").innerText.replace(/\n/g, ""));
		const dateCurrent = new Date();
		const utimeTarget = dateCurrent.getTime() + age * 86400 * 1000;
		const dateTarget = new Date(utimeTarget);
		let diffYear = dateTarget.getUTCFullYear() - dateCurrent.getUTCFullYear();
		let diffMonth = dateTarget.getUTCMonth() - dateCurrent.getUTCMonth();
		let diffDay = dateTarget.getUTCDate() - dateCurrent.getUTCDate();
		const daysInMonth = [31, dateTarget.getUTCFullYear() % 4 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		let dateString;
		while (true) {
			dateString = diffYear > 0 ? `${diffYear} year${applyPlural(diffYear)}` : "";

			if (diffMonth < 0) {
				diffYear -= 1;
				diffMonth += 12;
				continue;
			}
			dateString += diffMonth > 0 ? `${diffMonth} month${applyPlural(diffMonth)}` : "";

			if (diffDay < 0) {
				diffMonth -= 1;
				diffDay += daysInMonth[(11 + dateTarget.getUTCMonth()) % 12];
				continue;
			}
			dateString += diffDay > 0 ? `${diffDay} day${applyPlural(diffDay)}` : "";
			break;
		}
		ageDiv.find(".block-value").insertAdjacentElement(
			"afterend",
			document.newElement({
				type: "div",
				text: dateString,
				class: "tt-age-text",
			})
		);
		ageDiv.find(".block-value").insertAdjacentElement("afterend", document.newElement("br"));
	}

	function removeWords() {
		const ageDiv = document.find(".box-info.age");
		ageDiv.find(".box-name").classList.remove("hidden");
		ageDiv.findAll(".block-value + br").forEach((x) => x.remove());
		document.findAll(".tt-age-text").forEach((x) => x.remove());
	}
})();
