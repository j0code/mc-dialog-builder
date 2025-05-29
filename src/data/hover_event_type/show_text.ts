import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		value: { type: "text_component", required: true }
	}
} satisfies NBTCompound