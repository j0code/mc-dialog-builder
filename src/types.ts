import registries from "./registries.js"

export type RegistryKey = keyof typeof registries | `minecraft:${keyof typeof registries}`

export type NBTValue =
	| NBTCompound | NBTList | NBTTuple | NBTSelect | NBTString
	| NBTNumber | NBTBoolean | NBTTextComponent | NBTClickAction
	| NBTClickEvent | NBTSubmitAction | NBTInputControl

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

export type NBTInputControl = {
	type: "input_control"
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

export type SubmitAction = {
	label: TextComponent[],
	tooltip?: TextComponent[],
	width: number,
	on_submit: SubmitEvent
}

export type SubmitEvent = {
	action: "minecraft:command_template",
	template: string
} | {
	action: "minecraft:custom_template",
	template: string,
	id: string
} | {
	action: "minecraft:custom_form",
	id: string
}

export type BaseInputControl = {
	type: string,
	key: string
}

export type TextInputControl = BaseInputControl & {
	type: "minecraft:text",
	width: number,
	label: TextComponent[],
	label_visible?: boolean,
	initial: string,
	max_length?: number,
	multiline?: {
		max_lines: number,
		height: number
	}
}

export type BooleanInputControl = BaseInputControl & {
	type: "minecraft:boolean",
	label: TextComponent[],
	initial?: boolean,
	on_true: string,
	on_false: string
}

export type SingleOptionInputControl = BaseInputControl & {
	type: "minecraft:single_option",
	width: number,
	label: TextComponent[],
	label_visible?: boolean,
	options: {
		id: string,
		display: TextComponent[],
		initial?: boolean
	}[]
}

export type NumberRangeInputControl = BaseInputControl & {
	type: "minecraft:number_range",
	width: number,
	label: TextComponent[],
	initial: number,
	min: number,
	max: number,
	step: number
}

export type InputControl = TextInputControl | BooleanInputControl | SingleOptionInputControl | NumberRangeInputControl