import { NBTCompound } from "../types.js";

export default {
	type: "compound",
	children: {
		label: { type: "text_component", required: true },
		tooltip: { type: "text_component" },
		width: { type: "number", default: 150, min: 1, max: 1024, step: 1 },
		action: {
			type: "compound",
			children: {
				type: { type: "select", registry: "dialog_action_type" }
			}
		}
	}
} satisfies NBTCompound