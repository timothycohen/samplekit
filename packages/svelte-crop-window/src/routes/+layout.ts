export const prerender = true;

const colors = {
	iris1: '#13131e',
	iris2: '#171625',
	iris3: '#202248',
	iris4: '#262a65',
	iris5: '#303374',
	iris6: '#3d3e82',
	iris7: '#4a4a95',
	iris8: '#5958b1',
	iris9: '#5b5bd6',
	iris10: '#6e6ade',
	iris11: '#b1a9ff',
	iris12: '#e0dffe',
	mauve11: '#b5b2bc',
	mauve12: '#eeeef0',
};

export const load = async () => {
	return { colors };
};
