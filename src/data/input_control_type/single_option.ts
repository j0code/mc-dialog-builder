import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		width: { type: "number", default: 200, min: 1, max: 1024, step: 1 },
		label: { type: "text_component" },
		label_visible: { type: "boolean", default: true },
		options: {
			type: "list",
			elementType: {
				type: "compound",
				children: {
					id: { type: "string" },
					display: { type: "text_component" },
					initial: { type: "boolean" }
				}
			}
		}
	}
} satisfies NBTCompound