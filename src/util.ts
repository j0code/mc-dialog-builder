import { TextComponent, TextTextComponent } from "./types.js"

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

export function readFormData(form: HTMLDetailsElement): Record<string, any> {
	const elements = Array.from(form.children[1].children).concat(Array.from(form.children[2].children))

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
				data[input.dataset.key!] = input.value || undefined
			}
		} else if (element instanceof HTMLDetailsElement) { // compound, list, tuple
			if (element.classList.contains("compound-input")) { // compound
				data[element.dataset.key!] = readFormData(element)
			} else { // list or tuple
				data[element.dataset.key!] = readFormElements(Array.from(element.children), true)
			}
		}
	}

	if (array) {
		const list = Object.values(data)
		return list.length > 0 ? list : undefined
	}
	return data
}

export function resolveTextComponent(component: TextComponent): TextTextComponent {
	// console.log("resolveTextComponent", component)
	if (component.type == "text") {
		return component
	}
	return { type: "text", text: "ERROR! Unknown TextComponent type!" }
}

export function resolveTextComponents(components: TextComponent | TextComponent[]): TextTextComponent[] {
	if (!Array.isArray(components)) return [resolveTextComponent(components)]
	return components.map(resolveTextComponent)
}

export function stringifyTextComponents(components: TextComponent | TextComponent[]): string {
	return resolveTextComponents(components).map(comp => comp.text).join("")
}