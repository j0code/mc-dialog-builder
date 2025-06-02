import { createForm } from "./builder.js"
import { createControls } from "./controls.js"
import { createDraggableBorder } from "./draggable_border.js"
import { loadSettings } from "./idb.js"
import { previewDialog } from "./preview.js"
import { createElement } from "./util.js"

document.addEventListener("DOMContentLoaded", async () => {
	const settings = await loadSettings()
	const builderContainer = createElement("div", { id: "builder-container" })
	builderContainer.style.width = `${settings.uiRatio}vw`

	const form = createForm()
	builderContainer.appendChild(form)

	const controls = createControls(form, settings)
	builderContainer.appendChild(controls)

	document.body.appendChild(builderContainer)

	await createDraggableBorder(builderContainer)

	const preview = createElement("div", { id: "preview" })
	document.body.appendChild(preview)
	previewDialog()
})