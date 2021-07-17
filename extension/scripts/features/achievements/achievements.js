const ACHIEVEMENTS = [
	{
		name: "Perks",
		stats: () =>
			userdata.company_perks.length +
			userdata.education_perks.length +
			userdata.enhancer_perks.length +
			userdata.faction_perks.length +
			userdata.job_perks.length +
			userdata.merit_perks.length +
			userdata.property_perks.length +
			userdata.stock_perks.length,
		detection: { keyword: "personal perks" },
		requirements: { pages: ["home"] },
	},
	{
		name: "Awards",
		stats: () => userdata.personalstats.awards,
		detection: { keyword: "total awards" },
		requirements: { pages: ["home", "awards"] },
	},
	{
		name: "Married (days)",
		stats: () => userdata.married.duration,
		detection: { keyword: "stay married" },
		requirements: { pages: ["home", "church"] },
	},
	{
		name: "Points sold",
		stats: () => userdata.personalstats.pointssold,
		detection: { keyword: "points on the market" },
		requirements: { pages: ["home", "pmarket"] },
	},
	{
		name: "Activity",
		stats: () => Math.floor(userdata.personalstats.useractivity / (TO_MILLIS.HOURS / TO_MILLIS.SECONDS)),
		detection: { keyword: "activity" },
		requirements: { pages: ["home"] },
	},
	{
		name: "Bazaar buyers",
		stats: () => userdata.personalstats.bazaarcustomers,
		detection: { keyword: "customers buy from your bazaar" },
		// FIXME - Load on the bazaars?
		requirements: { pages: ["home"] },
	},
	{
		name: "Stock payouts",
		stats: () => userdata.personalstats.stockpayouts,
		detection: { keyword: "payouts" },
		// FIXME - Load on the stock market?
		requirements: { pages: ["home"] },
	},
	{
		name: "Donator (days)",
		stats: () => userdata.personalstats.daysbeendonator,
		detection: { keyword: "donator" },
		// FIXME - Load on the donator page?
		requirements: { pages: ["home"] },
	},
	{
		name: "Energy refills",
		group: "refills",
		stats: () => userdata.personalstats.refills,
		detection: { keyword: "refill", include: ["energy"] },
		// FIXME - Load on the point usage?
		requirements: { pages: ["home"] },
	},
	{
		name: "Nerve refills",
		group: "refills",
		stats: () => userdata.personalstats.nerverefills,
		detection: { keyword: "refill", include: ["nerve"] },
		// FIXME - Load on the point usage?
		requirements: { pages: ["home"] },
	},
	{
		name: "Casino refills",
		group: "refills",
		stats: () => userdata.personalstats.tokenrefills,
		detection: { keyword: "refill", include: ["casino"] },
		// FIXME - Load on the point usage?
		requirements: { pages: ["home"] },
	},
	{
		name: "Networth",
		stats: () => userdata.personalstats.networth,
		detection: { keyword: "networth" },
		requirements: { pages: ["home"] },
	},
	{
		name: "Bounties collected",
		stats: () => userdata.personalstats.bountiescollected,
		detection: { keyword: "bounties", include: ["collect"] },
		requirements: { pages: ["bounties"] },
	},
	{
		name: "Bounties collected (money)",
		stats: () => userdata.personalstats.totalbountyreward,
		detection: { keyword: "bounty", include: ["earn", "hunting"] },
		requirements: { pages: ["bounties"] },
	},
	{
		name: "Donations",
		stats: () => {
			const description = document.find("#church-donate .desc > p:first-child > span");
			if (!description) return -1;

			return parseInt(description.innerText.substring(1).replaceAll(",", ""));
		},
		detection: { keyword: "church" },
		requirements: { pages: ["church"] },
	},
	// FIXME - Fix these.
	{
		name: "City finds",
		stats: () => userdata.personalstats.cityfinds,
		detection: { keyword: "city", include: ["find", "items"] },
		requirements: { pages: ["city"] },
	},
	{
		name: "Dump finds",
		stats: () => userdata.personalstats.dumpfinds,
		detection: { keyword: "dump" },
		requirements: { pages: ["dump"] },
	},
	{
		name: "Complete courses",
		stats: () => userdata.education_completed.length,
		detection: { keyword: "education courses" },
		requirements: { pages: ["education"] },
	},
	{
		name: "Biology Bachelor",
		stats: () => (userdata.education_completed.includes(42) ? 1 : 0),
		detection: { goals: [1] },
		requirements: { pages: ["education"] },
	},
	{
		name: "Business Bachelor",
		stats: () => (userdata.education_completed.includes(13) ? 1 : 0),
		detection: { goals: [1] },
		requirements: { pages: ["education"] },
	},
	{
		name: "Combat Bachelor",
		stats: () => (userdata.education_completed.includes(87) ? 1 : 0),
		detection: { goals: [1] },
		requirements: { pages: ["education"] },
	},
	{
		name: "ICT Bachelor",
		stats: () => (userdata.education_completed.includes(62) ? 1 : 0),
		detection: { goals: [1] },
		requirements: { pages: ["education"] },
	},
	{
		name: "General Bachelor",
		stats: () => (userdata.education_completed.includes(121) ? 1 : 0),
		detection: { goals: [1] },
		requirements: { pages: ["education"] },
	},
	{
		name: "Fitness Bachelor",
		stats: () => (userdata.education_completed.includes(111) ? 1 : 0),
		detection: { goals: [1] },
		requirements: { pages: ["education"] },
	},
	{
		name: "History Bachelor",
		stats: () => (userdata.education_completed.includes(21) ? 1 : 0),
		detection: { goals: [1] },
		requirements: { pages: ["education"] },
	},
	{
		name: "Law Bachelor",
		stats: () => (userdata.education_completed.includes(102) ? 1 : 0),
		detection: { goals: [1] },
		requirements: { pages: ["education"] },
	},
	{
		name: "Mathematics Bachelor",
		stats: () => (userdata.education_completed.includes(33) ? 1 : 0),
		detection: { goals: [1] },
		requirements: { pages: ["education"] },
	},
	{
		name: "Psychology Bachelor",
		stats: () => (userdata.education_completed.includes(69) ? 1 : 0),
		detection: { goals: [1] },
		requirements: { pages: ["education"] },
	},
	{
		name: "Defense Bachelor",
		stats: () => (userdata.education_completed.includes(42) ? 1 : 0),
		detection: { goals: [1] },
		requirements: { pages: ["education"] },
	},
	{
		name: "Sports Bachelor",
		stats: () => (userdata.education_completed.includes(51) ? 1 : 0),
		detection: { goals: [1] },
		requirements: { pages: ["education"] },
	},
];
