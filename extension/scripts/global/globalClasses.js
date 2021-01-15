"use strict";

class DefaultSetting {
	constructor(options) {
		for (let option in options) {
			this[option] = options[option];
		}
	}
}

class FeatureManager {
	/*
		feature = {
			name: string,
			enabled: boolean,
			func: function,
			runWhenDisabled: boolean,
			scope: string 
		}
	*/

	constructor() {
		this.features = [];
		this.popupLoaded = false;
		this.resultQueue = [];
	}

	createPopup() {
		let containerID = "tt-page-status";
		let collapsed = containerID in filters.containers ? filters.containers[containerID] : false;

		document.find(".content").appendChild(
			document.newElement({
				id: containerID,
				type: "div",
				children: [
					document.newElement({
						type: "div",
						class: `tt-page-status-header ${collapsed ? "collapsed" : ""}`,
						children: [
							document.newElement({
								type: "span",
								text: "TornTools activated",
							}),
							document.newElement({
								type: "i",
								class: "icon fas fa-caret-down",
							}),
						],
					}),
					document.newElement({
						type: "div",
						class: "tt-page-status-content",
					}),
				],
			})
		);

		document.find(".tt-page-status-header").onclick = function () {
			this.classList.toggle("collapsed");
			ttStorage.change({ filters: { containers: { [containerID]: this.classList.contains("collapsed") } } });
		};

		this.popupLoaded = true;

		if (this.resultQueue.length > 0) {
			for (let item of this.resultQueue) this.addResult(item);
		}
	}

	new(feature) {
		console.log("Adding feature:", feature);
		// Check if feature is in list
		let updated = false;
		for (let _feature of this.features) {
			if (_feature.name === feature.name) {
				console.log("	updating previous entry");
				this.features[this.features.indexOf(_feature)] = feature; // update previous entry
				updated = true;
			}
		}

		if (!updated) {
			this.features.push(feature);
		}
	}

	findFeatureByName(name) {
		return this.features.filter((feature) => feature.name === name)[0];
	}

	async load(name) {
		console.log("this.features", this.features);
		console.log("Loading feature:", name);
		let feature = this.findFeatureByName(name);
		console.log("feature:", feature);

		// Feature is disabled
		if (!feature.enabled) {
			console.log("Feature disabled:", feature.name);
			this.addResult({ enabled: false, name: feature.name });
			if (feature.runWhenDisabled) feature.func();
			return;
		}

		// Feature enabled but no func to run
		if (!feature.func) {
			this.addResult({ success: true, name: feature.name });
			return;
		}

		await new Promise((resolve, reject) => {
			feature
				.func()
				.then(() => {
					console.log("Successfully loaded feature:", feature.name);
					this.addResult({ success: true, name: feature.name });
					return resolve();
				})
				.catch((error) => {
					console.error("Feature failed to load:", error);
					this.addResult({ success: false, name: feature.name });
					return resolve();
				});
		});
	}

	reload(name) {
		console.log("Reloading feature:", name);
		let feature = this.findFeatureByName(name);
		this.load(feature);
	}

	addResult(options) {
		if (!this.popupLoaded) {
			this.resultQueue.push(options);
			return;
		}

		let newRow;
		if (document.find(`#tt-page-status-feature-${options.name.toLowerCase().replace(/ /g, "-")}`)) {
			newRow = document.find(`#tt-page-status-feature-${options.name.toLowerCase().replace(/ /g, "-")}`);
		} else {
			newRow = document.newElement({
				type: "div",
				class: "tt-page-status-feature",
				id: `tt-page-status-feature-${options.name.toLowerCase().replace(/ /g, "-")}`,
			});
			document.find(`.tt-page-status-content`).appendChild(newRow);
		}

		if (options.enabled === false)
			newRow.innerHTML = `<span class="tt-page-status-feature-icon disabled"><i class="fas fa-times-circle"></i></span><span class='tt-page-status-feature-text'>${options.name}</span>`;
		else if (options.success)
			newRow.innerHTML = `<span class="tt-page-status-feature-icon success"><i class="fas fa-check"></i></span><span class='tt-page-status-feature-text'>${options.name}</span>`;
		else
			newRow.innerHTML = `<span class="tt-page-status-feature-icon failed"><i class="fas fa-times-circle"></i></span><span class='tt-page-status-feature-text'>${options.name}</span>`;
	}

	removeResult(name) {
		document.find(`.tt-page-status-feature-${name.toLowerCase().replace(/ /g, " - ")}`).remove();
	}

	clear() {
		for (let element of document.findAll(".tt-page-status-feature")) {
			element.remove();
		}
	}
}
