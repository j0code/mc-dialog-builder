import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		id: { type: "string", required: true },
		count: { type: "number", min: 1, max: 99, step: 1 },
		// components: { type: "" } // TODO: item components
	}
} satisfies NBTCompound