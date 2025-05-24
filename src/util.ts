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
	const data: Record<string, any> = {}
	const elements = Array.from(form.children[1].children).concat(Array.from(form.children[2].children))

	for (const element of elements) {
		if (element instanceof HTMLLabelElement) {
			const input = element.children[0] as HTMLInputElement | HTMLSelectElement
			if (!input) continue

			if (input.type === "checkbox") {
				data[input.dataset.key!] = input.checked
			} else if (input.type === "number") {
				data[input.dataset.key!] = Number(input.value)
			} else {
				data[input.dataset.key!] = input.value
			}
		} else if (element instanceof HTMLDetailsElement) {
			data[element.dataset.key!] = readFormData(element)
		}
	}

	return data
}