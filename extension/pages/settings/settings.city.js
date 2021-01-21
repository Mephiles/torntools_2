export function cityOptionsFromHtmlToSettings(settings, preferencesElement) {
	settings.pages.city.enable = preferencesElement.find("#city-items").checked;
	settings.pages.city.closedHighlight = preferencesElement.find("#city-closed_highlight").checked;
	settings.pages.city.showValue = preferencesElement.find("#city-items_value").checked;
}

export function cityOptionsFromSettingsToHtml(settings, preferencesElement) {
	preferencesElement.find("#city-items").checked = settings.pages.city.enable;
	preferencesElement.find("#city-closed_highlight").checked = settings.pages.city.closedHighlight;
	preferencesElement.find("#city-items_value").checked = settings.pages.city.showValue;
}