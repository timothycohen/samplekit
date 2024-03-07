const createRandomTimeBetween = (h1: number, h2: number) => {
	const d1 = new Date(Date.now() - 1000 * 60 * 60 * h1);
	const d2 = new Date(Date.now() - 1000 * 60 * 60 * h2);
	const diff = d1.getTime() - d2.getTime();
	const newDiff = Math.random() * diff;
	const date = new Date(d2.getTime() + newDiff);
	return date;
};

export const loadDummyData = () => {
	const a1 = { author: 'Olivia', avatar: 50 };
	const a2 = { author: 'Xavier', avatar: 16 };
	const a3 = { author: 'Isabella', avatar: 38 };
	const a4 = { author: 'Elijah', avatar: 4 };

	const messages = [
		{
			...a1,
			message: 'The mysterious old house creaked in the eerie silence of the night.',
			date: createRandomTimeBetween(0, 1),
		},
		{
			...a4,
			message: 'Sunflowers nodded in agreement as a gentle breeze whispered through the field.',
			date: createRandomTimeBetween(3, 4),
		},
		{
			...a3,
			message: 'The rhythmic sound of raindrops on the roof played a soothing lullaby.',
			date: createRandomTimeBetween(8, 10),
		},
		{
			...a3,
			message: 'A mischievous squirrel darted across the park, stealing glances from curious onlookers.',
			date: createRandomTimeBetween(26, 30),
		},
		{
			...a1,
			message: 'The antique pocket watch ticked with precision, a relic from a bygone era.',
			date: createRandomTimeBetween(35, 40),
		},
		{
			...a4,
			message: 'A kaleidoscope of colors painted the sky as the sun bid farewell to the day.',
			date: createRandomTimeBetween(24 * 3, 24 * 5),
		},
		{
			...a2,
			message: 'Laughter echoed through the bustling marketplace, creating a lively atmosphere.',
			date: createRandomTimeBetween(24 * 5, 24 * 7),
		},
		{
			...a4,
			message: 'The scent of freshly baked bread wafted through the air, enticing hungry passersby.',
			date: createRandomTimeBetween(24 * 8, 24 * 9),
		},
		{
			...a1,
			message: 'A lone wolf howled in the distance, its mournful cry carrying through the night.',
			date: createRandomTimeBetween(24 * 9, 24 * 10),
		},
		{
			...a3,
			message: 'The magician waved his wand, and a burst of sparks filled the darkened room.',
			date: createRandomTimeBetween(24 * 10, 24 * 11),
		},
		{
			...a2,
			message: 'Time seemed to stand still as the dancer twirled gracefully on the empty stage.',
			date: createRandomTimeBetween(24 * 11, 24 * 12),
		},
		{
			...a2,
			message: 'The old bookstore held the musty fragrance of aging paper, a treasure trove for book lovers.',
			date: createRandomTimeBetween(24 * 12, 24 * 13),
		},
	];

	return {
		messages,
		authors: [a1, a2, a3, a4].map((a) => a.author),
	};
};

export type DummyData = ReturnType<typeof loadDummyData>;
