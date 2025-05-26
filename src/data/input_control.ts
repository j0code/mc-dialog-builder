import { NBTCompound } from "../types.js";

export default {
	type: "compound",
	children: {
		type: { type: "select", registry: "input_control_type", required: true },
		key: { type: "string", required: true },
		label: { type: "text_component", required: true }
	}
} satisfies NBTCompound