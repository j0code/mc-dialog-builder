import { NBTCompound } from "../types.js";

export default {
	type: "compound",
	children: {
		item: {
			type: "compound",
			children: {
				item: { type: "string", placeholder: '{ id: "minecraft:stone" }' },
				count: { type: "number", default: 1, min: 1, max: 99, step: 1 },
			}
		},
		description: {
			type: "compound",
			children: {
				contents: { type: "text_component" },
				width: { type: "number", default: 200, min: 1, max: 1024, step: 1 }
			}
		},
		show_decoration: { type: "boolean", default: true },
		show_tooltip: { type: "boolean", default: true },
		width: { type: "number", default: 16, min: 1, max: 256, step: 1 },
		height: { type: "number", default: 16, min: 1, max: 256, step: 1 }
	}
} satisfies NBTCompound