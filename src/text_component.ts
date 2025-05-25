import { NBTList } from "./types.js";

export default {
	type: "list",
	elementType: {
		type: "compound",
		children: {
			type: { type: "select", registry: "minecraft:text_component_type" }
		}
	}
} satisfies NBTList