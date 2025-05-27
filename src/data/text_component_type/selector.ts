import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		selector: { type: "string", placeholder: "@p", required: true },
		separator: { type: "text_component" }
	}
} satisfies NBTCompound