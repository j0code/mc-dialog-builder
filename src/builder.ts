import dialog_action from "./data/dialog_action.js"
import click_event from "./data/click_event.js"
import { previewDialog } from "./preview.js"
import { getRegistry } from "./registries.js"
import text_component from "./data/text_component.js"
import { NBTBoolean, NBTCompound, NBTList, NBTNumber, NBTString, NBTTuple, NBTValue } from "./types.js"
import { $, createElement, onTrigger } from "./util.js"
import input_control from "./data/input_control.js"
import dialog from "./data/dialog.js"

const specialTypeMapping = {
	text_component,
	dialog_action,
	click_event,
	input_control
} as const satisfies Record<string, NBTCompound | NBTList>

export function createForm() {
	const form = createElement("form", { id: "mc-dialog-builder" })
	
	const dialogElement = createCompoundInput("dialog", "Dialog", dialog, true)

	

	form.addEventListener("change", () => {
		// console.log("CHANGE", $("#auto-reload-checkbox", "input")?.checked)
		if (!$("#auto-reload-checkbox", "input")?.checked) return
		;previewDialog()
	})

	form.appendChild(dialogElement)
	return form
}

function createSelect(id: string, options: { value: string, name?: string }[], required: boolean) {
	const element = createElement("select", { id, className: "select-input" })

	if (!required) {
		const optionElement = createElement("option", { value: "@", textContent: "(unset)" })
		element.appendChild(optionElement)
	}

	for (const option of options) {
		const optionElement = createElement("option", { value: option.value, textContent: option.name || option.value })
		element.appendChild(optionElement)
	}
	element.dataset.type = "select"
	element.dataset.required = required+""

	return element
}

function createStringInput(id: string, def: NBTString) {
	const element = createElement("input", { id, className: "string-input" })

	element.type = "text"
	element.placeholder = def.placeholder || ""
	element.required = def.required ?? false
	element.value = def.default || ""
	element.dataset.type = "string"

	return element
}

function createNumberInput(id: string, def: NBTNumber) {
	const element = createElement("input", { id, className: "text-input" })

	element.type = "number"
	if (def.min  != undefined) element.min  = String(def.min)
	if (def.max  != undefined) element.max  = String(def.max)
	if (def.step != undefined) element.step = String(def.step)
	element.value = String(def.default || def.min || 0)
	element.dataset.type = "number"

	return element
}

function createBooleanInput(id: string, def: NBTBoolean) {
	const element = createElement("select", { id, className: "boolean-input" })
	const trueOption = createElement("option", { value: "true", textContent: "true" })
	const falseOption = createElement("option", { value: "false", textContent: "false" })
	const unsetOption = createElement("option", { value: "unset", textContent: "unset" })

	element.appendChild(trueOption)
	element.appendChild(falseOption)
	if (!def.required) element.appendChild(unsetOption)
	element.value = String(def.default ?? "unset")
	element.dataset.type = "boolean"

	return element

}

function createNestedInput(id: string, name: string, def: NBTCompound | NBTList | NBTTuple, evenChild: boolean, removable: boolean) {
	const element = createElement("div", { id, className: "nesting-input" })
	const headerBar = createHeaderBar(element, name, def.required ?? false)
	const childrenContainer = createElement("div", { className: "children-container" })

	element.classList.toggle("open", def.required ?? false) // collapse if optional
	element.dataset.type = def.type
	element.dataset.required = (def.required ?? false)+""
	element.classList.add(evenChild ? "even-child" : "odd-child")
	element.role = "group"
	element.ariaLabel = name

	if (!def.required && !removable) {
		element.dataset.included = "false"
		const includeButton = createHeaderBarButton("Include", "include-item")
		onTrigger(includeButton, () => {
			const included = element.dataset.included == "false"
			element.dataset.included = included + ""
			includeButton.ariaLabel = included ? "Exclude" : "Include"
			includeButton.classList.toggle("include-item", !included)
			includeButton.classList.toggle("exclude-item",  included)
		})
		headerBar.appendChild(includeButton)
	} else {
		element.dataset.included = "true"
	}

	if (def.tooltip) {
		const { tooltipButton, tooltipDialog } = createTooltip(id, def)!

		element.appendChild(tooltipDialog)
		headerBar.appendChild(tooltipButton)
	}

	element.appendChild(headerBar)
	element.appendChild(childrenContainer)

	return { element, headerBar, childrenContainer }
}

