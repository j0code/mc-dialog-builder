import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		text: { type: "string", placeholder: "Enter text", required: true }
	}
} satisfies NBTCompound