"use strict";

(async () => {
	if (!USER_INFORMATION.isFlying() && !USER_INFORMATION.isAbroad()) return;

	await loadDatabase();
	console.log("TT: Flying - Loading script. ");

	storageListeners.settings.push(loadFlying);
	loadFlying();

	console.log("TT: Flying - Script loaded.");
})();

function loadFlying() {}
