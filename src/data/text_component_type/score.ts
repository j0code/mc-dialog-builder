import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		score: {
			type: "compound",
			children: {
				name: { type: "string", placeholder: "@s", required: true },
				objective: { type: "string", required: true }
			},
			required: true
		}
	}
} satisfies NBTCompound