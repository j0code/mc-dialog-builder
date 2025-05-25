import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		label: { type: "text_component" },
		initial: { type: "boolean", default: false },
		on_true: { type: "string", default: "true" },
		on_false: { type: "string", default: "false" }
	}
} satisfies NBTCompound