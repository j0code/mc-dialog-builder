import { previewDialog } from "./preview.js"
import { getRegistry } from "./registries.js"
import text_component from "./text_component.js"
import { NBTBoolean, NBTCompound, NBTList, NBTNumber, NBTString, NBTTuple, NBTValue } from "./types.js"
import { createElement } from "./util.js"

export function createForm() {
	const form = createElement("form", { id: "mc-dialog-builder" })
	
	const dialogElement = createCompoundInput("dialog", "Dialog", {
		type: "compound",
		children: {
			type: { type: "select", registry: "minecraft:dialog_type" },
			title: { type: "string", placeholder: "Enter dialog title" },
			external_title: { type: "string", placeholder: "Enter external title" },
			body: {
				type: "list",
				elementType: {
					type: "compound", children: {
						type: { type: "select", registry: "minecraft:dialog_body_type" }
					}
				}
			},
			can_close_with_escape: { type: "boolean", default: true }
		}
	})

	const previewButton = createElement("button", { id: "preview-button", className: "button" })
	previewButton.textContent = "Preview"
	previewButton.type = "button"
	previewButton.addEventListener("click", () => {
		previewDialog()
	})

	form.appendChild(dialogElement)
	form.appendChild(previewButton)
	document.body.appendChild(form)
}

function createSelect(id: string, options: { value: string, name?: string }[]) {
	const element = createElement("select", { id, className: "select-input" })

	for (const option of options) {
		const optionElement = document.createElement("option")
		optionElement.value = option.value
		optionElement.textContent = option.name || option.value
		element.appendChild(optionElement)
	}
	element.dataset.type = "select"

	return element
}

function createStringInput(id: string, def: NBTString) {
	const element = createElement("input", { id, className: "string-input" })

	element.type = "text"
	element.placeholder = def.placeholder || ""
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
	element.appendChild(unsetOption)
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
	element.open = true // Open by default
	element.dataset.type = "compound"
	setCompoundChildren(id, def, genericChildren, def.children, specificChildren)

	if ("type" in def.children && def.children.type.type == "select") {
		const registry = getRegistry(def.children.type.registry)
		const firstEntry = registry.values().next().value
		if (firstEntry) setCompoundChildren(id, def, specificChildren, firstEntry.children, specificChildren)
		console.log(id, firstEntry)
	}

	element.appendChild(summaryElement)
	element.appendChild(genericChildren)
	element.appendChild(specificChildren)
	return element
}

function setCompoundChildren(parentId: string, parentDef: NBTCompound, element: HTMLDivElement, children: Record<string, NBTValue>, specificChildrenElement: HTMLDivElement) {
	for (let [key, childDef] of Object.entries(children)) {
		let inputElement: HTMLElement

		if (childDef.type == "text_component") {
			childDef = text_component
		}

		if (childDef.type === "select") {
			inputElement = createSelect(`${parentId}-${key}`, getRegistry(childDef.registry).keys().toArray().map(value => ({ value }))) // Placeholder for options, should be filled with actual data
			if (key == "type") {
				inputElement.addEventListener("change", (event) => {
					const selectElement = event.target as HTMLSelectElement
					const registry = getRegistry(childDef.registry)
					const entry = registry.get(selectElement.value)

					specificChildrenElement.innerHTML = "" // Clear previous specific children
					setCompoundChildren(parentId, parentDef, specificChildrenElement, entry?.children ?? {}, specificChildrenElement)
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
			// @ts-expect-error
			throw new Error(`Unsupported type: ${childDef.type}`)
		}

		inputElement.dataset.key = key
		
		if (["compound", "list", "tuple"].includes(childDef.type)) {
			element.appendChild(inputElement)
			continue
		}

		const label = createElement("label", {})
		label.textContent = key
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
	element.open = true // Open by default
	element.dataset.type = "list"

	addButton.addEventListener("click", () => {
		const itemElement = createListItemInput(id, element.childElementCount - 2, def.elementType) // -2 to skip the summary and add button
		element.appendChild(itemElement)
	})

	element.appendChild(summaryElement)
	element.appendChild(addButton)
	return element
}

function createListItemInput(parentId: string, index: number, elementType: NBTList["elementType"], labelText: string = index+"") {
	let inputElement: HTMLElement

	if (elementType.type === "string") {
		inputElement = createStringInput(`${parentId}-${index}`, elementType)
	} else if (elementType.type === "number") {
		inputElement = createNumberInput(`${parentId}-${index}`, elementType)
	} else if (elementType.type === "boolean") {
		inputElement = createBooleanInput(`${parentId}-${index}`, elementType)
	} else if (elementType.type === "compound") {
		inputElement = createCompoundInput(`${parentId}-${index}`, index+"", elementType)
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