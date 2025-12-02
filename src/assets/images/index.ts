import button from "./button.png";
import menu from "./menu.png";
import pipesSpritesheet from "./pipes_tileset.png";
import clouds from "./orig_big 17.png";
export const pipesAtlas = {
	frames: {
		straight: {
			frame: {x: 0, y: 96, w: 32, h: 32},
			sourceSize: {w: 32, h: 32},
			spriteSourceSize: {x: 0, y: 0, w: 32, h: 32},
		},
		curved: {
			frame: {x: 0, y: 0, w: 32, h: 32},
			sourceSize: {w: 32, h: 32},
			spriteSourceSize: {x: 0, y: 0, w: 32, h: 32},
		},
		cross: {
			frame: {x: 0, y: 64, w: 32, h: 32},
			sourceSize: {w: 32, h: 32},
			spriteSourceSize: {x: 0, y: 0, w: 32, h: 32},
		},
		straightFilled: {
			frame: {x: 96, y: 96, w: 32, h: 32},
			sourceSize: {w: 32, h: 32},
			spriteSourceSize: {x: 0, y: 0, w: 32, h: 32},
		},
		curvedFilled: {
			frame: {x: 96, y: 0, w: 32, h: 32},
			sourceSize: {w: 32, h: 32},
			spriteSourceSize: {x: 0, y: 0, w: 32, h: 32},
		},
		crossFilled: {
			frame: {x: 96, y: 64, w: 32, h: 32},
			sourceSize: {w: 32, h: 32},
			spriteSourceSize: {x: 0, y: 0, w: 32, h: 32},
		},
		start: {
			frame: {x: 128, y: 64, w: 32, h: 32},
			sourceSize: {w: 32, h: 32},
			spriteSourceSize: {x: 0, y: 0, w: 32, h: 32},
		},
	},
	meta: {
		image: "pipes_tileset.png",
		format: "RGBA8888",
		size: {w: 192, h: 160},
		scale: 1,
	},
};
export {button, menu, pipesSpritesheet, clouds};
