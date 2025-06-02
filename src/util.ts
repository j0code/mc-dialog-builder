import { BaseTextComponent, TextComponent, TextHoverEvent, TextTextComponent } from "./types.js"
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
	const dialog = form.children[0] as HTMLDivElement
	
	try {
		return readFormCompoundData(dialog)
	} catch (e) {
		if (!(e instanceof ValidationError)) throw e
		console.error("ValidationError:", e.message)
		return e
	}
}

export function readFormCompoundData(form: HTMLDivElement): Record<string, any> {
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
				} else if (input.dataset.type == "string") {
					value = unescapeBackslash(value)
				}
				
				if (value || input.required) data[input.dataset.key!] = value || ""
			}
		} else if (element instanceof HTMLDivElement && element.dataset.type) { // compound, list, tuple
			if (element.dataset.type == "compound") { // compound
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

function extractBaseTextComponentProps(component: TextComponent): Omit<BaseTextComponent, "type"> {
	// List of type-specific properties to exclude
	const baseProps = [
		"color", "font", "bold", "italic", "underlined", "strikethrough",
		"obfuscated", "shadow_color", "click_event", "hover_event"
	]

	type BaseProp = (typeof baseProps)[number]

	const base: Record<string, any> = {}
	for (const key in component) {
		if (baseProps.includes(key)) {
			base[key] = (component as any)[key]
		}
	}

	return base
}

function resolveTextComponent(component: TextComponent): TextTextComponent | TextTextComponent[] { // TODO: keep formatting
	// console.log("resolveTextComponent", component)
	const base = extractBaseTextComponentProps(component)

	if (component.type == "text") {
		return { ...base, type: "text", text: component.text }
	} else if (component.type == "translatable") {
		return { ...base, type: "text", text: component.translate }
	} else if (component.type == "score") {
		return { ...base, type: "text", text: "" }
	} else if (component.type == "selector") {
		const names = ["Alex", "Steve"]
		const separator: TextTextComponent | TextTextComponent[] = component.separator ? resolveTextComponents(component.separator) : { type: "text", text: ", ", color: "gray" }
		const nameComponents = names.map(name => createPlayerNameComponent(name, base))
		// Merge base into each resolved component
		return textComponentJoin(nameComponents, separator)
	} else if (component.type == "keybind") {
		return { ...base, type: "text", text: component.keybind }
	} else if (component.type == "nbt") {
		return { ...base, type: "text", text: component.nbt }
	}
	return { ...base, type: "text", text: "ERROR! Unknown TextComponent type!" }
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

function createPlayerNameComponent(name: string, base: Omit<BaseTextComponent, "type">): TextTextComponent { // TODO: add tooltip
	const uuid = crypto.randomUUID()
	const tooltip = resolveTooltip({ action: "show_entity", name: [{type: "text", text: name}], id: "minecraft:player", uuid })

	return {
		hover_event: { action: "show_text", value: tooltip },
		...base,
		type: "text",
		text: name
	}
}

function textComponentJoin<
	TComp extends TextComponent = TextComponent,
	TSep  extends TextComponent = TextComponent
>(
	components: TComp[],
	separator: TSep | TSep[]
): (TComp | TSep | TextTextComponent)[] {
	if (components.length == 0) return [{ type: "text", text: "" }]
	if (components.length == 1) return [components[0]]

	let list: (TComp | TSep)[] = []
	for (let i = 0; i < components.length; i++) {
		if (i > 0) list = list.concat(separator)
		list.push(components[i])
	}

	return list
}

function unescapeBackslash(text: string): string {
	text = text.replaceAll("\u0000", "")
	text = text.replaceAll("\\\\", "\u0000")
	text = text.replaceAll("\\n", "\n")
	text = text.replaceAll("\u0000", "\\")

	return text
}

export function resolveTooltip(event: TextHoverEvent): TextComponent[] {
	if (event.action == "show_text") {
		return event.value
	} if (event.action == "show_item") {
		const {ns, name} = decomposeId(event.id)
		const compCount = Object.keys(event.components || {}).length

		return [
			{ type: "translatable", translate: `block.${ns}.${name}\n` },
			{ type: "text", text: `${ns}:${name}\n`, color: "dark_gray" }, 
			{ type: "text", text: `${compCount} component(s)`, color: "dark_gray" }, 
		]
	} else if (event.action == "show_entity") {
		const {ns, name} = decomposeId(event.id)
		const uuid = UUIDtoString(event.uuid)
		const arr: TextComponent[] = [
			{ type: "text", text: `Type: ` },
			{ type: "translatable", translate: `entity.${ns}.${name}` },
			{ type: "text", text: "\n" },
			{ type: "text", text: uuid }
		]

		if (event.name) return [...event.name, { type: "text", text: `\n` }, ...arr]
		return arr
	}
	return []
}

function decomposeId(id: string) {
	const arr  = id.split(":")
	const ns   = arr.length == 2 ? arr[0] : "minecraft"
	const name = arr.length == 2 ? arr[1] : id

	return {ns, name}
}

function UUIDtoString(uuid: string | [number, number, number, number]): string {
	if (typeof uuid == "string") return uuid

	const buffer = new Uint32Array(uuid) // underflows negative ints into high numbers
	const hex = buffer.values().map(n => n.toString(16)).toArray()

	return `${hex[0]}-${hex[1].substring(0, 4)}-${hex[1].substring(4)}-${hex[2].substring(0, 4)}-${hex[2].substring(4)}${hex[3]}`
	// 00000000-1111-1111-2222-222233333333     (digits are indices of hex)
}

// from minecraft.wiki
const colorMap: Record<string, string> = {
	black:        "#000000",
	dark_blue:    "#0000AA",
	dark_green:   "#00AA00",
	dark_aqua:    "#00AAAA",
	dark_red:     "#AA0000",
	dark_purple:  "#AA00AA",
	gold:         "#FFAA00",
	gray:         "#AAAAAA",
	dark_gray:    "#555555",
	blue:         "#5555FF",
	green:        "#55FF55",
	aqua:         "#55FFFF",
	red:          "#FF5555",
	light_purple: "#FF55FF",
	yellow:       "#FFFF55",
	white:        "#FFFFFF"
}

export function decodeColor(color: string) {
	if (color in colorMap) return colorMap[color]
	if (/^#([A-Fa-f0-9]{6})$/i.test(color)) return color // valid hex color
	return "white"
}

export function hexToRgb(hex: string): [number, number, number] {
	hex = hex.replace("#", "")

	const num = parseInt(hex, 16)
	return [
		(num >> 16),
		(num >> 8) & 255,
		num & 255
	]
}

export function shadowFor(color: string | undefined): [number, number, number, number] {
	if (!color) return [0.75, 0.75, 0.75, 0.25] // darkened white

	color = decodeColor(color)
	const [r, g, b] = hexToRgb(color)

	return [r / 255 * 0.75, g / 255 * 0.75, b / 255 * 0.75, 0.25]
}

/**
 * Triggers on left click or Enter key press
 * @param element Element to register the events on
 * @param cb Callback to call when triggered
 */
export function onTrigger(element: HTMLElement, cb: () => void) {
	element.addEventListener("click", e => {
		if (e.button == 0) {
			cb()
			e.preventDefault()
		}
	})

	element.addEventListener("keypress", e => {
		if (e.code == "Enter") {
			cb()
			e.preventDefault()
		}
	})
}