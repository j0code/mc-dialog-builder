import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		url: { type: "string", required: true },
	}
} satisfies NBTCompound