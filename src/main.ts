import { createForm } from "./builder.js"
import { createDraggableBorder } from "./draggable_border.js"
import { createElement } from "./util.js"

document.addEventListener("DOMContentLoaded", () => {
	const form = createForm()
	createDraggableBorder(form)

	const preview = createElement("div", { id: "preview" })

	document.body.appendChild(preview)
})