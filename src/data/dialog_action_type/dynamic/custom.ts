import { NBTCompound } from "../../../types.js";

export default {
	type: "compound",
	children: {
		additions: { type: "string", placeholder: "{ a: 5, b: \"hi\" }" }, // TODO: custom compound type
		id: { type: "string", required: true },
	}
} satisfies NBTCompound