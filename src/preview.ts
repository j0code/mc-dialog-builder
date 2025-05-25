import { NBTCompound, TextComponent } from "./types.js"
import { createElement, readFormData } from "./util.js"

export function previewDialog() {
	const form = document.getElementById("dialog") as HTMLDetailsElement
	const preview = document.getElementById("preview") as HTMLDivElement
	const dialogData = readFormData(form)
	preview.innerHTML = "" // Clear previous preview content

	console.log("Dialog Data:", dialogData)
	
	const header = createHeader(dialogData.title || " ")
	const body = createBody(dialogData)
	const footer = createFooter(dialogData)
	
	preview.appendChild(header)
	preview.appendChild(body)
	preview.appendChild(footer)
}

function createHeader(title: string) {
	const element = createElement("div", { id: "preview-header" })
	const titleElement = createElement("span", { id: "preview-title" })

	titleElement.textContent = title

	element.appendChild(titleElement)
	return element
}

function createBody(dialogData: any) {
	const element = createElement("div", { id: "preview-body" })
	const bodyContent = document.createElement("p")

	bodyContent.textContent = "TODO"
	element.appendChild(bodyContent)

	if (dialogData.type == "minecraft:notice") {
		for (const elem of dialogData.body || []) {
			const bodyElement = createElement("p", { className: "preview-body-element" })

			console.log("elem", elem)
			for (const component of elem.contents || []) {
				bodyElement.appendChild(renderTextComponent(component as TextComponent))
			}

			element.appendChild(bodyElement)
		}
	}

	return element
}

function createFooter(dialogData: any) {
	const element = createElement("div", { id: "preview-footer" })

	return element
}

function renderTextComponent(component: TextComponent) {
	const element = createElement("span", { className: "text-component" })
	element.textContent = component.text || ""
	element.style.color = component.color || "white"
	element.style.fontWeight = component.bold ? "bold" : "normal"
	element.style.fontStyle = component.italic ? "italic" : "normal"
	element.style.textDecoration = component.underlined ? "underline" : "none"
	element.style.textDecoration += component.strikethrough ? " line-through" : ""
	element.style.textShadow = component.shadow_color ? `1px 1px ${component.shadow_color}` : "none"
	return element
}