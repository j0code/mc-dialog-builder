import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		action: {
			type: "click_action"
		}
	}
} satisfies NBTCompound