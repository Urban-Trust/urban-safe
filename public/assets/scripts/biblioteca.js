// Inicializa toda la experiencia de biblioteca una vez que el DOM está listo.
document.addEventListener("DOMContentLoaded", () => {
	// Catálogo base usado para poblar los pickers y simular adjuntos.
	const projectAssets = [
		{
			id: "asset-img-1",
			label: "Adjuntar imagen 1",
			path: "assets/images/adjuntar-imagen-1.jpg",
			type: "Imagen",
			size: "1.2 MB",
			thumb: "assets/images/adjuntar-imagen-1.jpg",
		},
		{
			id: "asset-img-2",
			label: "Adjuntar imagen 2",
			path: "assets/images/adjuntar-imagen-2.jpg",
			type: "Imagen",
			size: "1.1 MB",
			thumb: "assets/images/adjuntar-imagen-2.jpg",
		},
		{
			id: "asset-img-casa",
			label: "Patrulla en casa",
			path: "assets/images/adjuntar-imagen-casa.jpg",
			type: "Imagen",
			size: "980 KB",
			thumb: "assets/images/adjuntar-imagen-casa.jpg",
		},
		{
			id: "asset-map",
			label: "Mapa de patrulla",
			path: "assets/images/mapabg.png",
			type: "Imagen",
			size: "1.4 MB",
			thumb: "assets/images/mapabg.png",
		},
		{
			id: "asset-legal",
			label: "Protocolo legal PDF",
			path: "assets/documents/legal.pdf",
			type: "PDF",
			size: "540 KB",
			thumb: "assets/images/adjuntar-imagen-3.jpg",
		},
	];

	// Referencias a todos los nodos que se manipulan en la UI.
	const toggleButton = document.querySelector("[data-upload-toggle]");
	const panel = document.querySelector("[data-upload-panel]");
	const closeButton = panel?.querySelector("[data-upload-close]");
	const optionButtons = panel?.querySelectorAll("[data-upload-option]") ?? [];
	const overlay = document.querySelector("[data-protocol-overlay]");
	const protocolForm = document.querySelector("[data-protocol-form]");
	const overlayClose = document.querySelector("[data-protocol-close]");
	const protocolTitle = document.querySelector("[data-protocol-title]");
	const protocolDescription = document.querySelector("[data-protocol-description]");
	const protocolStep = document.querySelector("[data-protocol-step]");
	const protocolType = document.querySelector("[data-protocol-type]");
	const fileCountBadge = document.querySelector("[data-file-count]");
	const pickerLabel = document.querySelector("[data-picker-label]");
	const assetSummary = document.querySelector("[data-asset-summary]");
	const protocolAssetButton = document.querySelector("[data-asset-picker='protocol']");
	const documentList = document.querySelector(".document-list");
	const assetOverlay = document.querySelector("[data-asset-overlay]");
	const assetGrid = document.querySelector("[data-asset-grid]");
	const assetCloseButton = document.querySelector("[data-asset-close]");
	const downloadOverlay = document.querySelector("[data-download-overlay]");
	const downloadTitleEl = document.querySelector("[data-download-title]");
	const downloadMessageEl = document.querySelector("[data-download-message]");
	const downloadConfirmBtn = document.querySelector("[data-download-confirm]");
	const downloadDismissBtn = document.querySelector("[data-download-dismiss]");
	const downloadCloseBtn = document.querySelector("[data-download-close]");
	const statusOverlay = document.querySelector("[data-status-overlay]");
	const statusMessageEl = document.querySelector("[data-status-message]");
	const statusCloseBtn = document.querySelector("[data-status-close]");

	// Gestiona las insignias que indican que hay un documento nuevo.
	const addInlineIndicator = (item) => {
		const titleEl = item?.querySelector?.(".doc-title");
		if (!titleEl || titleEl.querySelector(".doc-new-indicator")) {
			return;
		}
		const indicator = document.createElement("span");
		indicator.className = "doc-new-indicator";
		indicator.setAttribute("aria-label", "Documento listo para descargar");
		indicator.textContent = "!";
		titleEl.appendChild(indicator);
	};

	const removeInlineIndicator = (item) => {
		const indicator = item?.querySelector?.(".doc-new-indicator");
		indicator?.remove();
	};

	// Marca un elemento como nuevo hasta que el usuario descargue el archivo.
	const markDocumentAsNew = (item) => {
		if (!item) {
			return;
		}
		item.classList.add("is-new");
		addInlineIndicator(item);
	};

	// Limpia el estado "nuevo" después de que se pulse descargar.
	const clearNewAlert = (item) => {
		if (!item) {
			return;
		}
		item.classList.remove("is-new");
		removeInlineIndicator(item);
	};

	// Estado interno compartido entre paneles.
	let currentAssetContext = null; // "global" | "protocol"
	let selectedProtocolAsset = null;
	let pendingDownload = null;

	if (!toggleButton || !panel) {
		return;
	}

	// Control del panel flotante para escoger tipo de carga.
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
			if (selection === "protocol") {
				openProtocolModal();
			} else if (selection === "file") {
				openAssetOverlay("global");
			}
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

	protocolAssetButton?.addEventListener("click", () => {
		openAssetOverlay("protocol");
	});

	// Muestra/Oculta el formulario para crear protocolos.
	const openProtocolModal = () => {
		if (!overlay) {
			return;
		}
		overlay.classList.add("is-visible");
		overlay.setAttribute("aria-hidden", "false");
		protocolTitle?.focus();
	};

	const closeProtocolModal = () => {
		if (!overlay) {
			return;
		}
		overlay.classList.remove("is-visible");
		overlay.setAttribute("aria-hidden", "true");
	};

	overlayClose?.addEventListener("click", closeProtocolModal);

	overlay?.addEventListener("click", (event) => {
		if (event.target === overlay) {
			closeProtocolModal();
		}
	});

	// Al guardar un protocolo se crea una nueva tarjeta en la lista.
	protocolForm?.addEventListener("submit", (event) => {
		event.preventDefault();
		if (!documentList || !protocolTitle || !protocolDescription) {
			return;
		}

		const title = protocolTitle.value.trim();
		const description = protocolDescription.value.trim();
		const step = protocolStep?.value ?? "Paso 1";
		const type = protocolType?.value ?? "Emergencia";
		const assetDetail = selectedProtocolAsset ? ` • Archivo: ${selectedProtocolAsset.label}` : "";

		if (!title || !description) {
			return;
		}

		const listItem = document.createElement("li");
		listItem.className = "document-item";
		listItem.innerHTML = `
			<div>
				<p class="doc-title">${title}</p>
				<p class="doc-meta">${step} • ${type}${assetDetail}</p>
			</div>
			<button class="download-btn" type="button">Descargar</button>
		`;

		documentList.prepend(listItem);
		markDocumentAsNew(listItem);
		protocolForm.reset();
		clearProtocolAsset();
		closeProtocolModal();
	});

	// Selector reutilizable para adjuntar archivos desde la galería mock.
	const openAssetOverlay = (context) => {
		if (!assetOverlay) {
			return;
		}
		currentAssetContext = context;
		renderAssetGrid();
		assetOverlay.classList.add("is-visible");
		assetOverlay.setAttribute("aria-hidden", "false");
	};

	const closeAssetOverlay = () => {
		if (!assetOverlay) {
			return;
		}
		assetOverlay.classList.remove("is-visible");
		assetOverlay.setAttribute("aria-hidden", "true");
		currentAssetContext = null;
	};

	// Genera la grilla de cartas con todos los assets disponibles.
	const renderAssetGrid = () => {
		if (!assetGrid) {
			return;
		}
		assetGrid.innerHTML = "";
		projectAssets.forEach((asset) => {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "asset-card";
			button.setAttribute("data-asset-id", asset.id);
			button.innerHTML = `
				<img src="${asset.thumb}" alt="${asset.label}" class="asset-thumb" />
				<p class="asset-label">${asset.label}</p>
				<p class="asset-meta">${asset.type} • ${asset.size}</p>
			`;
			button.addEventListener("click", () => handleAssetSelection(asset));
			assetGrid.appendChild(button);
		});
	};

	// Aplica la acción adecuada según si el adjunto era global o del protocolo.
	const handleAssetSelection = (asset) => {
		if (currentAssetContext === "global") {
			addDocumentFromAsset(asset);
		} else if (currentAssetContext === "protocol") {
			selectedProtocolAsset = asset;
			updateProtocolAssetUI();
		}
		closeAssetOverlay();
	};

	// Crea una entrada rápida cuando se adjunta algo desde el listado global.
	const addDocumentFromAsset = (asset) => {
		if (!documentList) {
			return;
		}
		const listItem = document.createElement("li");
		listItem.className = "document-item";
		listItem.innerHTML = `
			<div>
				<p class="doc-title">${asset.label}</p>
				<p class="doc-meta">${asset.type} • ${asset.size}</p>
			</div>
			<button class="download-btn" type="button">Descargar</button>
		`;
		documentList.prepend(listItem);
		markDocumentAsNew(listItem);
	};

	// Refresca los contadores y etiquetas del botón de adjunto en el modal.
	const updateProtocolAssetUI = () => {
		if (!fileCountBadge || !pickerLabel || !assetSummary) {
			return;
		}
		if (selectedProtocolAsset) {
			fileCountBadge.textContent = "1";
			pickerLabel.textContent = "Archivo listo";
			assetSummary.textContent = selectedProtocolAsset.label;
		} else {
			fileCountBadge.textContent = "0";
			pickerLabel.textContent = "Elegir archivo";
			assetSummary.textContent = "Sin archivo seleccionado";
		}
	};

	// Restaura el estado de selección de archivos dentro del formulario.
	const clearProtocolAsset = () => {
		selectedProtocolAsset = null;
		updateProtocolAssetUI();
	};

	assetCloseButton?.addEventListener("click", closeAssetOverlay);

	assetOverlay?.addEventListener("click", (event) => {
		if (event.target === assetOverlay) {
			closeAssetOverlay();
		}
	});

	// Maneja el flujo de descarga de cada doc agregado.
	documentList?.addEventListener("click", (event) => {
		const button = event.target.closest(".download-btn");
		if (!button) {
			return;
		}
		event.preventDefault();
		const documentItem = button.closest(".document-item");
		clearNewAlert(documentItem);
		const title = documentItem?.querySelector(".doc-title")?.textContent?.trim() ?? "Documento";
		showStatusOverlay(`El archivo "${title}" se descargó correctamente.`);
	});

	// Administra el modal de confirmación de descarga manual.
	const promptDownloadOverlay = (payload) => {
		if (!downloadOverlay || !downloadTitleEl || !downloadMessageEl) {
			return;
		}
		pendingDownload = payload;
		downloadTitleEl.textContent = "Documento listo";
		downloadMessageEl.textContent = payload?.message ?? "Tu archivo está listo para descargar.";
		downloadOverlay.classList.add("is-visible");
		downloadOverlay.setAttribute("aria-hidden", "false");
	};

	// Oculta el modal de confirmación y elimina la referencia del archivo en cola.
	const closeDownloadOverlay = () => {
		if (!downloadOverlay) {
			return;
		}
		downloadOverlay.classList.remove("is-visible");
		downloadOverlay.setAttribute("aria-hidden", "true");
		pendingDownload = null;
	};

	// Pequeño toast modal que avisa cuando una descarga se completa.
	const showStatusOverlay = (message) => {
		if (!statusOverlay || !statusMessageEl) {
			return;
		}
		statusMessageEl.textContent = message ?? "Descarga exitosa.";
		statusOverlay.classList.add("is-visible");
		statusOverlay.setAttribute("aria-hidden", "false");
	};

	// Permite cerrar manualmente el aviso de estado.
	const closeStatusOverlay = () => {
		if (!statusOverlay) {
			return;
		}
		statusOverlay.classList.remove("is-visible");
		statusOverlay.setAttribute("aria-hidden", "true");
	};

	// Normaliza textos para construir nombres de archivo seguros.
	const slugify = (text = "archivo") =>
		text
			.toLowerCase()
			.replace(/[^a-z0-9]+/gi, "-")
			.replace(/^-+|-+$/g, "") || "archivo";

	// Simula la descarga de archivos existentes o de contenido generado al vuelo.
	const simulateDownload = (payload) => {
		if (!payload) {
			return;
		}
		if (payload.path) {
			const link = document.createElement("a");
			link.href = payload.path;
			link.download = payload.path.split("/").pop() ?? slugify(payload.label);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			return;
		}
		if (payload.content) {
			const blob = new Blob([payload.content], { type: "text/plain" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = payload.filename ?? `${slugify(payload.label)}.txt`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			setTimeout(() => URL.revokeObjectURL(url), 1000);
		}
	};

	// Ejecuta la descarga simulada cuando el usuario confirma.
	downloadConfirmBtn?.addEventListener("click", () => {
		if (pendingDownload) {
			simulateDownload(pendingDownload);
			showStatusOverlay(`Descarga exitosa de "${pendingDownload.label}".`);
		}
		closeDownloadOverlay();
	});

	// Botones de cancelar/cerrar comparten este manejador para reutilizar lógica.
	const dismissDownloadOverlay = () => {
		closeDownloadOverlay();
	};

	downloadDismissBtn?.addEventListener("click", dismissDownloadOverlay);
	downloadCloseBtn?.addEventListener("click", dismissDownloadOverlay);
	downloadOverlay?.addEventListener("click", (event) => {
		if (event.target === downloadOverlay) {
			closeDownloadOverlay();
		}
	});

	statusCloseBtn?.addEventListener("click", closeStatusOverlay);
	statusOverlay?.addEventListener("click", (event) => {
		if (event.target === statusOverlay) {
			closeStatusOverlay();
		}
	});

	// Garantiza que el formulario empiece en estado limpio aunque no haya interacción.
	updateProtocolAssetUI();
});
