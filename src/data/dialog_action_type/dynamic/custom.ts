import { NBTCompound } from "../../../types.js";

export default {
	type: "compound",
	children: {
		/*additions: { type: "" },*/ // TODO: custom compound type
		id: { type: "string", required: true },
	}
} satisfies NBTCompound