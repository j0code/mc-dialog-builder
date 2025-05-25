import { NBTCompound } from "../types.js";

export default {
	type: "compound",
	children: {
		label: { type: "text_component" },
		tooltip: { type: "text_component" },
		width: { type: "number", default: 150, min: 1, max: 1024, step: 1 },
		on_submit: {
			type: "compound",
			children: {
				action: {
					type: "select",
					registry: "submit_method_type"
				}
			},
		}
	}
} satisfies NBTCompound