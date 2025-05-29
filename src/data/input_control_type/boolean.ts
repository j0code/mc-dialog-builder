import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		initial: { type: "boolean" },
		on_true: { type: "string", placeholder: "true" },
		on_false: { type: "string", placeholder: "false" }
	}
} satisfies NBTCompound