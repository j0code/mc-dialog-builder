import { NBTCompound } from "../../../types.js";

export default {
	type: "compound",
	children: {
		template: { type: "string", required: true },
	}
} satisfies NBTCompound