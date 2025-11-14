document.addEventListener("DOMContentLoaded", () => {
	const toggleButton = document.querySelector("[data-upload-toggle]");
	const panel = document.querySelector("[data-upload-panel]");
	const closeButton = panel?.querySelector("[data-upload-close]");
	const optionButtons = panel?.querySelectorAll("[data-upload-option]") ?? [];

	if (!toggleButton || !panel) {
		return;
	}

	const openPanel = () => {
		panel.classList.add("is-visible");
		toggleButton.setAttribute("aria-expanded", "true");
		panel.setAttribute("aria-hidden", "false");
	};

	const closePanel = () => {
		panel.classList.remove("is-visible");
		toggleButton.setAttribute("aria-expanded", "false");
		panel.setAttribute("aria-hidden", "true");
	};

	toggleButton.addEventListener("click", (event) => {
		event.stopPropagation();
		if (panel.classList.contains("is-visible")) {
			closePanel();
			return;
		}
		openPanel();
	});

	closeButton?.addEventListener("click", closePanel);

	optionButtons.forEach((button) => {
		button.addEventListener("click", () => {
			const selection = button.getAttribute("data-upload-option");
			console.info(`Opción seleccionada: ${selection}`);
			closePanel();
		});
	});

	document.addEventListener("click", (event) => {
		if (!panel.classList.contains("is-visible")) {
			return;
		}

		const target = event.target;
		const clickedOutside = !panel.contains(target) && !toggleButton.contains(target);

		if (clickedOutside) {
			closePanel();
		}
	});
});
