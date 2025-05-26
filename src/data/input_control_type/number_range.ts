import { NBTCompound } from "../../types.js";

export default {
	type: "compound",
	children: {
		width:   { type: "number", default: 200, min: 1, max: 1024, step: 1 },
		label:   { type: "text_component" },
		label_format: { type: "string", placeholder: "translation key", default: "options.generic_value" },
		initial: { type: "number", step: 0.001 },
		start:   { type: "number", step: 0.001, required: true },
		end:     { type: "number", step: 0.001, required: true },
		step:    { type: "number", min: 0, step: 0.001 }
	}
} satisfies NBTCompound