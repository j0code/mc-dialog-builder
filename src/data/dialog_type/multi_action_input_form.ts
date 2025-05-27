import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		actions: {
			type: "list",
			elementType: {
				type: "submit_action"
			},
			required: true
		},
		columns: { type: "number", default: 2, min: 1, step: 1, required: true },
		inputs: {
			type: "list",
			elementType: {
				type: "input_control"
			},
			required: true
		}
	}
} satisfies NBTCompound