import { type NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		action: {
			type: "compound",
			children: {
				type: { type: "select", registry: "click_event" }
			}
		},
		exit_action: { type: "dialog_action" },
		columns: { type: "number", default: 2, min: 1, step: 1 },
		button_width: { type: "number", default: 150, min: 1, max: 1024, step: 1 },
	}
} satisfies NBTCompound