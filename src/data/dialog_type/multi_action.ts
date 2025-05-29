import { NBTCompound } from "../../types.js";

export default {
		type: "compound",
		children: {
			actions: {
				type: "list",
				elementType: {
					type: "click_action"
				},
				required: true
			},
			columns: { type: "number", default: 2, min: 1, step: 1 },
			exit_action: { type: "click_action" },
		}
	} satisfies NBTCompound