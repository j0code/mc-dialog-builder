import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		template: { type: "string", placeholder: '/tellraw @a "$(action)"', required: true },
	}
} satisfies NBTCompound