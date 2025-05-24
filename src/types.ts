import registries from "./registries.js"

export type RegistryKey = keyof typeof registries | `minecraft:${keyof typeof registries}`

export type NBTValue = NBTCompound | NBTSelect | NBTString | NBTNumber | NBTBoolean | NBTTextComponent

export type NBTCompound = {
	type: "compound"
	children: {
		[key: string]: NBTValue
	}
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