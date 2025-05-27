import run_command from "./data/click_event_type/run_command.js"
import item from "./data/dialog_body_type/item.js"
import plain_message from "./data/dialog_body_type/plain_message.js"
import confirmation from "./data/dialog_type/confirmation.js"
import dialog_list from "./data/dialog_type/dialog_list.js"
import multi_action from "./data/dialog_type/multi_action.js"
import notice from "./data/dialog_type/notice.js"
import server_links from "./data/dialog_type/server_links.js"
import simple_input_form from "./data/dialog_type/simple_input_form.js"
import command_template from "./data/submit_method_type/command_template.js"
import custom_form from "./data/submit_method_type/custom_form.js"
import custom_template from "./data/submit_method_type/custom_template.js"
import text from "./data/text_component_type/text.js"
import input_control_text from "./data/input_control_type/text.js"
import { NBTCompound, RegistryKey } from "./types.js"
import boolean from "./data/input_control_type/boolean.js"
import single_option from "./data/input_control_type/single_option.js"
import number_range from "./data/input_control_type/number_range.js"
import multi_action_input_form from "./data/dialog_type/multi_action_input_form.js"

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
	["minecraft:simple_input_form", simple_input_form],
	["minecraft:multi_action_input_form", multi_action_input_form]
])

const text_component_type = new Map<string, NBTCompound>([
	["text", text]
])

const click_event_type = new Map<string, NBTCompound>([
	["run_command", run_command]
])

const submit_method_type = new Map<string, NBTCompound>([
	["minecraft:custom_form",      custom_form],
	["minecraft:command_template", command_template],
	["minecraft:custom_template",  custom_template],
])

const input_control_type = new Map<string, NBTCompound>([
	["minecraft:text",          input_control_text],
	["minecraft:boolean",       boolean],
	["minecraft:single_option", single_option],
	["minecraft:number_range",  number_range],
])

const registries = {
	dialog_type,
	dialog_body_type,
	text_component_type,
	click_event_type,
	submit_method_type,
	input_control_type
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