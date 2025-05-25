import { NBTCompound } from "../types.js";

export default {
	type: "compound",
	children: {
		type: { type: "select", registry: "input_control_type" },
		key: { type: "string" }
	}
} satisfies NBTCompound