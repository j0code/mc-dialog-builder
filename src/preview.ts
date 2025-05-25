import { BaseTextComponent, NBTCompound, TextComponent } from "./types.js"
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
			const firstComp: BaseTextComponent = elem.contents?.[0] ?? defaultTextComponent

			console.log("elem", elem)
			for (const component of elem.contents || []) {
				bodyElement.appendChild(renderTextComponent(component as TextComponent, firstComp))
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

function renderTextComponent(component: TextComponent, parent: BaseTextComponent): HTMLSpanElement {
	const element = createElement("span", { className: "text-component" })
	const shadow = component.shadow_color || [0, 0, 0, 1] // default shadow color if not provided   (TODO: use darkened color)
	const shadowCss = `${shadow[0] * 255} ${shadow[1] * 255} ${shadow[2] * 255} / ${shadow[3] * 100}%`

	console.log("Rendering component:", component, "with parent:", parent)
	element.textContent = component.text || ""
	element.style.color = component.color || parent.color || defaultTextComponent.color
	element.style.fontWeight = component.bold ? "bold" : "normal"
	element.style.fontStyle = component.italic ? "italic" : "normal"
	element.style.textDecoration = component.underlined ? "underline" : "none"
	element.style.textDecoration += component.strikethrough ? " line-through" : ""
	element.style.textShadow = component.shadow_color ? `1px 1px rgb(${shadowCss})` : "none"
	return element
}

const defaultTextComponent: Required<BaseTextComponent> = {
	type: "text",
	color: "white",
	font: "minecraft:default",
	bold: false,
	italic: false,
	underlined: false,
	strikethrough: false,
	obfuscated: false,
	shadow_color: [0.75, 0.75, 0.75, 0.25]
}