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
		// FIXME - Load on the awards page?
		requirements: { pages: ["home"] },
	},
	{
		name: "Married (days)",
		stats: () => userdata.married.duration,
		detection: { keyword: "stay married" },
		// FIXME - Load on the church?
		requirements: { pages: ["home"] },
	},
	{
		name: "Points sold",
		stats: () => userdata.personalstats.pointssold,
		detection: { keyword: "points on the market" },
		// FIXME - Load on the points market?
		requirements: { pages: ["home"] },
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
		stats: () => userdata.personalstats.refills,
		detection: { keyword: "refill", include: ["energy"] },
		// FIXME - Load on the point usage?
		requirements: { pages: ["home"] },
	},
	{
		name: "Nerve refills",
		stats: () => userdata.personalstats.nerverefills,
		detection: { keyword: "refill", include: ["nerve"] },
		// FIXME - Load on the point usage?
		requirements: { pages: ["home"] },
	},
	{
		name: "Casino refills",
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
];
