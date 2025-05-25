import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		width:   { type: "number", default: 200, min: 1, max: 1024, step: 1 },
		label:   { type: "text_component" },
		initial: { type: "number", step: 0.001 },
		start:   { type: "number", step: 0.001 },
		end:     { type: "number", step: 0.001 },
		step:    { type: "number", min: 0, step: 0.001 }
	}
} satisfies NBTCompound