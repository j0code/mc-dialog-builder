import { TextComponent, TextTextComponent } from "./types.js"
import ValidationError from "./ValidationError.js"

export function createElement<K extends keyof HTMLElementTagNameMap>(
	tagName: K,
	options: { id?: string, className?: string, value?: any, textContent?: string } = {}
): HTMLElementTagNameMap[K] {
	const element = document.createElement(tagName) as HTMLElementTagNameMap[K]
	if (options.id) element.id = options.id
	if (options.className) element.className = options.className
	if (options.value && "value" in element) element.value = options.value
	if (options.textContent) element.textContent = options.textContent
	return element
}

export function $<K extends keyof HTMLElementTagNameMap>(query: string, tagName?: K): HTMLElementTagNameMap[K] {
	const element = document.querySelector(query)

	if (!element) throw new Error(`Element not found for query: ${query}`)
	if (tagName && element.tagName.toLowerCase() !== tagName) {
		throw new Error(`Element found for query: ${query}, but it is not a ${tagName}.`)
	}

	return element as HTMLElementTagNameMap[K]
}

export function readFormData(form: HTMLFormElement): Record<string, any> | ValidationError {
	const dialog = form.children[0] as HTMLDetailsElement
	
	try {
		return readFormCompoundData(dialog)
	} catch (e) {
		if (!(e instanceof ValidationError)) throw e
		console.error("ValidationError:", e.message)
		return e
	}
}

export function readFormCompoundData(form: HTMLDetailsElement): Record<string, any> {
	const childrenContainer = form.children[1]
	const elements = Array.from(childrenContainer.children[0].children).concat(Array.from(childrenContainer.children[1].children))

	return readFormElements(elements) || {}
}

export function readFormElements(elements: Element[], array: boolean = false): Record<string, any> | undefined {
	const data: Record<string, any> = {}

	for (const element of elements) {
		if (element instanceof HTMLLabelElement) { // boolean, number, string, select
			const input = element.children[0] as HTMLInputElement | HTMLSelectElement
			if (!input) continue

			if (input.dataset.type === "boolean") { // boolean
				data[input.dataset.key!] = input.value === "true" ? true : (input.value === "false" ? false : undefined)
			} else if (input.type === "number") { // number
				data[input.dataset.key!] = Number(input.value)
			} else { // string, select
				let value = input.value
				if (input.dataset.type == "select" && value == "@") {
					value = ""
					if (input.required) {
						throw new ValidationError("%s is required!", input.id)
					}
				}
				
				if (value || input.required) data[input.dataset.key!] = value || ""
			}
		} else if (element instanceof HTMLDetailsElement) { // compound, list, tuple
			if (element.classList.contains("compound-input")) { // compound
				const compoundData = readFormCompoundData(element)
				if (Object.keys(compoundData).length == 0) {
					if (element.dataset.required == "true") {
						throw new ValidationError("%s is required!", element.id)
					} else {
						continue
					}
				}
				data[element.dataset.key!] = readFormCompoundData(element)
			} else { // list or tuple
				const childrenContainer = element.children[1]
				const children = Array.from(childrenContainer.children)
				if (element.dataset.required == "false" && children.length == 0) continue
				data[element.dataset.key!] = readFormElements(children, true) ?? []
			}
		}
	}

	if (array) {
		const list = Object.values(data)
		return list.length > 0 ? list : undefined
	}
	return data
}

function resolveTextComponent(component: TextComponent): TextTextComponent | TextTextComponent[] { // TODO: keep formatting
	// console.log("resolveTextComponent", component)
	if (component.type == "text") {
		return component
	} else if (component.type == "translatable") {
		return { type: "text", text: component.translate }
	} else if (component.type == "score") {
		return { type: "text", text: "" }
	} else if (component.type == "selector") {
		const names = ["Alex", "Steve"]
		const separator: TextComponent | TextComponent[] = component.separator ?? { type: "text", text: ", ", color: "gray" }
		const nameComponents = names.map(name => createPlayerNameComponent(name))
		return resolveTextComponents(textComponentJoin(nameComponents, separator))
	} else if (component.type == "keybind") {
		return { type: "text", text: component.keybind }
	}else if (component.type == "nbt") {
		return { type: "text", text: component.nbt }
	}
	return { type: "text", text: "ERROR! Unknown TextComponent type!" }
}

export function resolveTextComponents(components: TextComponent | TextComponent[]): TextTextComponent[] {
	let comps: TextTextComponent[] = []
	if (!Array.isArray(components)) {
		components = [components]
	}

	components.forEach(comp => {
		const resolved = resolveTextComponent(comp)
		comps = comps.concat(resolved)
	})

	return comps
}

export function stringifyTextComponents(components: TextComponent | TextComponent[]): string {
	return resolveTextComponents(components).map(comp => comp.text).join("")
}

function createPlayerNameComponent(name: string): TextTextComponent { // TODO: add tooltip
	/*const uuid = crypto.randomUUID()
	const tooltip: TextTextComponent = {
		type: "text",
		text: `${name}\nType: Player\n${uuid}`,
	}*/

	return {
		type: "text",
		text: name
	}
}

function textComponentJoin(components: TextComponent[], separator: TextComponent | TextComponent[]): TextComponent[] {
	if (components.length == 0) return [{ type: "text", text: "" }]
	if (components.length == 1) return [components[0]]

	let list: TextComponent[] = []
	for (let i = 0; i < components.length; i++) {
		if (i > 0) list = list.concat(separator)
		list.push(components[i])
	}

	return list
}