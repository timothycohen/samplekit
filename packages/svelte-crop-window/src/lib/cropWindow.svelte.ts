import { defaultCropValue } from './utils/defaults.js';
import type { CropValue } from './utils/types.js';

export class CropWindow {
	//#region Initialization
	// initialized in constructor()
	cropValue: CropValue = $state() as CropValue;

	constructor(props?: { cropValue?: CropValue }) {
		this.cropValue = props?.cropValue ?? defaultCropValue;
	}
	//#endregion Initialization
}
