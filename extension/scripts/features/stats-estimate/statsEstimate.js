const RANKS = {
	"Absolute beginner": 1,
	Beginner: 2,
	Inexperienced: 3,
	Rookie: 4,
	Novice: 5,
	"Below average": 6,
	Average: 7,
	Reasonable: 8,
	"Above average": 9,
	Competent: 10,
	"Highly competent": 11,
	Veteran: 12,
	Distinguished: 13,
	"Highly distinguished": 14,
	Professional: 15,
	Star: 16,
	Master: 17,
	Outstanding: 18,
	Celebrity: 19,
	Supreme: 20,
	Idolized: 21,
	Champion: 22,
	Heroic: 23,
	Legendary: 24,
	Elite: 25,
	Invincible: 26,
};

const RANK_TRIGGERS = {
	level: [2, 6, 11, 26, 31, 50, 71, 100],
	crimes: [100, 5000, 10000, 20000, 30000, 50000],
	networth: [5000000, 50000000, 500000000, 5000000000, 50000000000],

	stats: ["under 2k", "2k - 25k", "20k - 250k", "200k - 2.5m", "2m - 25m", "20m - 250m", "over 200m"],
};

async function retrieveStatsEstimate(id, isList, count, options = {}) {
	options = {
		uuid: false,
		...options,
	};

	let stats, data;
	if (ttCache.hasValue("stats-estimate", id)) {
		stats = ttCache.get("stats-estimate", id);
	} else if (ttCache.hasValue("profile-stats", id)) {
		data = ttCache.get("profile-stats", id);
	} else {
		// if (level && settings.scripts.statsEstimate.maxLevel && settings.scripts.statsEstimate.maxLevel < level)
		// 	throw { message: "Too high of a level.", show: false };

		if (isList && settings.scripts.statsEstimate.cachedOnly)
			throw { message: "No cached result found!", show: settings.scripts.statsEstimate.displayNoResult };

		if (isList) await sleep(settings.scripts.statsEstimate.delay * count);

		if (options.uuid && options.uuid !== estimatingUUID) throw { message: "Aborted estimate due to another task running.", show: true };

		try {
			data = await fetchData("torn", { section: "user", id, selections: ["profile", "personalstats", "crimes"], silent: true });

			ttCache.set({ [id]: data }, TO_MILLIS.HOURS * 6, "profile-stats").catch(() => {});
		} catch (error) {
			let message;
			if (error.error) message = error.error;
			else if (error.code) message = `Unknown (code ${error.code})`;
			else message = error;

			throw { message, show: true };
		}
	}

	if (!stats) {
		if (data) {
			const {
				rank,
				level,
				criminalrecord: { total: crimes },
				personalstats: { networth },
				last_action: { timestamp: lastAction },
			} = data;

			if (level && settings.scripts.statsEstimate.maxLevel && settings.scripts.statsEstimate.maxLevel < level)
				throw { message: "Too high of a level.", show: false };

			stats = calculateEstimateBattleStats(rank, level, crimes, networth);

			cacheStatsEstimate(id, stats, lastAction * 1000).catch((error) => console.error("Failed to cache stat estimate.", error));
		} else {
			throw "Failed to load estimates.";
		}
	}

	return stats;
}

function calculateEstimateBattleStats(rank, level, crimes, networth) {
	rank = rank.match(/[A-Z][a-z ]+/g)[0].trim();

	const triggersLevel = RANK_TRIGGERS.level.filter((x) => x <= level).length;
	const triggersCrimes = RANK_TRIGGERS.crimes.filter((x) => x <= crimes).length;
	const triggersNetworth = RANK_TRIGGERS.networth.filter((x) => x <= networth).length;

	const triggersStats = RANKS[rank] - triggersLevel - triggersCrimes - triggersNetworth - 1;

	return RANK_TRIGGERS.stats[triggersStats] ?? "N/A";
}

function cacheStatsEstimate(id, estimate, lastAction) {
	let days = 7;

	if (estimate === RANK_TRIGGERS.stats.last()) days = 31;
	else if (lastAction && lastAction <= Date.now() - TO_MILLIS.DAYS * 180) days = 31;
	else if (estimate === "N/A") days = 1;

	return ttCache.set({ [id]: estimate }, TO_MILLIS.DAYS * days, "stats-estimate");
}

let estimatingUUID;

function executeStatsEstimate(selector, handler) {
	let estimated = 0;

	const uuid = getUUID();
	estimatingUUID = uuid;

	for (const row of document.findAll(selector)) {
		if (row.classList.contains("tt-estimated")) continue;

		const { id, level } = handler(row);

		if (level && settings.scripts.statsEstimate.maxLevel && settings.scripts.statsEstimate.maxLevel < level) continue;
		row.classList.add(".tt-estimated");

		const section = document.newElement({ type: "div", class: "tt-stats-estimate" });
		row.insertAdjacentElement("afterend", section);

		showLoadingPlaceholder(section, true);

		if (!ttCache.hasValue("stats-estimate", id) && !ttCache.hasValue("profile-stats", id)) estimated++;

		// FIXME - Cancel requests when on another page.
		retrieveStatsEstimate(id, true, estimated - 1, { uuid })
			.then((estimate) => (section.innerText = `Stats Estimate: ${estimate}`))
			.catch((error) => {
				if (error.show) {
					// FIXME - Improve error handling
					section.innerText = error.message;
				} else {
					section.remove();
				}
			})
			.then(() => showLoadingPlaceholder(section, false));
	}
}
