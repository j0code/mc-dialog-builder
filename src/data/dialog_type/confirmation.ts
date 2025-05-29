import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		yes: {
			type: "dialog_action"
		},
		no: {
			type: "dialog_action"
		}
	}
} satisfies NBTCompound