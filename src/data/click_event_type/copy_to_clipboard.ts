import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		value: { type: "string", required: true },
	}
} satisfies NBTCompound