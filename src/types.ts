import registries from "./registries.js"

export type RegistryKey = keyof typeof registries | `minecraft:${keyof typeof registries}`

export type NBTValue = NBTCompound | NBTList | NBTTuple | NBTSelect | NBTString | NBTNumber | NBTBoolean | NBTTextComponent

export type NBTCompound = {
	type: "compound"
	children: {
		[key: string]: NBTValue
	}
}

export type NBTList = {
	type: "list",
	elementType: Exclude<NBTValue, NBTList>
}

export type NBTTuple = {
	type: "tuple",
	elementType: Exclude<NBTValue, NBTList>,
	labels: string[]
}

export type NBTSelect = {
	type: "select",
	registry: RegistryKey
}

export type NBTString = {
	type: "string",
	placeholder?: string
}

export type NBTNumber = {
	type: "number",
	default?: number,
	min?: number,
	max?: number,
	step?: number
}

export type NBTBoolean = {
	type: "boolean",
	default?: boolean
}

export type NBTTextComponent = {
	type: "text_component"
}

export type BaseTextComponent = {
	type: string,
	color?: string,
	font?: string,
	bold?: boolean,
	italic?: boolean,
	underlined?: boolean,
	strikethrough?: boolean,
	obfuscated?: boolean,
	shadow_color?: [number, number, number, number]
}

export type TextTextComponent = BaseTextComponent & {
	type: "text",
	text: string,
}

export type TextComponent = TextTextComponent