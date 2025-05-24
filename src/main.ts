import registries, { getRegistry } from "./registries.js"
import { NBTBoolean, NBTCompound, NBTNumber, NBTString, NBTValue } from "./types.js"

function createForm() {
	const form = createElement("form", { id: "mc-dialog-builder" })
	
	const dialogElement = createCompoundInput("dialog", "Dialog", {
		type: "compound",
		children: {
			type: { type: "select", registry: "minecraft:dialog_type" },
			title: { type: "string", placeholder: "Enter dialog title" },
			external_title: { type: "string", placeholder: "Enter external title" },
			body: {
				type: "compound", children: {
					type: { type: "select", registry: "minecraft:dialog_body_type" }
				}
			},
			can_close_with_escape: { type: "boolean", default: true }
		}
	})

	form.appendChild(dialogElement)
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
	setCompoundChildren(id, genericChildren, def.children)

	if ("type" in def.children && def.children.type.type == "select") {
		const registry = getRegistry(def.children.type.registry)
		const firstEntry = registry.values().next().value
		if (firstEntry) setCompoundChildren(id, specificChildren, firstEntry.children)
		console.log(id, firstEntry)
	}

	element.appendChild(summaryElement)
	element.appendChild(genericChildren)
	element.appendChild(specificChildren)
	return element
}

function setCompoundChildren(parentId: string, element: HTMLDivElement, children: Record<string, NBTValue>) {
	for (let [key, childDef] of Object.entries(children)) {
		let inputElement: HTMLElement

		if (childDef.type == "text_component") {
			childDef = { type: "compound", children: {} } // Placeholder for text component, should be filled with actual data
		}

		if (childDef.type === "select") {
			inputElement = createSelect(`${parentId}-${key}`, getRegistry(childDef.registry).keys().toArray().map(value => ({ value }))) // Placeholder for options, should be filled with actual data
			inputElement.addEventListener("change", (event) => {
				const selectElement = event.target as HTMLSelectElement
				console.log(selectElement.value) // Handle the selected value
			})
		} else if (childDef.type === "string") {
			inputElement = createStringInput(`${parentId}-${key}`, childDef)
		} else if (childDef.type === "number") {
			inputElement = createNumberInput(`${parentId}-${key}`, childDef)
		} else if (childDef.type === "boolean") {
			inputElement = createBooleanInput(`${parentId}-${key}`, childDef)
		} else if (childDef.type == "compound") {
			inputElement = createCompoundInput(`${parentId}-${key}`, key, childDef)
		} else {
			// @ts-expect-error
			throw new Error(`Unsupported type: ${childDef.type}`)
		}
		
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

function createElement<K extends keyof HTMLElementTagNameMap>(
	tagName: K,
	options: { id?: string, className?: string }
): HTMLElementTagNameMap[K] {
	const element = document.createElement(tagName) as HTMLElementTagNameMap[K]
	if (options.id) element.id = options.id
	if (options.className) element.className = options.className
	return element
}

createForm()