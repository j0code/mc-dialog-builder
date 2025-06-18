import { NBTCompound } from "../types.js";

export default {
	type: "compound",
	children: {
		label: { type: "text_component", required: true },
		tooltip: { type: "text_component" },
		width: { type: "number", default: 150, min: 1, max: 1024, step: 1 },
		action: {
			type: "compound",
			children: {
				type: { type: "select", registry: "dialog_action_type" }
			}
		}
	},
	tooltip: {
		title: "Dialog Action",
		description: [
			"A dialog action describes buttons of a dialog.",
			"label: Label displayed on the button.",
			"tooltip: Text to display when button is highlighted or hovered over.",
			"width: Width of the button. Defaults to 150.",
			"action: An action to perform when the button is clicked."
		]
	}
} satisfies NBTCompound