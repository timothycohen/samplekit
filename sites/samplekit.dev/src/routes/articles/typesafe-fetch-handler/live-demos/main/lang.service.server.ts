import { type Lang } from './lang.service.common';

export const EN = ['Yellow', 'Blue', 'Red', 'Green', 'Black', 'Brown', 'Pink', 'Purple', 'White'];
export const KO = ['노란색 ', '파란색 ', '빨간색 ', '초록색 ', '검정색 ', '갈색 ', '분홍색 ', '보라색 ', '흰색 '];
export const DE = ['Gelb', 'Blau', 'Rot', 'Grün', 'Schwarz', 'Braun', 'Rosa', 'Lila', 'Weiß'];
export const colors: Record<Lang, string[]> = { DE, EN, KO };

export const getNewColor = ({ excludeColor, lang }: { lang: Lang; excludeColor: string }) => {
	const langColors = colors[lang];

	let newColor = excludeColor;
	while (newColor === excludeColor) {
		newColor = langColors[Math.floor(Math.random() * langColors.length)]!;
	}

	return newColor;
};
