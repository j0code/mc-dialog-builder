import run_command from "./data/click_event_type/run_command.js"
import item from "./data/dialog_body_type/item.js"
import plain_message from "./data/dialog_body_type/plain_message.js"
import confirmation from "./data/dialog_type/confirmation.js"
import dialog_list from "./data/dialog_type/dialog_list.js"
import multi_action from "./data/dialog_type/multi_action.js"
import notice from "./data/dialog_type/notice.js"
import server_links from "./data/dialog_type/server_links.js"
import text from "./data/text_component_type/text.js"
import input_control_text from "./data/input_control_type/text.js"
import { NBTCompound } from "./types.js"
import boolean from "./data/input_control_type/boolean.js"
import single_option from "./data/input_control_type/single_option.js"
import number_range from "./data/input_control_type/number_range.js"
import open_url from "./data/click_event_type/open_url.js"
import suggest_command from "./data/click_event_type/suggest_command.js"
import copy_to_clipboard from "./data/click_event_type/copy_to_clipboard.js"
import show_dialog from "./data/click_event_type/show_dialog.js"
import custom from "./data/click_event_type/custom.js"
import translatable from "./data/text_component_type/translatable.js"
import score from "./data/text_component_type/score.js"
import selector from "./data/text_component_type/selector.js"
import keybind from "./data/text_component_type/keybind.js"
import nbt from "./data/text_component_type/nbt.js"
import dynamic_run_command from "./data/dialog_action_type/dynamic/run_command.js"
import dynamic_custom from "./data/dialog_action_type/dynamic/custom.js"
import show_text from "./data/hover_event_type/show_text.js"
import show_item from "./data/hover_event_type/show_item.js"
import show_entity from "./data/hover_event_type/show_entity.js"

type PlainRegistryKey = "dialog_type" | "dialog_body_type" | "text_component_type"
	| "click_event_type" | "input_control_type" | "dialog_action_type" | "hover_event_type"
export type RegistryKey = PlainRegistryKey | `minecraft:${PlainRegistryKey}`

const dialog_body_type = new Map<string, NBTCompound>([
	["minecraft:plain_message", plain_message],
	["minecraft:item", item]
])

const dialog_type = new Map<string, NBTCompound>([
	["minecraft:notice", notice],
	["minecraft:confirmation", confirmation],
	["minecraft:multi_action", multi_action],
	["minecraft:server_links", server_links],
	["minecraft:dialog_list",  dialog_list],
	// ["minecraft:simple_input_form", simple_input_form], /// LEGACY, removed in 1.21.6-pre1
	// ["minecraft:multi_action_input_form", multi_action_input_form] /// LEGACY, removed in 1.21.6-pre1
])

const text_component_type = new Map<string, NBTCompound>([
	["text",         text],
	["translatable", translatable],
	["score",        score],
	["selector",     selector],
	["keybind",      keybind],
	["nbt",          nbt],
])

const click_event_type = new Map<string, NBTCompound>([
	["open_url",          open_url],
	["run_command",       run_command],
	["suggest_command",   suggest_command],
	["copy_to_clipboard", copy_to_clipboard],
	["show_dialog",       show_dialog],
	["custom",            custom],
])

/*const submit_method_type = new Map<string, NBTCompound>([ /// LEGACY, remove in 1.21.6-pre1
	["minecraft:custom_form",      custom_form],
	["minecraft:command_template", command_template],
	["minecraft:custom_template",  custom_template],
])*/

const input_control_type = new Map<string, NBTCompound>([
	["minecraft:text",          input_control_text],
	["minecraft:boolean",       boolean],
	["minecraft:single_option", single_option],
	["minecraft:number_range",  number_range],
])

const dialog_action_type = new Map<string, NBTCompound>(click_event_type.entries().toArray().concat([
	["minecraft:dynamic/run_command", dynamic_run_command],
	["minecraft:dynamic/custom", dynamic_custom]
]))

const hover_event_type = new Map<string, NBTCompound>([
	["show_text",   show_text],
	["show_item",   show_item],
	["show_entity", show_entity]
])

const registries: Record<PlainRegistryKey, Map<string, NBTCompound>> = {
	dialog_type,
	dialog_body_type,
	text_component_type,
	click_event_type,
	input_control_type,
	dialog_action_type,
	hover_event_type
} as const

export default registries

export function getRegistry(name: RegistryKey): Map<string, NBTCompound> {
	type regkey = keyof typeof registries
	let key: regkey
	if (name.startsWith("minecraft:")) {
		key = name.substring(10) as regkey // Remove "minecraft:" prefix
	} else {
		key = name as regkey
	}
	return registries[key]
}