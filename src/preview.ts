import { BaseTextComponent, BooleanInputControl, ButtonAction, InputControl, SingleOptionInputControl, SubmitAction, TextComponent, TextInputControl, TextTextComponent } from "./types.js"
import { $, createElement, readFormData, resolveTextComponents, stringifyTextComponents } from "./util.js"
import ValidationError from "./ValidationError.js"

const DEFAULT_BUTTON_WIDTH = 150

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

const cancelButton: Omit<ButtonAction, "on_click"> = {
	label: [{ type: "text", text: "Cancel" }],
	width: DEFAULT_BUTTON_WIDTH
}

const backButton: Omit<ButtonAction, "on_click"> = {
	label: [{ type: "text", text: "Back" }],
	width: DEFAULT_BUTTON_WIDTH
}

const submitButton: Omit<SubmitAction, "on_submit"> = {
	label: [{ type: "text", text: "Submit" }],
	width: DEFAULT_BUTTON_WIDTH
}

export function previewDialog() {
	const form = $("#mc-dialog-builder", "form")
	const preview = $("#preview", "div")
	let dialogData = readFormData(form)
	preview.innerHTML = "" // Clear previous preview content

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

	for (const elem of dialogData.body || []) {
		const bodyElement = createElement("p", { className: "preview-body-element" })

		if (elem.type == "minecraft:plain_message") {
			console.log("Rendering plain message:", elem)
			renderTextComponents(bodyElement, elem.contents || [])
		}

		element.appendChild(bodyElement)
	}

	if ("inputs" in dialogData && Array.isArray(dialogData.inputs)) {
		renderInputs(dialogData.inputs, element)
	}

	if (["minecraft:multi_action"].includes(dialogData.type)) {
		const actionGrid = createElement("div", { id: "action-grid" })
		const columns = dialogData.columns || 2

		const actions: ButtonAction[] = dialogData.actions || []
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
		const action: ButtonAction = dialogData.action ?? { label: { type: "text", text: "Ok" }, width: DEFAULT_BUTTON_WIDTH }
		if (!action.label || action.label.length == 0) action.label = [{ type: "text", text: "Ok" }]

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
	} else if (["minecraft:multi_action", "minecraft:server_links", "minecraft:dialog_list"].includes(dialogData.type)) {
		const hasExitAction = Boolean(dialogData.on_cancel)
		const action: ButtonAction = { ...(hasExitAction ? cancelButton : backButton), on_click: dialogData.on_cancel }

		const closeButton = renderButton(action)

		element.appendChild(closeButton)
	} else if (["minecraft:simple_input_form"].includes(dialogData.type)) {
		const action: SubmitAction = { ...submitButton, on_submit: dialogData.action?.on_submit || { type: "minecraft:custom_form", id: "" } }

		const closeButton = renderButton(action)

		element.appendChild(closeButton)
	}

	return element
}

function renderTextComponent(component: TextTextComponent, parent: BaseTextComponent): HTMLSpanElement {
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
	element.style.textShadow = `calc(var(--gui-scale) * 1px) calc(var(--gui-scale) * 1px) rgb(${shadowCss})`
	return element
}

function renderButton(action: ButtonAction | SubmitAction): HTMLButtonElement {
	const label = resolveTextComponents(action.label)
	const button = createElement("button", { className: "dialog-button" })
	button.style.setProperty("--width", `${action.width}px`) 
	console.log("Rendering button:", action)

	if (action.tooltip) {
		button.title = stringifyTextComponents(action.tooltip)
	}

	renderTextComponents(button, label)

	button.addEventListener("click", () => {
		// @ts-expect-error
		console.log(`Button [${stringifyTextComponents(label)}] clicked:`, action.on_click ?? action.on_submit)

		if ("on_submit" in action) {
			handleSubmit(action)
		} else if ("on_click" in action) {
			handleClick(action)
		}
	})

	return button
}

function renderTextComponents(element: HTMLElement, components: TextComponent | TextComponent[]): void {
	if (!Array.isArray(components)) {
		components = [components]
	}
	const resolvedComponents = resolveTextComponents(components) as TextTextComponent[]

	const firstComp: BaseTextComponent = resolvedComponents[0] ?? defaultTextComponent
	for (const component of resolvedComponents) {
		console.log("rendering", component)
		element.appendChild(renderTextComponent(component, firstComp))
	}
}

function handleClick(action: ButtonAction) {
	if (action.on_click.action == "run_command") {
		console.log(`submit ${action.on_click.action}:`, action.on_click.command)
	}
}

function handleSubmit(action: SubmitAction) {
	if (action.on_submit.type == "minecraft:command_template") {
		console.log(`submit ${action.on_submit.type}:`, action.on_submit.template)
	} else if (action.on_submit.type == "minecraft:custom_template") {
		console.log(`submit ${action.on_submit.type}:`, `(${action.on_submit.id})`, action.on_submit.template)
	} else if (action.on_submit.type == "minecraft:custom_form") {
		console.log(`submit ${action.on_submit.type}:`, `${action.on_submit.id}`)
	} else {
		// @ts-expect-error
		console.log(`submit ${action.on_submit.action}:`, action.on_submit)
	}
}

function renderInputs(inputs: InputControl[], element: HTMLElement) {
	const inputsContainer = createElement("div", { id: "inputs-container" })
	
	for (const input of inputs) {
		const inputElement = createElement("div", { className: "input-element" })
		const inputField = createElement("input", {})

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
			cycleButton.addEventListener("click", () => {
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
	renderTextComponents(label, labelText)

	checkbox.addEventListener("click", () => {
		checked = !checked
		checkbox.textContent = checked ? "✔" : ""
	})
	
	inputElement.appendChild(checkbox)
	inputElement.appendChild(label)
}