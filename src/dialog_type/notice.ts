import { NBTCompound } from "../types.js";

export default {
	type: "compound",
	children: {
		action: {
			type: "compound",
			children: {
				label: { type: "string", placeholder: "Enter action label" },
				tooltip: { type: "string", placeholder: "Enter action tooltip" },
				width: { type: "number", default: 150, min: 1, max: 1024, step: 1 },
				on_click: {
					type: "compound",
					children: {}
				}
			}
		}
	}
} satisfies NBTCompound