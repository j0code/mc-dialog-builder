import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		width: { type: "number", default: 200, min: 1, max: 1024, step: 1 },
		label: { type: "text_component", required: true },
		label_visible: { type: "boolean" },
		options: {
			type: "list",
			elementType: {
				type: "compound",
				children: {
					id: { type: "string", required: true },
					display: { type: "text_component" },
					initial: { type: "boolean" }
				}
			},
			required: true
		}
	}
} satisfies NBTCompound