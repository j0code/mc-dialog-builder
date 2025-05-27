import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		translate: { type: "string", placeholder: "Enter translation key", required: true },
		fallback: { type: "string" },
		with: {
			type: "list",
			elementType: { type: "text_component" }
		},
	}
} satisfies NBTCompound