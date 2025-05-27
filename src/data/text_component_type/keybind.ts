import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		keybind: { type: "string", placeholder: "Enter keybind indentifier", required: true }
	}
} satisfies NBTCompound