import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		action: {
			type: "dialog_action"
		}
	}
} satisfies NBTCompound