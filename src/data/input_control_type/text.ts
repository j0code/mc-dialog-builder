import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		width: { type: "number", default: 200, min: 1, max: 1024, step: 1 },
		label_visible: { type: "boolean" },
		initial: { type: "string" },
		max_length: { type: "number", default: 32, min: 1, step: 1 },
		multiline: {
			type: "compound",
			children: {
				max_lines: { type: "number", default: 0, min: 1, step: 1 },
				height: { type: "number", default: 0, min: 1, max: 512, step: 1, required: true },
			}
		}
	}
} satisfies NBTCompound