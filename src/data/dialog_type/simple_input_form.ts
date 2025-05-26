import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		action: {
			type: "submit_action"
		},
		inputs: {
			type: "list",
			elementType: {
				type: "input_control"
			},
			required: true
		}
	}
} satisfies NBTCompound