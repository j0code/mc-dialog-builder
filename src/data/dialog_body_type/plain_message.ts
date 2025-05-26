import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		contents: { type: "text_component", required: true },
		width: { type: "number", default: 200, min: 1, max: 1024, step: 1, required: true },
	}
} satisfies NBTCompound