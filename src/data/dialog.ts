import { NBTCompound } from "../types.js";

export default {
	type: "compound",
	children: {
		type: { type: "select", registry: "minecraft:dialog_type", required: true },
		title: { type: "string", placeholder: "Enter dialog title", required: true },
		external_title: { type: "string", placeholder: "Enter external title" },
		body: {
			type: "list",
			elementType: {
				type: "compound", children: {
					type: { type: "select", registry: "minecraft:dialog_body_type" }
				}
			}
		},
		inputs: {
			type: "list",
			elementType: {
				type: "input_control"
			}
		},
		can_close_with_escape: { type: "boolean" },
		pause: { type: "boolean" },
		/*after_action: close | none | wait_for_response */
	},
	required: true
} satisfies NBTCompound