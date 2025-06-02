import { type RegistryKey } from "./registries.js"
import { type THEMES } from "./controls.js"

export type Settings = {
	autoReload: boolean,
	highlightRequired: boolean,
	theme: typeof THEMES[number],
	guiScale: number,
	uiRatio: number
}

export type NBTValue =
	| NBTCompound | NBTList | NBTTuple | NBTSelect | NBTString
	| NBTNumber | NBTBoolean | NBTTextComponent | NBTTextClickAction
	| NBTTextClickEvent | NBTDialogAction | NBTInputControl

export type NBTCompound = {
	type: "compound"
	children: {
		[key: string]: NBTValue
	},
	required?: boolean,
}

export type NBTList = {
	type: "list",
	elementType: NBTValue,
	required?: boolean,
}

export type NBTTuple = {
	type: "tuple",
	elementType: NBTValue,
	labels: string[],
	required?: boolean,
}

export type NBTSelect = {
	type: "select",
	registry: RegistryKey,
	required?: boolean,
}

export type NBTString = {
	type: "string",
	default?: string,
	placeholder?: string,
	required?: boolean,
}

export type NBTNumber = {
	type: "number",
	default?: number,
	min?: number,
	max?: number,
	step?: number,
	required?: boolean,
}

export type NBTBoolean = {
	type: "boolean",
	default?: boolean,
	required?: boolean,
}

export type NBTTextComponent = {
	type: "text_component",
	required?: boolean,
}

export type NBTTextClickAction = {
	type: "click_action",
	required?: boolean,
}

export type NBTDialogAction = {
	type: "dialog_action",
	required?: boolean,
}

export type NBTTextClickEvent = {
	type: "click_event",
	required?: boolean,
}


export type NBTInputControl = {
	type: "input_control",
	required?: boolean,
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
	shadow_color?: [number, number, number, number],
	click_event?: TextClickEvent,
	hover_event?: TextHoverEvent
}

export type TextTextComponent = BaseTextComponent & {
	type: "text",
	text: string,
}

export type TranslatableTextComponent = BaseTextComponent & {
	type: "translatable",
	translate: string,
	fallback?: string,
	with?: TextComponent[]
}

export type ScoreTextComponent = BaseTextComponent & {
	type: "score",
	score: {
		name: string,
		objective: string
	}
}

export type SelectorTextComponent = BaseTextComponent & {
	type: "selector",
	selector: string,
	separator?: TextComponent[]
}

export type KeybindTextComponent = BaseTextComponent & {
	type: "keybind",
	keybind: string
}

export type DataTextComponent = BaseTextComponent & {
	type: "nbt",
	source?: "entity" | "block" | "storage",
	nbt: string,
	interpret?: boolean,
	separator?: TextComponent[],
	block?: string,
	entity?: string,
	storage?: string
}

export type TextComponent = TextTextComponent | TranslatableTextComponent | ScoreTextComponent | SelectorTextComponent | KeybindTextComponent | DataTextComponent

export type TextClickEvent = {
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
	value: string
} | {
	action: "show_dialog",
	dialog: string
} | {
	action: "custom",
	id: string,
	payload: string
}

export type TextHoverEvent = {
	action: "show_text",
	value: TextComponent[]
} | {
	action: "show_item",
	id: string,
	count?: number,
	components?: any
} | {
	action: "show_entity",
	name?: TextComponent[],
	id: string,
	uuid: string | [number, number, number, number]
}

export type DialogAction = {
	label: TextComponent[],
	tooltip?: TextComponent[],
	width?: number,
	action?: DialogActionType
}

export type DialogActionType = {
	type: "minecraft:open_url",
	url: string
} | {
	type: "minecraft:run_command",
	command: string
} | {
	type: "minecraft:suggest_command",
	command: string
} | {
	type: "minecraft:change_page",
	page: number
} | {
	type: "minecraft:copy_to_clipboard",
	value: string
} | {
	type: "minecraft:show_dialog",
	dialog: string
} | {
	type: "minecraft:custom",
	id: string,
	payload: string
} | {
	type: "minecraft:dynamic/run_command",
	template?: string
} | {
	type: "minecraft:dynamic/custom",
	additions?: any, // arbitrary nbt compound
	id?: string
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

export type BodyElement = {
	type: "minecraft:plain_message",
	contents: TextComponent[],
	width?: number
} | {
	type: "minecraft:item",
	item: {
		id: string,
		count?: number,
		components?: Record<string, any>
	},
	description?: {
		contents: TextComponent[],
		width?: number
	},
	show_decoration?: boolean,
	show_tooltip?: boolean,
	width?: number,
	height?: number
}