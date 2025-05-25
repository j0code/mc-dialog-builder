import { previewDialog } from "./preview.js"
import { getRegistry } from "./registries.js"
import text_component from "./text_component.js"
import { NBTBoolean, NBTCompound, NBTList, NBTNumber, NBTString, NBTValue } from "./types.js"
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

	return element
}

function createStringInput(id: string, def: NBTString) {
	const element = createElement("input", { id, className: "string-input" })

	element.type = "text"
	element.placeholder = def.placeholder || ""

	return element
}

function createNumberInput(id: string, def: NBTNumber) {
	const element = createElement("input", { id, className: "text-input" })

	element.type = "number"
	if (def.min)  element.min  = String(def.min)
	if (def.max)  element.max  = String(def.max)
	if (def.step) element.step = String(def.step)
	element.value = String(def.default || def.min || 0)

	return element
}

function createBooleanInput(id: string, def: NBTBoolean) {
	const element = createElement("input", { id, className: "boolean-input" })

	element.type = "checkbox"
	if (def.default) {
		element.checked = true
	}

	return element

}

function createCompoundInput(id: string, name: string, def: NBTCompound) {
	const element = createElement("details", { id, className: "compound-input" })
	const summaryElement = createElement("summary", { className: "compound-input-name" })
	const genericChildren = createElement("div", { className: "compound-input-generic-children" })
	const specificChildren = createElement("div", { className: "compound-input-specific-children" })

	summaryElement.textContent = name
	element.open = true // Open by default
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
			inputElement = createListInput(`${parentId}-${key}`, childDef)
		} else {
			// @ts-expect-error
			throw new Error(`Unsupported type: ${childDef.type}`)
		}

		inputElement.dataset.key = key
		
		if (childDef.type === "compound") {
			element.appendChild(inputElement)
			continue
		}

		const label = createElement("label", {})
		label.textContent = key
		label.appendChild(inputElement)
		element.appendChild(label)
	}
}

function createListInput(id: string, def: NBTList) {
	const element = createElement("div", { id, className: "list-input" })
	const addButton = createElement("button", { className: "add-button" })
	addButton.textContent = "Add Item"
	addButton.type = "button"

	addButton.addEventListener("click", () => {
		const itemElement = createListItemInput(id, element.childElementCount - 1, def.elementType)
		element.appendChild(itemElement)
	})

	element.appendChild(addButton)
	return element
}

function createListItemInput(parentId: string, index: number, elementType: NBTList["elementType"]) {
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

	if (elementType.type === "compound") {
		return inputElement
	}

	const label = createElement("label", {})
	label.textContent = index+""
	label.appendChild(inputElement)
	return label
}