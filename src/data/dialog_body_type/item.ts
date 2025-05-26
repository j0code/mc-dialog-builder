import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		item: {
			type: "compound",
			children: {
				id: { type: "string", placeholder: "minecraft:stone" },
				count: { type: "number", default: 1, min: 1, max: 99, step: 1 },
			},
			required: true
		},
		description: {
			type: "compound",
			children: {
				contents: { type: "text_component", required: true },
				width: { type: "number", default: 200, min: 1, max: 1024, step: 1, required: true }
			}
		},
		show_decoration: { type: "boolean" },
		show_tooltip: { type: "boolean" },
		width: { type: "number", default: 16, min: 1, max: 256, step: 1, required: true },
		height: { type: "number", default: 16, min: 1, max: 256, step: 1, required: true }
	}
} satisfies NBTCompound