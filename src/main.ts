import { createForm } from "./builder.js"
import { createElement } from "./util.js"

createForm()

const preview = createElement("div", { id: "preview" })

document.body.appendChild(preview)