function createTooltip(id: string, def: NBTCompound | NBTList | NBTTuple) {
	if (!def.tooltip) return null

	const tooltipButton = createHeaderBarButton("Tooltip", "info")
	const tooltipDialog = createElement("dialog", { 
		className: "tooltip-dialog",
	})
	const title = createElement("h3", { id: `${id}-tooltip-title`, textContent: def.tooltip.title })
	const description = createElement("div", {})

	tooltipDialog.role = "tooltip"
	tooltipDialog.ariaLabel = def.tooltip.title
	
	description.append(...def.tooltip.description.map(text => 
		createElement("p", { textContent: text })
	))
	
	tooltipDialog.append(title, description)

	// @ts-expect-error limited availability feature
	tooltipButton.style["anchor-name"] = `--${id}-tooltip`
	// @ts-expect-error widely available feature, but ts is behind
	tooltipDialog.closedBy = "any"
	
	onTrigger(tooltipButton, () => {
		// @ts-expect-error limited availability feature
		tooltipDialog.style["position-anchor"] = `--${id}-tooltip`
		tooltipDialog.showModal()
	})

	return { tooltipButton, tooltipDialog }
}

function createCompoundInput(id: string, name: string, def: NBTCompound, evenChild: boolean, removable: boolean = false) {
	const { element, headerBar, childrenContainer } = createNestedInput(id, name, def, evenChild, removable)
	const genericChildren = createElement("div", { className: "compound-input-generic-children" })
	const specificChildren = createElement("div", { className: "compound-input-specific-children" })

	if (removable) {
		const removeButton = createHeaderBarButton("Remove item", "remove-item")
		onTrigger(removeButton, () => element.remove())
		headerBar.appendChild(removeButton)
	}

	// console.log("!§", id, def.children, def.required)
	if ("type" in def.children && def.children.type.type == "select" && def.children.type.required) {
		const registry = getRegistry(def.children.type.registry)
		const firstEntry = registry.values().next().value
		if (firstEntry) setCompoundChildren(id, def, specificChildren, firstEntry.children, specificChildren, evenChild)
		// console.log(id, firstEntry)
	} else if ("action" in def.children && def.children.action.type === "select" && def.children.action.required) {
		const registry = getRegistry(def.children.action.registry)
		const firstEntry = registry.values().next().value
		if (firstEntry) setCompoundChildren(id, def, specificChildren, firstEntry.children, specificChildren, evenChild)
		// console.log(id, firstEntry)
	}

	setCompoundChildren(id, def, genericChildren, def.children, specificChildren, evenChild)

	childrenContainer.appendChild(genericChildren)
	childrenContainer.appendChild(specificChildren)

	return element
}

function createNestedChild(parentId: string, key: string, childDef: NBTValue, evenChild: boolean, labelText: string = key, removable: boolean = false) {
	let inputElement: HTMLElement

	if (childDef.type in specialTypeMapping) {
		const key = childDef.type as keyof typeof specialTypeMapping
		const required = "required" in childDef && childDef.required
		childDef = { ...specialTypeMapping[key] }
		childDef.required ??= required
	}

	if (childDef.type === "select") {
		inputElement = createSelect(`${parentId}-${key}`, getRegistry(childDef.registry).keys().toArray().map(value => ({ value })), childDef.required ?? false) // Placeholder for options, should be filled with actual data
	} else if (childDef.type === "string") {
		inputElement = createStringInput(`${parentId}-${key}`, childDef)
	} else if (childDef.type === "number") {
		inputElement = createNumberInput(`${parentId}-${key}`, childDef)
	} else if (childDef.type === "boolean") {
		inputElement = createBooleanInput(`${parentId}-${key}`, childDef)
	} else if (childDef.type === "compound") {
		inputElement = createCompoundInput(`${parentId}-${key}`, key, childDef, !evenChild, removable)
	} else if (childDef.type === "list") {
		inputElement = createListInput(`${parentId}-${key}`, key, childDef, !evenChild)
	} else if (childDef.type === "tuple") {
		inputElement = createTupleInput(`${parentId}-${key}`, key, childDef, !evenChild)
	} else {
		throw new Error(`Unsupported type: ${childDef.type}`)
	}

	inputElement.dataset.key = key

	if (["compound", "list", "tuple"].includes(childDef.type)) {
		return inputElement
	}

	const label = createElement("label", {})
	label.textContent = labelText
	label.ariaLabel = labelText
	if (childDef.required != undefined) label.dataset.labelsRequired = childDef.required+""
	label.appendChild(inputElement)

	return label
}

