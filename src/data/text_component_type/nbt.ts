import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		source: { type: "string", placeholder: "entity" },
		nbt: { type: "string", placeholder: "Enter NBT path", required: true },
		interpret: { type: "boolean", default: false },
		separator: { type: "text_component" },
		block: { type: "string", placeholder: "0 0 0"},
		entity: { type: "string", placeholder: "@s"},
		storage: { type: "string", placeholder: "minecraft:example_storage" },
	}
} satisfies NBTCompound