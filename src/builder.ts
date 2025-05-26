import click_action from "./data/click_action.js"
import click_event from "./data/click_event.js"
import { previewDialog } from "./preview.js"
import { getRegistry } from "./registries.js"
import text_component from "./data/text_component.js"
import { NBTBoolean, NBTCompound, NBTList, NBTNumber, NBTString, NBTTuple, NBTValue } from "./types.js"
import { createElement, readFormData } from "./util.js"
import submit_action from "./data/submit_action.js"
import input_control from "./data/input_control.js"
import ValidationError from "./ValidationError.js"

const specialTypeMapping: Record<string, NBTCompound | NBTList> = {
	text_component,
	click_action,
	click_event,
	submit_action,
	input_control
}

export function createForm() {
	const form = createElement("form", { id: "mc-dialog-builder" })
	
	const dialogElement = createCompoundInput("dialog", "Dialog", {
		type: "compound",
		children: {
			type: { type: "select", registry: "minecraft:dialog_type", required: true },
			title: { type: "string", placeholder: "Enter dialog title", required: true },
			external_title: { type: "string", placeholder: "Enter external title" },
			body: {
				type: "list",
				elementType: {
					type: "compound", children: {
						type: { type: "select", registry: "minecraft:dialog_body_type" }
					}
				}
			},
			can_close_with_escape: { type: "boolean" }
		},
		required: true
	})

	const previewButton = createElement("button", { id: "preview-button" })
	previewButton.textContent = "Preview"
	previewButton.type = "button"
	previewButton.addEventListener("click", () => {
		previewDialog()
	})

	const copyButton = createElement("button", { id: "copy-button" })
	copyButton.textContent = "Copy to Clipboard"
	copyButton.type = "button"
	copyButton.addEventListener("click", () => {
		const data = readFormData(form)
		if (data instanceof ValidationError) {
			alert("ValidationError:\n" + data.message)
			return
		}
		const json = JSON.stringify(data)
		navigator.clipboard.writeText(json).then(() => {
			alert("Data copied to clipboard!")
		}).catch(err => {
			console.error("Failed to copy: ", err)
			alert("Failed to copy data to clipboard.")
		})
	})

	form.appendChild(dialogElement)
	form.appendChild(previewButton)
	form.appendChild(copyButton)
	document.body.appendChild(form)
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

function createCompoundInput(id: string, name: string, def: NBTCompound) {
	const element = createElement("details", { id, className: "compound-input" })
	const summaryElement = createElement("summary", { className: "compound-input-name" })
	const genericChildren = createElement("div", { className: "compound-input-generic-children" })
	const specificChildren = createElement("div", { className: "compound-input-specific-children" })

	summaryElement.textContent = name
	element.open = def.required ?? false // collapse if optional
	element.dataset.type = "compound"
	element.dataset.required = (def.required ?? false)+""

	// console.log("!§", id, def.children, def.required)
	if ("type" in def.children && def.children.type.type == "select" && def.children.type.required) {
		const registry = getRegistry(def.children.type.registry)
		const firstEntry = registry.values().next().value
		if (firstEntry) setCompoundChildren(id, def, specificChildren, firstEntry.children, specificChildren)
		// console.log(id, firstEntry)
	} else if ("action" in def.children && def.children.action.type === "select" && def.children.action.required) {
		const registry = getRegistry(def.children.action.registry)
		const firstEntry = registry.values().next().value
		if (firstEntry) setCompoundChildren(id, def, specificChildren, firstEntry.children, specificChildren)
		// console.log(id, firstEntry)
	}

	setCompoundChildren(id, def, genericChildren, def.children, specificChildren)

	element.appendChild(summaryElement)
	element.appendChild(genericChildren)
	element.appendChild(specificChildren)
	return element
}

function setCompoundChildren(parentId: string, parentDef: NBTCompound, element: HTMLDivElement, children: Record<string, NBTValue>, specificChildrenElement: HTMLDivElement) {
	for (let [key, childDef] of Object.entries(children)) {
		let inputElement: HTMLElement

		if (childDef.type in specialTypeMapping) {
			const required = "required" in childDef && childDef.required
			childDef = { ...specialTypeMapping[childDef.type] }
			// console.log("mapping type", childDef.type, childDef.required, required, parentId, key)
			childDef.required ??= required
		}

		if (childDef.type === "select") {
			inputElement = createSelect(`${parentId}-${key}`, getRegistry(childDef.registry).keys().toArray().map(value => ({ value })), childDef.required ?? false) // Placeholder for options, should be filled with actual data
			if (key == "type" || key == "action") {
				inputElement.addEventListener("change", (event) => {
					const selectElement = event.target as HTMLSelectElement
					const registry = getRegistry(childDef.registry)
					const entry = registry.get(selectElement.value)

					specificChildrenElement.innerHTML = "" // Clear previous specific children
					if (entry) setCompoundChildren(parentId, parentDef, specificChildrenElement, entry?.children ?? {}, specificChildrenElement)
				})
			}
		} else if (childDef.type === "string") {
			inputElement = createStringInput(`${parentId}-${key}`, childDef)
		} else if (childDef.type === "number") {
			inputElement = createNumberInput(`${parentId}-${key}`, childDef)
		} else if (childDef.type === "boolean") {
			inputElement = createBooleanInput(`${parentId}-${key}`, childDef)
		} else if (childDef.type == "compound") {
			inputElement = createCompoundInput(`${parentId}-${key}`, key, childDef)
		} else if (childDef.type == "list") {
			inputElement = createListInput(`${parentId}-${key}`, key, childDef)
		} else if (childDef.type == "tuple") {
			inputElement = createTupleInput(`${parentId}-${key}`, key, childDef)
		} else {
			throw new Error(`Unsupported type: ${childDef.type}`)
		}

		inputElement.dataset.key = key
		
		if (["compound", "list", "tuple"].includes(childDef.type)) {
			element.appendChild(inputElement)
			continue
		}

		const label = createElement("label", {})
		label.textContent = key
		if (childDef.required != undefined) label.dataset.labelsRequired = childDef.required+""
		label.appendChild(inputElement)
		element.appendChild(label)
	}
}

function createListInput(id: string, name: string, def: NBTList) {
	const element = createElement("details", { id, className: "list-input" })
	const summaryElement = createElement("summary", { className: "list-input-name" })
	const addButton = createElement("button", { className: "add-button" })
	addButton.textContent = "Add Item"
	addButton.type = "button"
	summaryElement.textContent = name
	element.open = def.required ?? false // collapse if optional
	element.dataset.type = "list"
	element.dataset.required = (def.required ?? false)+""

	function addItem() {
		const index = element.childElementCount - 2 // -2 to skip the summary and add button
		let elementType = structuredClone(def.elementType)
		if (index == 0 && def.required) elementType.required = true
		const itemElement = createListItemInput(id, index, elementType)
		element.appendChild(itemElement)
	}

	addButton.addEventListener("click", addItem)

	element.appendChild(summaryElement)
	element.appendChild(addButton)
	if (def.required) addItem()
	return element
}

function createListItemInput(parentId: string, index: number, elementType: NBTList["elementType"], labelText: string = index+"") {
	let inputElement: HTMLInputElement | HTMLSelectElement | HTMLDetailsElement

	if (elementType.type in specialTypeMapping) {
		const required = "required" in elementType && elementType.required
		elementType = specialTypeMapping[elementType.type]
		elementType.required ??= required
	}

	if (elementType.type === "string") {
		inputElement = createStringInput(`${parentId}-${index}`, elementType)
	} else if (elementType.type === "number") {
		inputElement = createNumberInput(`${parentId}-${index}`, elementType)
	} else if (elementType.type === "boolean") {
		inputElement = createBooleanInput(`${parentId}-${index}`, elementType)
	} else if (elementType.type === "compound") {
		inputElement = createCompoundInput(`${parentId}-${index}`, index+"", elementType)
		inputElement.open = true // open by default since it has just been created
	} else {
		throw new Error(`Unsupported list item type: ${elementType.type}`)
	}

	inputElement.dataset.key = index+""

	if (["compound", "list", "tuple"].includes(elementType.type)) {
		return inputElement
	}

	const label = createElement("label", {})
	label.textContent = labelText+""
	label.appendChild(inputElement)
	return label
}

function createTupleInput(id: string, name: string, def: NBTTuple) {
	const element = createElement("details", { id, className: "tuple-input" })
	const summaryElement = createElement("summary", { className: "tuple-input-name" })

	console.log("Creating tuple input for", id, name, def)
	summaryElement.textContent = name
	element.open = true // Open by default
	element.dataset.type = "tuple"
	element.appendChild(summaryElement)

	for (let i = 0; i < def.labels.length; i++) {
		const label = def.labels[i]
		const inputElement = createListItemInput(id, i, def.elementType, label)

		element.appendChild(inputElement)
	}

	return element
}