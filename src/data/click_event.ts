import { NBTCompound } from "../types.js";

export default {
	type: "compound",
	children: {
		action: {
			type: "select",
			registry: "click_event_type"
		}
	},
} satisfies NBTCompound