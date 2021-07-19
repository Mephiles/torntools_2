function createCheckboxDuo(options = {}) {
	options = {
		description: "",
		id: getUUID(),
		...options,
	};

	const yesCheckbox = createCheckbox({ description: "Y:", reverseLabel: true });
	const noCheckbox = createCheckbox({ description: "N:", reverseLabel: true });

	const checkboxWrapper = document.newElement({
		type: "div",
		class: "tt-checkbox-duo",
		children: [yesCheckbox.element, noCheckbox.element, document.newElement({ type: "label", text: options.description })],
		events: {
			click(event) {
				event.stopPropagation();
			},
		},
	});

	function setValue(value) {
		yesCheckbox.setChecked(value === "yes" || value === "both");
		noCheckbox.setChecked(value === "no" || value === "both");
	}

	function getValue() {
		const yes = yesCheckbox.isChecked();
		const no = noCheckbox.isChecked();

		if (yes && no) return "both";
		else if (yes) return "yes";
		else if (no) return "no";
		else return "";
	}

	function onChange(callback) {
		yesCheckbox.onChange(callback);
		noCheckbox.onChange(callback);
	}

	function dispose() {
		yesCheckbox.dispose();
		noCheckbox.dispose();
	}

	return {
		element: checkboxWrapper,
		setValue,
		getValue,
		onChange,
		dispose,
	};
}
