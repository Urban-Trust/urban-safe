async function loadHelpOverlay(options = {}) {
	const {
		triggerSelector = '[data-help-trigger]',
		containerSelector = 'body',
		partialPath = 'ayuda.html',
		stylePath = 'assets/styles/ayuda.css'
	} = options; // (HU-52) Configuración por defecto para el overlay

	const container = document.querySelector(containerSelector);
	const triggers = document.querySelectorAll(triggerSelector);
	if (!container || !triggers.length) return;

	ensureHelpStylesheet(stylePath); // (HU-52) Inyecta la hoja de estilos cuando aún no está presente

	try {
		let layer = container.querySelector('.help-layer');
		if (!layer) {
			const response = await fetch(partialPath);
			if (!response.ok) throw new Error('No se pudo cargar el overlay');

			const html = await response.text();
			const template = document.createElement('template');
			template.innerHTML = html.trim();

			container.appendChild(template.content.cloneNode(true));
			layer = container.querySelector('.help-layer');
		}

		const closeBtn = layer?.querySelector('.help-close');

		const openOverlay = () => layer?.classList.remove('is-hidden');
		const closeOverlay = () => layer?.classList.add('is-hidden');

		triggers.forEach((trigger) => {
			trigger.addEventListener('click', (event) => {
				event?.preventDefault();
				openOverlay();
			});
		});

		closeBtn?.addEventListener('click', closeOverlay);
		layer?.addEventListener('click', (event) => {
			if (event.target === layer) closeOverlay();
		});
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') closeOverlay();
		});
	} catch (error) {
		console.error('[HelpOverlay]', error);
	}
}

function ensureHelpStylesheet(href) {
	if (!href) return;
	const existing = document.querySelector('link[data-help-style="true"]');
	if (existing) return;
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = href;
	link.dataset.helpStyle = 'true';
	document.head.appendChild(link); // (HU-52) Marca la hoja para evitar duplicados
}

document.addEventListener('DOMContentLoaded', () => {
	loadHelpOverlay();
});
