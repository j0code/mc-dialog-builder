import text from "./data/text_component_type/text.js"
import { BaseTextComponent, BooleanInputControl, TextClickEvent, DialogAction, InputControl, SingleOptionInputControl, TextComponent, TextInputControl, TextTextComponent, DialogActionType } from "./types.js"
import { $, createElement, decodeColor, onTrigger, readFormData, resolveTextComponents, resolveTooltip, shadowFor, stringifyTextComponents } from "./util.js"
import ValidationError from "./ValidationError.js"

const DEFAULT_BUTTON_WIDTH = 150

const defaultTextComponent: Omit<Required<BaseTextComponent>, "click_event" | "hover_event"> = {
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

const cancelButton: Omit<DialogAction, "action"> = {
	label: [{ type: "text", text: "Cancel" }],
	width: DEFAULT_BUTTON_WIDTH
}

const backButton: Omit<DialogAction, "action"> = {
	label: [{ type: "text", text: "Back" }],
	width: DEFAULT_BUTTON_WIDTH
}

let tooltip: HTMLDivElement

export function previewDialog() {
	const form = $("#mc-dialog-builder", "form")
	const preview = $("#preview", "div")
	let dialogData = readFormData(form)
	preview.innerHTML = "" // Clear previous preview content
	preview.ariaLabel = "Preview"

	if (dialogData instanceof ValidationError) {
		preview.classList.add("error")
		dialogData = {
			type: "minecraft:notice",
			title: "Validation Error",
			body: [{ type: "minecraft:plain_message", contents: [{ type: "text", text: dialogData.message }] }]
		}
	} else {
		preview.classList.remove("error")
	}

	// console.log("Dialog Data:", dialogData)
	
	const header = createHeader(dialogData.title || " ")
	const body = createBody(dialogData)
	const footer = createFooter(dialogData)
	const tooltipContainer = createElement("div", { id: "tooltip-container" })
	tooltip = createElement("div", { id: "tooltip" })

	tooltipContainer.ariaHidden = "true"

	window.addEventListener("mousemove", e => {
		const guiScale = parseInt($("#gui-scale-input", "input").value, 10)
		tooltipContainer.style.setProperty('--cursor-x', `${e.clientX + 8*guiScale}px`);
		tooltipContainer.style.setProperty('--cursor-y', `${e.clientY - tooltipContainer.clientHeight/2}px`);
	})

	tooltipContainer.appendChild(tooltip)

	preview.appendChild(header)
	preview.appendChild(body)
	preview.appendChild(footer)
	preview.appendChild(tooltipContainer)
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

	for (const elem of dialogData.body || []) {
		const bodyElement = createElement("p", { className: "preview-body-element" })

		if (elem.type == "minecraft:plain_message") {
			// console.log("Rendering plain message:", elem)
			renderTextComponents(bodyElement, elem.contents || [])
		} // TODO: minecraft:item

		element.appendChild(bodyElement)
	}

	if ("inputs" in dialogData && Array.isArray(dialogData.inputs)) {
		renderInputs(dialogData.inputs, element)
	}

	if (["minecraft:multi_action"].includes(dialogData.type)) {
		const actionGrid = createElement("div", { id: "action-grid" })
		const columns = dialogData.columns || 2

		const actions: DialogAction[] = dialogData.actions || []
		let row = createElement("div", { className: "action-grid-row" })
		for (const action of actions) {
			if (row.children.length >= columns) {
				actionGrid.appendChild(row)
				row = createElement("div", { className: "action-grid-row" })
			}
			row.appendChild(renderButton(action))
		}
		if (row.children.length > 0) {
			actionGrid.appendChild(row)
		}

		element.appendChild(actionGrid)
	}

	return element
}

function createFooter(dialogData: any) {
	const element = createElement("div", { id: "preview-footer" })

	if (dialogData.type == "minecraft:notice") {
		const action: DialogAction = dialogData.action ?? { label: { type: "text", text: "Ok" }, width: DEFAULT_BUTTON_WIDTH }
		if (!action.label || action.label.length == 0) action.label = [{ type: "text", text: "Ok" }]

		const closeButton = renderButton(action)

		element.appendChild(closeButton)
	} else if (dialogData.type == "minecraft:confirmation") {
		const yesAction: DialogAction = dialogData.yes ?? { label: { type: "text", text: "Yes" }, width: DEFAULT_BUTTON_WIDTH }
		const noAction:  DialogAction = dialogData.no  ?? { label: { type: "text", text: "No"  }, width: DEFAULT_BUTTON_WIDTH }
		if (yesAction.label.length == 0) yesAction.label = [{ type: "text", text: "Yes" }]
		if (noAction.label.length == 0)  noAction.label  = [{ type: "text", text: "No" }]

		const yesButton = renderButton(yesAction)
		const noButton  = renderButton(noAction)

		element.appendChild(yesButton)
		element.appendChild(noButton)
	} else if (["minecraft:multi_action", "minecraft:server_links", "minecraft:dialog_list"].includes(dialogData.type) && dialogData.exit_action) {
		const action: DialogAction = dialogData.exit_action

		const closeButton = renderButton(action)

		element.appendChild(closeButton)
	}

	return element
}

function renderTextComponent(component: TextTextComponent, parent: BaseTextComponent): HTMLSpanElement {
	// console.log("text", component)
	const element = createElement("span", { className: "text-component" })
	const color  = component.color || parent.color || defaultTextComponent.color
	const shadow = component.shadow_color || shadowFor(color)
	const shadowCss = `${shadow[0] * 255} ${shadow[1] * 255} ${shadow[2] * 255} / ${shadow[3] * 100}%`
	const bold = component.bold ?? parent.bold ?? defaultTextComponent.bold
	const italic = component.italic ?? parent.italic ?? defaultTextComponent.italic
	const underlined = component.underlined ?? parent.underlined ?? defaultTextComponent.underlined
	const strikethrough = component.strikethrough ?? parent.strikethrough ?? defaultTextComponent.strikethrough

	// console.log("Rendering component:", component, "with parent:", parent)
	element.textContent = component.text || ""
	element.style.color = decodeColor(color)
	element.style.fontWeight = bold ? "bold" : "normal"
	element.style.fontStyle = italic ? "italic" : "normal"
	element.style.textDecoration = underlined ? "underline" : "none"
	element.style.textDecoration += strikethrough ? " line-through" : ""
	element.style.textShadow = `calc(var(--gui-scale) * 1px) calc(var(--gui-scale) * 1px) rgb(${shadowCss})`

	if (component.hover_event) {
		element.ariaLabel = component.text || ""
		element.ariaDescription = stringifyTextComponents(resolveTooltip(component.hover_event))
	} else {
		element.ariaHidden = "true"
	}

	return element
}

function renderButton(action: DialogAction): HTMLButtonElement {
	const label = resolveTextComponents(action.label)
	const button = createElement("button", { className: "dialog-button" })

	button.style.setProperty("--width", `${action.width || 150}px`) 
	button.type = "button"

	renderTextComponents(button, label, true)

	if (action.action) addClickHandler(button, stringifyTextComponents(label), action.action, "Button")

	if (action.tooltip) {
		addTooltip(button, action.tooltip)
	}

	return button
}

function renderTextComponents(element: HTMLElement, components: TextComponent | TextComponent[], suppressEvents: boolean = false): void {
	if (!Array.isArray(components)) {
		components = [components]
	}
	const resolvedComponents = resolveTextComponents(components) as TextTextComponent[]

	const firstComp: BaseTextComponent = resolvedComponents[0] ?? defaultTextComponent
	for (const component of resolvedComponents) {
		// console.log("rendering", component)
		const span = renderTextComponent(component, firstComp)

		if (!suppressEvents) {
			if (component.click_event) addClickHandler(span, component.text, component.click_event, "TextComponent")

			if (component.hover_event) {
				const tooltip = resolveTooltip(component.hover_event)
				addTooltip(span, tooltip)
			}
		}

		element.appendChild(span)
	}

	element.ariaLabel ??= stringifyTextComponents(resolvedComponents)
}

function handleTextClick(event: TextClickEvent) {
	if (event.action == "open_url") {
		console.log(`click ${event.action}:`, event.url)
	} else if (event.action == "open_file") {
		console.log(`click ${event.action}:`, event.path)
	} else if (event.action == "run_command") {
		console.log(`click ${event.action}:`, event.command)
	} else if (event.action == "suggest_command") {
		console.log(`click ${event.action}:`, event.command)
	} else if (event.action == "change_page") {
		console.log(`click ${event.action}:`, event.page)
	} else if (event.action == "copy_to_clipboard") {
		console.log(`click ${event.action}:`, event.value)
	} else if (event.action == "show_dialog") {
		console.log(`click ${event.action}:`, event.dialog)
	} else if (event.action == "custom") {
		console.log(`click ${event.action}:`, `(${event.id})`, event.payload)
	} else {
		// @ts-expect-error
		console.log(`click ${event.action}:`, event)
	}
}

function handleDialogClick(action: DialogActionType) {
	// TODO: extract info from inputs

	if (action.type == "minecraft:dynamic/run_command") {
		// TODO: show expanded template
		console.log(`click ${action.type}:`, action.template) 
	} else if (action.type == "minecraft:dynamic/custom") {
		// TODO: show inputs
		console.log(`click ${action.type}:`, `(${action.id})`, action.additions) 
	} else {
		const event = { ...action, action: action.type.substring(10) } as TextClickEvent // convert (key change, remove minecraft:)
		handleTextClick(event)
	}
}

function renderInputs(inputs: InputControl[], element: HTMLElement) {
	const inputsContainer = createElement("div", { id: "inputs-container" })
	
	for (const input of inputs) {
		const inputElement = createElement("div", { className: "input-element" })

		let labelText = input.label
		if (!labelText || labelText.length == 0) {
			labelText = [{ type: "text", text: "Missing label" }]
		}
		
		if (input.type == "minecraft:text") {
			renderTextInput(input, inputElement, labelText)
		} else if (input.type == "minecraft:boolean") {
			renderBooleanInput(input, inputElement, labelText)
			
		} else if (input.type == "minecraft:single_option") {
			const cycleButton = createElement("button", { className: "input-single-option" })
			const options = input.options || []
			let index = options.findIndex(opt => opt.initial)
			if (index < 0) index = 0 // default to index 0

			cycleButton.style.setProperty("--width", `${input.width || 200}px`)
			cycleButton.type = "button"

			function updateButtonLabel(input: SingleOptionInputControl) {
				const option = options[index] ?? { id: "unknown", display: [{ type: "text", text: "" }] }
				const optionText = option.display ?? []
				if (optionText.length == 0) {
					optionText.push({ type: "text", text: option.id || "" })
				}

				cycleButton.innerHTML = "" // Clear previous content
				if (input.label_visible ?? true) {
					renderTextComponents(cycleButton, labelText.concat({ type: "text", text: ": " }, optionText))
				} else {
					renderTextComponents(cycleButton, optionText)
				}
			}

			updateButtonLabel(input)

			onTrigger(cycleButton, () => {
				index = (index + 1) % options.length
				updateButtonLabel(input)
			})
			
			inputElement.appendChild(cycleButton)

		}
		
		inputsContainer.appendChild(inputElement)
	}

	element.appendChild(inputsContainer)
}

function renderTextInput(input: TextInputControl, inputElement: HTMLDivElement, labelText: TextComponent[]) {
	const label = createElement("label", { className: "input-label" })
	const inputField = createElement(input.multiline ? "textarea" : "input", {})
			
	inputField.value = (input.initial || "") + ""
	inputField.maxLength = input.max_length || 15
	renderTextComponents(label, labelText)
	
	if (inputField instanceof HTMLInputElement) inputField.type = "text"
	inputField.style.setProperty("--width", `${input.width || 200}px`)

	if (input.label_visible ?? true) inputElement.appendChild(label)
	inputElement.appendChild(inputField)

	if (input.multiline) {
		const max_lines = input.multiline.max_lines ?? 4
		const height = input.multiline.height ?? 8 + max_lines * 9
		inputField.style.setProperty("--height", `${height}px`)
	}
}

function renderBooleanInput(input: BooleanInputControl, inputElement: HTMLDivElement, labelText: TextComponent[]) {
	const label = createElement("label", { className: "input-label" })
	const checkbox = createElement("div", { className: "input-checkbox" })
	
	let checked = input.initial ?? false
	checkbox.textContent = checked ? "✔" : ""
	checkbox.tabIndex = 0 // Make it focusable
	checkbox.ariaLabel = stringifyTextComponents(labelText)
	checkbox.role = "checkbox"
	renderTextComponents(label, labelText)

	onTrigger(checkbox, () => {
		checked = !checked
		checkbox.textContent = checked ? "✔" : ""
	})
	
	inputElement.appendChild(checkbox)
	inputElement.appendChild(label)
}

function addClickHandler(element: HTMLElement, label: string, action: DialogActionType | TextClickEvent, target: "TextComponent" | "Button") {
	onTrigger(element, () => {
		if (target == "Button") console.log(`Button [${label}] clicked:`, action)
		else if (target == "TextComponent") console.log(`Text "${label}" clicked:`, action)

		if (action) {
			if ("type" in action) {
				handleDialogClick(action)
			} else {
				handleTextClick(action)
			}
		}
	})
}

function addTooltip(element: HTMLElement, tooltip: TextComponent[]) {
	element.addEventListener("mouseenter", e => {
		renderTooltip(tooltip)
	})

	element.addEventListener("mouseleave", e => {
		hideTooltip()
	})
}

function renderTooltip(text: TextComponent[]) {
	tooltip.innerHTML = ""
	renderTextComponents(tooltip, text)
	console.log("tooltip", text)
	if (tooltip.innerText.length > 0) tooltip.classList.add("visible")
}

function hideTooltip() {
	tooltip.classList.remove("visible")
}