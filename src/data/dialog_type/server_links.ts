import { type NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		action: {
			type: "dialog_action"
		},
		exit_action: { type: "dialog_action" },
		columns: { type: "number", default: 2, min: 1, step: 1 },
		button_width: { type: "number", default: 150, min: 1, max: 1024, step: 1 },
	}
} satisfies NBTCompound