function setCompoundChildren(parentId: string, parentDef: NBTCompound, element: HTMLDivElement, children: Record<string, NBTValue>, specificChildrenElement: HTMLDivElement, evenChild: boolean) {
	for (let [key, childDef] of Object.entries(children)) {
		const inputElement = createNestedChild(parentId, key, childDef, evenChild)

		if (childDef.type == "select") {
			if (key == "type" || key == "action") {
				inputElement.addEventListener("change", (event) => {
					const selectElement = event.target as HTMLSelectElement
					const registry = getRegistry(childDef.registry)
					const entry = registry.get(selectElement.value)

					specificChildrenElement.innerHTML = "" // Clear previous specific children
					if (entry) setCompoundChildren(parentId, parentDef, specificChildrenElement, entry?.children ?? {}, specificChildrenElement, evenChild)
				})
			}
		}

		element.appendChild(inputElement)
	}
}

function createListInput(id: string, name: string, def: NBTList, evenChild: boolean, removable: boolean = false) {
	const { element, headerBar, childrenContainer } = createNestedInput(id, name, def, evenChild, removable)
	const addButton = createHeaderBarButton("Add item", "add-item")

	function addItem() {
		const index = childrenContainer.childElementCount
		let elementType = structuredClone(def.elementType)
		if (index == 0 && def.required) elementType.required = true
		const itemElement = createListItemInput(id, index, elementType, evenChild)
		childrenContainer.appendChild(itemElement)
	}

	onTrigger(addButton, addItem)

	headerBar.appendChild(addButton)
	if (def.required) addItem() // TODO: only if required to be non-empty

	return element
}

function createListItemInput(parentId: string, index: number, elementType: NBTList["elementType"], evenChild: boolean, labelText: string = index+"") {
	const inputElement = createNestedChild(parentId, index+"", elementType, evenChild, labelText, !elementType.required)

	if (elementType.type === "compound") {
		inputElement.classList.add("open") // open by default since it has just been created
	}

	return inputElement
}

function createTupleInput(id: string, name: string, def: NBTTuple, evenChild: boolean, removable: boolean = false) {
	const { element, headerBar, childrenContainer } = createNestedInput(id, name, def, evenChild, removable)

	// console.log("Creating tuple input for", id, name, def)

	for (let i = 0; i < def.labels.length; i++) {
		const label = def.labels[i]
		const inputElement = createNestedChild(id, i+"", def.elementType, evenChild, label)

		childrenContainer.appendChild(inputElement)
	}

	return element
}

function createHeaderBar(owner: HTMLElement, name: string, open: boolean) {
	const headerBar = createElement("div", { className: "nesting-input-head" })
	const nameElement = createElement("summary", { className: "nesting-input-name" })

	nameElement.textContent = name
	nameElement.ariaLabel = open ? "close" : "open"
	nameElement.role = "button"
	nameElement.tabIndex = 0 // make it focusable

	function toggleOpen() {
		if (owner.dataset.included == "false") return

		owner.classList.toggle("open")
		nameElement.ariaLabel = owner.classList.contains("open") ? "close" : "open"
	}

	onTrigger(nameElement, toggleOpen)

	headerBar.appendChild(nameElement)
	return headerBar
}

function createHeaderBarButton(ariaLabel: string, icon: string) {
	const button = createElement("button", { className: icon })
	const svg = createElement("div", {})

	button.type = "button"
	button.ariaLabel = ariaLabel

	button.appendChild(svg)
	return button
}