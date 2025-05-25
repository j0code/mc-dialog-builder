import { NBTCompound } from "../../types.js";

export default {
		type: "compound",
		children: {
			actions: {
				type: "list",
				elementType: {
					type: "click_action"
				}
			},
			columns: { type: "number", default: 2, min: 1, step: 1 },
			on_cancel: { type: "click_event" },
		}
	} satisfies NBTCompound