// https://github.com/lucide-icons/lucide/issues/1475

import CircleCheck from 'lucide-svelte/icons/circle-check';
import CircleCheckBig from 'lucide-svelte/icons/circle-check-big';
import CircleX from 'lucide-svelte/icons/circle-x';
import FlaskConical from 'lucide-svelte/icons/flask-conical';
import Info from 'lucide-svelte/icons/info';
import Lightbulb from 'lucide-svelte/icons/lightbulb';
import Link from 'lucide-svelte/icons/link';
import Menu from 'lucide-svelte/icons/menu';
import MessageSquareWarning from 'lucide-svelte/icons/message-square-warning';
import OctagonAlert from 'lucide-svelte/icons/octagon-alert';
import ShieldAlert from 'lucide-svelte/icons/shield-alert';
import StickyNote from 'lucide-svelte/icons/sticky-note';
import SwatchBook from 'lucide-svelte/icons/swatch-book';
import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
import GitHub from './GitHub.svelte';

const I = {
	CircleCheck,
	CircleCheckBig,
	CircleX,
	FlaskConical,
	Info,
	Lightbulb,
	Link,
	Menu,
	MessageSquareWarning,
	OctagonAlert,
	ShieldAlert,
	StickyNote,
	SwatchBook,
	TriangleAlert,
	GitHub,
};

export type Icon = (typeof I)[keyof typeof I];

export default I;
