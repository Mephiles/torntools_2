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
		requirements: { pages: ["home", "points-market"] },
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
		requirements: { pages: ["home", "bazaar"] },
	},
	{
		name: "Stock payouts",
		stats: () => userdata.personalstats.stockpayouts,
		detection: { keyword: "payouts" },
		requirements: { pages: ["home", "stocks"] },
	},
	{
		name: "Donator (days)",
		stats: () => userdata.personalstats.daysbeendonator,
		detection: { keyword: "donator" },
		requirements: { pages: ["home", "donator"] },
	},
	{
		name: "Energy refills",
		group: "refills",
		stats: () => userdata.personalstats.refills,
		detection: { keyword: "refill", include: ["energy"] },
		requirements: { pages: ["home", "points"] },
	},
	{
		name: "Nerve refills",
		group: "refills",
		stats: () => userdata.personalstats.nerverefills,
		detection: { keyword: "refill", include: ["nerve"] },
		requirements: { pages: ["home", "points"] },
	},
	{
		name: "Casino refills",
		group: "refills",
		stats: () => userdata.personalstats.tokenrefills,
		detection: { keyword: "refill", include: ["casino"] },
		requirements: { pages: ["home", "points"] },
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
		type: "bachelor",
		stats: () => (userdata.education_completed.includes(42) ? 1 : 0),
		detection: { goals: [{ score: 1, type: "honors", id: 53 }] },
		requirements: { pages: ["education"] },
	},
	{
		name: "Business Bachelor",
		type: "bachelor",
		stats: () => (userdata.education_completed.includes(13) ? 1 : 0),
		detection: { goals: [{ score: 1, type: "honors", id: 54 }] },
		requirements: { pages: ["education"] },
	},
	{
		name: "Combat Bachelor",
		type: "bachelor",
		stats: () => (userdata.education_completed.includes(87) ? 1 : 0),
		detection: { goals: [{ score: 1, type: "honors", id: 55 }] },
		requirements: { pages: ["education"] },
	},
	{
		name: "ICT Bachelor",
		type: "bachelor",
		stats: () => (userdata.education_completed.includes(62) ? 1 : 0),
		detection: { goals: [{ score: 1, type: "honors", id: 56 }] },
		requirements: { pages: ["education"] },
	},
	{
		name: "General Bachelor",
		type: "bachelor",
		stats: () => (userdata.education_completed.includes(121) ? 1 : 0),
		detection: { goals: [{ score: 1, type: "honors", id: 58 }] },
		requirements: { pages: ["education"] },
	},
	{
		name: "Fitness Bachelor",
		type: "bachelor",
		stats: () => (userdata.education_completed.includes(111) ? 1 : 0),
		detection: { goals: [{ score: 1, type: "honors", id: 59 }] },
		requirements: { pages: ["education"] },
	},
	{
		name: "History Bachelor",
		type: "bachelor",
		stats: () => (userdata.education_completed.includes(21) ? 1 : 0),
		detection: { goals: [{ score: 1, type: "honors", id: 60 }] },
		requirements: { pages: ["education"] },
	},
	{
		name: "Law Bachelor",
		type: "bachelor",
		stats: () => (userdata.education_completed.includes(102) ? 1 : 0),
		detection: { goals: [{ score: 1, type: "honors", id: 61 }] },
		requirements: { pages: ["education"] },
	},
	{
		name: "Mathematics Bachelor",
		type: "bachelor",
		stats: () => (userdata.education_completed.includes(33) ? 1 : 0),
		detection: { goals: [{ score: 1, type: "honors", id: 62 }] },
		requirements: { pages: ["education"] },
	},
	{
		name: "Psychology Bachelor",
		type: "bachelor",
		stats: () => (userdata.education_completed.includes(69) ? 1 : 0),
		detection: { goals: [{ score: 1, type: "honors", id: 63 }] },
		requirements: { pages: ["education"] },
	},
	{
		name: "Defense Bachelor",
		type: "bachelor",
		stats: () => (userdata.education_completed.includes(42) ? 1 : 0),
		detection: { goals: [{ score: 1, type: "honors", id: 57 }] },
		requirements: { pages: ["education"] },
	},
	{
		name: "Sports Bachelor",
		type: "bachelor",
		stats: () => (userdata.education_completed.includes(51) ? 1 : 0),
		detection: { goals: [{ score: 1, type: "honors", id: 64 }] },
		requirements: { pages: ["education"] },
	},
	{
		name: "Org. crimes",
		stats: () => userdata.personalstats.organisedcrimes,
		detection: { keyword: "organized crimes" },
		requirements: { pages: ["factions"] },
	},
	{
		name: "Respect",
		stats: () => userdata.personalstats.respectforfaction,
		detection: { keyword: "respect", include: ["earn"] },
		requirements: { pages: ["factions"] },
	},
	{
		name: "Revives",
		stats: () => userdata.personalstats.revives,
		detection: { keyword: "respect", exclude: ["within", "someone"] },
		requirements: { pages: ["hospital"] },
	},
	{
		name: "Cannabis",
		type: "drugs",
		stats: () => userdata.personalstats.cantaken,
		detection: { keyword: "cannabis", include: ["use"] },
		requirements: { pages: ["item"] },
	},
	{
		name: "Ecstasy",
		type: "drugs",
		stats: () => userdata.personalstats.exttaken,
		detection: { keyword: "ecstasy" },
		requirements: { pages: ["item"] },
	},
	{
		name: "Ketamine",
		type: "drugs",
		stats: () => userdata.personalstats.kettaken,
		detection: { keyword: "ketamine" },
		requirements: { pages: ["item"] },
	},
	{
		name: "LSD",
		type: "drugs",
		stats: () => userdata.personalstats.lsdtaken,
		detection: { keyword: "lsd" },
		requirements: { pages: ["item"] },
	},
	{
		name: "Opium",
		type: "drugs",
		stats: () => userdata.personalstats.opitaken,
		detection: { keyword: "opium" },
		requirements: { pages: ["item"] },
	},
	{
		name: "Shrooms",
		type: "drugs",
		stats: () => userdata.personalstats.shrtaken,
		detection: { keyword: "shrooms" },
		requirements: { pages: ["item"] },
	},
	{
		name: "Speed",
		type: "drugs",
		stats: () => userdata.personalstats.spetaken,
		detection: { keyword: "speed", exclude: ["gain"] },
		requirements: { pages: ["item"] },
	},
	{
		name: "PCP",
		type: "drugs",
		stats: () => userdata.personalstats.pcptaken,
		detection: { keyword: "pcp" },
		requirements: { pages: ["item"] },
	},
	{
		name: "Xanax",
		type: "drugs",
		stats: () => userdata.personalstats.xantaken,
		detection: { keyword: "xanax" },
		requirements: { pages: ["item"] },
	},
	{
		name: "Vicodin",
		type: "drugs",
		stats: () => userdata.personalstats.victaken,
		detection: { keyword: "vicodin" },
		requirements: { pages: ["item"] },
	},
	{
		name: "Viruses",
		stats: () => userdata.personalstats.virusescoded,
		detection: { keyword: "viruses" },
		requirements: { pages: ["item"] },
	},
	{
		name: "Fill blood",
		stats: () => userdata.personalstats.bloodwithdrawn,
		detection: { keyword: "blood", include: ["fill"] },
		requirements: { pages: ["item"] },
	},
	{
		name: "Items dumped",
		stats: () => userdata.personalstats.itemsdumped,
		detection: { keyword: "items", include: ["trash"] },
		requirements: { pages: ["item"] },
	},
	{
		name: "Alcohol used",
		stats: () => userdata.personalstats.alcoholused,
		detection: { keyword: "alcohol" },
		requirements: { pages: ["item"] },
	},
	{
		name: "Candy used",
		stats: () => userdata.personalstats.candyused,
		detection: { keyword: "candy" },
		requirements: { pages: ["item"] },
	},
	{
		name: "Medicals used",
		stats: () => userdata.personalstats.medicalitemsused,
		detection: { keyword: "medical items", include: ["use"] },
		requirements: { pages: ["item"] },
	},
	{
		name: "Energy drinks used",
		stats: () => userdata.personalstats.energydrinkused,
		detection: { keyword: "energy drink" },
		requirements: { pages: ["item"] },
	},
	{
		name: "Busts",
		stats: () => userdata.personalstats.peoplebusted,
		detection: { keyword: "bust" },
		requirements: { pages: ["jail"] },
	},
	{
		name: "Bails",
		stats: () => userdata.personalstats.peoplebought,
		detection: { keyword: "bails" },
		requirements: { pages: ["jail"] },
	},
	{
		name: "Attacks won",
		stats: () => userdata.personalstats.attackswon,
		detection: { keyword: "attacks", include: ["win"] },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Defends won",
		stats: () => userdata.personalstats.defendswon,
		detection: { keyword: "defend", exclude: ["achieve", "someone", "and"] },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Assists",
		stats: () => userdata.personalstats.attacksassisted,
		detection: { keyword: "assist", include: ["attacks"], goals: [{ score: 1, type: "honors", id: 639 }] },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Stealthed",
		stats: () => userdata.personalstats.attacksstealthed,
		detection: { keyword: "stealthed attacks" },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Stalemates",
		stats: () => userdata.personalstats.defendsstalemated + userdata.personalstats.attacksdraw,
		detection: { keyword: "stalemate" },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Escapes",
		stats: () => userdata.personalstats.yourunaway,
		detection: { keyword: "escape", include: ["successfully", "foes"] },
		requirements: { pages: ["missions"] },
	},
	{ name: "Unarmored wins", stats: () => userdata.personalstats.unarmoredwon, detection: { keyword: "unarmored" }, requirements: { pages: ["missions"] } },
	{
		name: "Current killstreak",
		type: "killstreak",
		stats: () => userdata.personalstats.killstreak,
		requirements: { pages: ["missions"] },
	},
	{
		name: "Best streak",
		type: "killstreak",
		stats: () => userdata.personalstats.bestkillstreak,
		detection: { keyword: "streak", exclude: ["high-low"] },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Total hits",
		stats: () => userdata.personalstats.attackhits,
		detection: { keyword: "hits", exclude: ["critical", "finishing"] },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Critical hits",
		stats: () => userdata.personalstats.attackcriticalhits,
		detection: { keyword: "critical" },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Best damage",
		stats: () => userdata.personalstats.bestdamage,
		detection: { keyword: "damage", include: ["deal at least"] },
		requirements: { pages: ["missions"] },
	},
	{
		name: "One hit kills",
		stats: () => userdata.personalstats.onehitkills,
		detection: { keyword: "one hit", include: ["kills"] },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Rounds fired",
		stats: () => userdata.personalstats.roundsfired,
		detection: { keyword: "rounds", include: ["fire"] },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Clubbing hits",
		type: "finishing hits",
		stats: () => userdata.personalstats.axehits,
		detection: { keyword: "clubbing" },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Pistol hits",
		type: "finishing hits",
		stats: () => userdata.personalstats.pishits,
		detection: { keyword: "pistols" },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Rifle hits",
		type: "finishing hits",
		stats: () => userdata.personalstats.rifhits,
		detection: { keyword: "rifles" },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Shotgun hits",
		type: "finishing hits",
		stats: () => userdata.personalstats.shohits,
		detection: { keyword: "shotguns" },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Piercing hits",
		type: "finishing hits",
		stats: () => userdata.personalstats.piehits,
		detection: { keyword: "piercing", include: ["weapons"] },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Slashing hits",
		type: "finishing hits",
		stats: () => userdata.personalstats.slahits,
		detection: { keyword: "slashing" },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Heavy hits",
		type: "finishing hits",
		stats: () => userdata.personalstats.heahits,
		detection: { keyword: "heavy artillery" },
		requirements: { pages: ["missions"] },
	},
	{
		name: "SMG hits",
		type: "finishing hits",
		stats: () => userdata.personalstats.smghits,
		detection: { keyword: "smgs" },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Machine gun hits",
		type: "finishing hits",
		stats: () => userdata.personalstats.machits,
		detection: { keyword: "machine guns" },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Fists or kick hits",
		type: "finishing hits",
		stats: () => userdata.personalstats.h2hhits,
		detection: { keyword: "fists or kick" },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Mechanical hits",
		type: "finishing hits",
		stats: () => userdata.personalstats.chahits,
		detection: { keyword: "mechanical weapons" },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Temporary hits",
		type: "finishing hits",
		stats: () => userdata.personalstats.grehits,
		detection: { keyword: "temporary weapons" },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Largest mug",
		stats: () => userdata.personalstats.largestmug,
		detection: { keyword: "mugging", include: ["make", "single"] },
		requirements: { pages: ["missions"] },
	},
	{
		name: "Mission credits",
		stats: () => userdata.personalstats.missioncreditsearned,
		detection: { keyword: "credits", include: ["mission"] },
		requirements: { pages: ["missions"] },
	},
	{ name: "Contracts", stats: () => userdata.personalstats.contractscompleted, detection: { keyword: "contracts" }, requirements: { pages: ["missions"] } },
	{
		name: "Races won",
		stats: () => userdata.personalstats.raceswon,
		detection: { keyword: "races", include: ["win"], exclude: ["single car"] },
		requirements: { pages: ["racing"] },
	},
	{
		name: "Racing skill",
		stats: () => userdata.personalstats.racingskill,
		detection: { keyword: "racing", include: ["skill"] },
		requirements: { pages: ["racing"] },
	},
	{
		name: "Points",
		stats: () => userdata.personalstats.racingpointsearned,
		detection: { keyword: "racing", include: ["points"] },
		requirements: { pages: ["racing"] },
	},
	{ name: "Argentina", stats: () => userdata.personalstats.argtravel, detection: { keyword: "argentina" }, requirements: { pages: ["travelagency"] } },
	{ name: "Canada", stats: () => userdata.personalstats.cantravel, detection: { keyword: "canada" }, requirements: { pages: ["travelagency"] } },
	{ name: "Caymans", stats: () => userdata.personalstats.caytravel, detection: { keyword: "cayman" }, requirements: { pages: ["travelagency"] } },
	{ name: "China", stats: () => userdata.personalstats.chitravel, detection: { keyword: "china" }, requirements: { pages: ["travelagency"] } },
	{ name: "UAE", stats: () => userdata.personalstats.dubtravel, detection: { keyword: "united arab emirates" }, requirements: { pages: ["travelagency"] } },
	{ name: "Hawaii", stats: () => userdata.personalstats.hawtravel, detection: { keyword: "hawaii" }, requirements: { pages: ["travelagency"] } },
	{ name: "Japan", stats: () => userdata.personalstats.japtravel, detection: { keyword: "japan" }, requirements: { pages: ["travelagency"] } },
	{ name: "UK", stats: () => userdata.personalstats.lontravel, detection: { keyword: "kingdom" }, requirements: { pages: ["travelagency"] } },
	{ name: "Mexico", stats: () => userdata.personalstats.mextravel, detection: { keyword: "mexico" }, requirements: { pages: ["travelagency"] } },
	{ name: "South Africa", stats: () => userdata.personalstats.soutravel, detection: { keyword: "south africa" }, requirements: { pages: ["travelagency"] } },
	{ name: "Switzerland", stats: () => userdata.personalstats.switravel, detection: { keyword: "switzerland" }, requirements: { pages: ["travelagency"] } },
	{
		name: "Times traveled",
		stats: () => userdata.personalstats.traveltimes,
		detection: { keyword: "travel", exclude: ["to"] },
		requirements: { pages: ["travelagency"] },
	},
	{
		name: "Days traveled",
		stats: () => Math.floor(userdata.personalstats.traveltime / (TO_MILLIS.DAYS / TO_MILLIS.SECONDS)),
		detection: { keyword: "spend", include: ["days", "air"] },
		requirements: { pages: ["travelagency"] },
	},
	{
		name: "Items bought abroad",
		stats: () => userdata.personalstats.itemsboughtabroad,
		detection: { keyword: "import", include: ["items"] },
		requirements: { pages: ["travelagency"] },
	},
];
