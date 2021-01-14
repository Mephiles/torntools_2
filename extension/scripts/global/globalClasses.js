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
			runWhenDisabled: boolean
		}
	*/
	constructor() {
		this.features = [];
		this.createPopup();
	}

	createPopup() {
		document.find('.content').appendChild(document.newElement({
			id: 'tt-page-status',
			type: 'div',
			children: [
				document.newElement({
					type: 'div',
					class: 'tt-page-status-header',
					children: [
						document.newElement({
							type: 'span',
							text: 'TornTools activated'
						}),
						document.newElement({
							type: 'i',
							class: 'icon fas fa-caret-down'
						})
					]
				})
			]
		}));
	}

	async load(feature) {
		console.log('Loading feature:', feature.name);
		for (let _feature in this.features) {
			if (_feature.name === feature.name) {
				_feature = feature;  // Update the previous entry
			}
		}

		if (!feature.enabled) {
			console.log('Feature disabled:', feature.name);
			this.addResult({ enabled: false, name: feature.name });
			if (feature.runWhenDisabled) feature.func();
			return;
		}

		await new Promise((resolve, reject) => {
			feature.func()
				.then(() => {
					console.log('Successfully loaded feature:', feature.name);
					this.addResult({ success: true, name: feature.name })
					return resolve();
				})
				.catch(error => {
					console.log('Feature failed to load:', error);
					this.addResult({ success: false, name: feature.name })
					return resolve();
				})
		});
	}

	reload(name) {
		console.log('reloading', name);
		for (let _feature in this.features) {
			if (_feature.name === name) {
				console.log('found', _feature);
				this.load(_feature);
			}
		}
	}

	addResult(options) {
		let newRow;
		if (document.find(`tt-page-status-feature-${options.name.toLowerCase().replace(/ /g, '-')}`)) {
			newRow = document.find(`tt-page-status-feature-${options.name.toLowerCase().replace(/ /g, '-')}`);
		} else {
			newRow = document.newElement({
				type: 'div',
				class: 'tt-page-status-feature',
				id: `tt-page-status-feature-${options.name.toLowerCase().replace(/ /g, '-')}`
			});
			document.find(`#tt-page-status`).appendChild(newRow);
		}

		if (options.enabled === false) newRow.innerHTML = `<span class="tt-page-status-feature-icon disabled"><i class="fas fa-times-circle"></i></span><span class='tt-page-status-feature-text'>${options.name}</span>`;
		else if (options.success) newRow.innerHTML = `<span class="tt-page-status-feature-icon success"><i class="fas fa-check"></i></span><span class='tt-page-status-feature-text'>${options.name}</span>`;
		else newRow.innerHTML = `<span class="tt-page-status-feature-icon failed"><i class="fas fa-times-circle"></i></span><span class='tt-page-status-feature-text'>${options.name}</span>`;
	}

	clear() {
		for (let element of document.findAll('.tt-page-status-feature')) {
			element.remove();
		}
	}
}