import { createForm } from "./builder.js"
import { createControls } from "./controls.js"
import { createDraggableBorder } from "./draggable_border.js"
import { createElement } from "./util.js"

document.addEventListener("DOMContentLoaded", () => {
	const builderContainer = createElement("div", { id: "builder-container" })

	const form = createForm()
	builderContainer.appendChild(form)

	const controls = createControls(form)
	builderContainer.appendChild(controls)

	document.body.appendChild(builderContainer)

	createDraggableBorder(builderContainer)

	const preview = createElement("div", { id: "preview" })
	document.body.appendChild(preview)
})