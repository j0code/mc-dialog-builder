import registries from "./registries.js"

export type RegistryKey = keyof typeof registries | `minecraft:${keyof typeof registries}`

export type NBTValue = NBTCompound | NBTList | NBTTuple | NBTSelect | NBTString | NBTNumber | NBTBoolean | NBTTextComponent | NBTClickAction | NBTClickEvent

export type NBTCompound = {
	type: "compound"
	children: {
		[key: string]: NBTValue
	}
}

export type NBTList = {
	type: "list",
	elementType: NBTValue
}

export type NBTTuple = {
	type: "tuple",
	elementType: NBTValue,
	labels: string[]
}

export type NBTSelect = {
	type: "select",
	registry: RegistryKey
}

export type NBTString = {
	type: "string",
	default?: string,
	placeholder?: string,
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

export type NBTClickAction = {
	type: "click_action"
}

export type NBTClickEvent = {
	type: "click_event"
}

export type NBTSubmitAction = {
	type: "submit_action"
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

export type ButtonAction = {
	label: TextComponent[],
	tooltip?: TextComponent[],
	width: number,
	on_click: ClickEvent
}

export type ClickEvent = {
	action: "open_url",
	url: string
} | {
	action: "open_file",
	path: string
} | {
	action: "run_command",
	command: string
} | {
	action: "suggest_command",
	command: string
} | {
	action: "change_page",
	page: number
} | {
	action: "copy_to_clipboard",
	valze: string
} | {
	action: "show_dialog",
	dialog: string
} | {
	action: "custom",
	id: string,
	payload: string
}