import { BaseTextComponent, ButtonAction, TextComponent } from "./types.js"
import { createElement, readFormData, resolveTextComponents } from "./util.js"

const DEFAULT_BUTTON_WIDTH = 150

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

	for (const elem of dialogData.body || []) {
		const bodyElement = createElement("p", { className: "preview-body-element" })

		renderTextComponents(bodyElement, elem.contents || [])

		element.appendChild(bodyElement)
	}

	if (dialogData.type == "minecraft:notice") {
		
	}

	return element
}

function createFooter(dialogData: any) {
	const element = createElement("div", { id: "preview-footer" })

	if (dialogData.type == "minecraft:notice") {
		const action: ButtonAction = dialogData.action ?? { label: { type: "text", text: "Ok" }, width: DEFAULT_BUTTON_WIDTH }
		if (action.label.length == 0) action.label = [{ type: "text", text: "Ok" }]

		const closeButton = renderButton(action)

		element.appendChild(closeButton)
	} else if (dialogData.type == "minecraft:confirmation") {
		const yesAction: ButtonAction = dialogData.yes ?? { label: { type: "text", text: "Yes" }, width: DEFAULT_BUTTON_WIDTH }
		const noAction:  ButtonAction = dialogData.no  ?? { label: { type: "text", text: "No"  }, width: DEFAULT_BUTTON_WIDTH }
		if (yesAction.label.length == 0) yesAction.label = [{ type: "text", text: "Yes" }]
		if (noAction.label.length == 0)  noAction.label  = [{ type: "text", text: "No" }]

		const yesButton = renderButton(yesAction)
		const noButton  = renderButton(noAction)

		element.appendChild(yesButton)
		element.appendChild(noButton)
	}

	return element
}

function renderTextComponent(component: TextComponent, parent: BaseTextComponent): HTMLSpanElement {
	const element = createElement("span", { className: "text-component" })
	const shadow = component.shadow_color || [0, 0, 0, 1] // default shadow color if not provided   (TODO: use darkened color)
	const shadowCss = `${shadow[0] * 255} ${shadow[1] * 255} ${shadow[2] * 255} / ${shadow[3] * 100}%`
	const bold = component.bold ?? parent.bold ?? defaultTextComponent.bold
	const italic = component.italic ?? parent.italic ?? defaultTextComponent.italic
	const underlined = component.underlined ?? parent.underlined ?? defaultTextComponent.underlined
	const strikethrough = component.strikethrough ?? parent.strikethrough ?? defaultTextComponent.strikethrough

	// console.log("Rendering component:", component, "with parent:", parent)
	element.textContent = component.text || ""
	element.style.color = component.color || parent.color || defaultTextComponent.color
	element.style.fontWeight = bold ? "bold" : "normal"
	element.style.fontStyle = italic ? "italic" : "normal"
	element.style.textDecoration = underlined ? "underline" : "none"
	element.style.textDecoration += strikethrough ? " line-through" : ""
	element.style.textShadow = `1px 1px rgb(${shadowCss})`
	return element
}

function renderButton(action: ButtonAction) {
	const label = resolveTextComponents(action.label)
	const button = createElement("button", { className: "dialog-button" })
	button.style.width = `${action.width}px`
	console.log("Rendering button:", action)

	if (action.tooltip) {
		button.title = resolveTextComponents(action.tooltip).map(comp => comp.text).join("")
	}

	renderTextComponents(button, label)

	button.addEventListener("click", () => {
		console.log("Button clicked:", action)
	})

	return button
}

function renderTextComponents(element: HTMLElement, components: TextComponent | TextComponent[]): void {
	if (!Array.isArray(components)) {
		components = [components]
	}
	const firstComp: BaseTextComponent = components[0] ?? defaultTextComponent
	for (const component of components) {
		element.appendChild(renderTextComponent(component as TextComponent, firstComp))
	}
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