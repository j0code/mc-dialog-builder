import run_command from "./click_event_type/run_command.js"
import item from "./dialog_body_type/item.js"
import plain_message from "./dialog_body_type/plain_message.js"
import confirmation from "./dialog_type/confirmation.js"
import multi_action from "./dialog_type/multi_action.js"
import notice from "./dialog_type/notice.js"
import text from "./text_component_type/text.js"
import { NBTCompound, RegistryKey } from "./types.js"

const dialog_body_type = new Map<string, NBTCompound>([
	["minecraft:plain_message", plain_message],
	["minecraft:item", item]
])

const dialog_type = new Map<string, NBTCompound>([
	["minecraft:notice", notice],
	["minecraft:confirmation", confirmation],
	["minecraft:multi_action", multi_action]
])

const text_component_type = new Map<string, NBTCompound>([
	["text", text]
])

const click_event_type = new Map<string, NBTCompound>([
	["run_command", run_command]
])

const registries = {
	dialog_type,
	dialog_body_type,
	text_component_type,
	click_event_type
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