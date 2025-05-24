import plain_message from "./dialog_body_type/plain_message.js"
import { NBTCompound, RegistryKey } from "./types.js"

const dialog_body_type = new Map<string, NBTCompound>([
	["minecraft:plain_message", plain_message]
])

const dialog_type = new Map<string, NBTCompound>([
	
])

const registries = {
	dialog_type,
	dialog_body_type
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