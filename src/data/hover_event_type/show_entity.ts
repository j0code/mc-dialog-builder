import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		name: { type: "text_component" },
		id: { type: "string", required: true },
		uuid: { type: "string", required: true }
	}
} satisfies NBTCompound