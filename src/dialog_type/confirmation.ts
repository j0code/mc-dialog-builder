import { NBTCompound } from "../types.js";

export default {
	type: "compound",
	children: {
		yes: {
			type: "click_action"
		},
		no: {
			type: "click_action"
		}
	}
} satisfies NBTCompound