import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		command: { type: "string", required: true },
	}
} satisfies NBTCompound