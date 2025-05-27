import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		id: { type: "string", required: true },
		payload: { type: "string" },
	}
} satisfies NBTCompound