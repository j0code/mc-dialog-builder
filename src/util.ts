export function createElement<K extends keyof HTMLElementTagNameMap>(
	tagName: K,
	options: { id?: string, className?: string }
): HTMLElementTagNameMap[K] {
	const element = document.createElement(tagName) as HTMLElementTagNameMap[K]
	if (options.id) element.id = options.id
	if (options.className) element.className = options.className
	return element
}

export function readFormData(form: HTMLDetailsElement): Record<string, any> {
	const elements = Array.from(form.children[1].children).concat(Array.from(form.children[2].children))

	return readFormElements(elements)
}

export function readFormElements(elements: Element[], array: boolean = false): Record<string, any> {
	const data: Record<string, any> = {}

	for (const element of elements) {
		if (element instanceof HTMLLabelElement) { // boolean, number, string, select
			const input = element.children[0] as HTMLInputElement | HTMLSelectElement
			if (!input) continue

			if (input.type === "checkbox") { // boolean
				data[input.dataset.key!] = input.checked
			} else if (input.type === "number") { // number
				data[input.dataset.key!] = Number(input.value)
			} else { // string or select
				data[input.dataset.key!] = input.value
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
		return Object.values(data)
	}
	return data
}