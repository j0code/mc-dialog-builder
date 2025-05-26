import { NBTCompound } from "../types.js";

export default {
	type: "compound",
	children: {
		label: { type: "text_component", required: true },
		tooltip: { type: "text_component" },
		width: { type: "number", default: 150, min: 1, max: 1024, step: 1, required: true },
		id: { type: "string", required: true },
		on_submit: {
			type: "compound",
			children: {
				type: {
					type: "select",
					registry: "submit_method_type",
					required: true
				},
				key: { type: "string", required: true }
			},
			required: true
		}
	}
} satisfies NBTCompound