// https://github.com/lucide-icons/lucide/issues/1475

import ArrowLeft from 'lucide-svelte/icons/arrow-left';
import ArrowRight from 'lucide-svelte/icons/arrow-right';
import ArrowUp from 'lucide-svelte/icons/arrow-up';
import Badge from 'lucide-svelte/icons/badge';
import BadgeCheck from 'lucide-svelte/icons/badge-check';
import BookOpenText from 'lucide-svelte/icons/book-open-text';
import Boxes from 'lucide-svelte/icons/boxes';
import Check from 'lucide-svelte/icons/check';
import ChevronDown from 'lucide-svelte/icons/chevron-down';
import ChevronUp from 'lucide-svelte/icons/chevron-up';
import CircleCheck from 'lucide-svelte/icons/circle-check';
import CircleX from 'lucide-svelte/icons/circle-x';
import Code from 'lucide-svelte/icons/code';
import Dot from 'lucide-svelte/icons/dot';
import Eraser from 'lucide-svelte/icons/eraser';
import Eye from 'lucide-svelte/icons/eye';
import EyeOff from 'lucide-svelte/icons/eye-off';
import Fingerprint from 'lucide-svelte/icons/fingerprint';
import FlaskConical from 'lucide-svelte/icons/flask-conical';
import FoldVertical from 'lucide-svelte/icons/fold-vertical';
import Image from 'lucide-svelte/icons/image';
import ImagePlus from 'lucide-svelte/icons/image-plus';
import Info from 'lucide-svelte/icons/info';
import KeyRound from 'lucide-svelte/icons/key-round';
import KeySquare from 'lucide-svelte/icons/key-square';
import Lightbulb from 'lucide-svelte/icons/lightbulb';
import Link from 'lucide-svelte/icons/link';
import List from 'lucide-svelte/icons/list';
import Loader from 'lucide-svelte/icons/loader';
import LoaderCircle from 'lucide-svelte/icons/loader-circle';
import MailCheck from 'lucide-svelte/icons/mail-check';
import Menu from 'lucide-svelte/icons/menu';
import MessageSquareWarning from 'lucide-svelte/icons/message-square-warning';
import Minus from 'lucide-svelte/icons/minus';
import MonitorSmartphone from 'lucide-svelte/icons/monitor-smartphone';
import Moon from 'lucide-svelte/icons/moon';
import OctagonAlert from 'lucide-svelte/icons/octagon-alert';
import PanelRightDashed from 'lucide-svelte/icons/panel-right-dashed';
import Pause from 'lucide-svelte/icons/pause';
import Pencil from 'lucide-svelte/icons/pencil';
import Play from 'lucide-svelte/icons/play';
import Plus from 'lucide-svelte/icons/plus';
import Search from 'lucide-svelte/icons/search';
import ShieldAlert from 'lucide-svelte/icons/shield-alert';
import ShieldEllipsis from 'lucide-svelte/icons/shield-ellipsis';
import ShoppingBag from 'lucide-svelte/icons/shopping-bag';
import ShoppingCart from 'lucide-svelte/icons/shopping-cart';
import SlidersHorizontal from 'lucide-svelte/icons/sliders-horizontal';
import Sparkles from 'lucide-svelte/icons/sparkles';
import StickyNote from 'lucide-svelte/icons/sticky-note';
import Sun from 'lucide-svelte/icons/sun';
import Trash2 from 'lucide-svelte/icons/trash-2';
import TriangleAlert from 'lucide-svelte/icons/triangle-alert';
import UnfoldVertical from 'lucide-svelte/icons/unfold-vertical';
import X from 'lucide-svelte/icons/x';

import Google from './Google.svelte';
import Svelte from './Svelte.svelte';

const I = {
	ArrowLeft,
	ArrowRight,
	ArrowUp,
	Badge,
	BadgeCheck,
	BookOpenText,
	Boxes,
	Check,
	ChevronDown,
	ChevronUp,
	CircleCheck,
	CircleX,
	Code,
	Dot,
	Eraser,
	Eye,
	EyeOff,
	Fingerprint,
	FlaskConical,
	FoldVertical,
	Image,
	ImagePlus,
	Info,
	KeyRound,
	KeySquare,
	Lightbulb,
	Link,
	List,
	Loader,
	LoaderCircle,
	MailCheck,
	Menu,
	MessageSquareWarning,
	Minus,
	MonitorSmartphone,
	Moon,
	OctagonAlert,
	PanelRightDashed,
	Pause,
	Pencil,
	Play,
	Plus,
	Search,
	ShieldAlert,
	ShieldEllipsis,
	ShoppingBag,
	ShoppingCart,
	SlidersHorizontal,
	Sparkles,
	StickyNote,
	Sun,
	Trash2,
	TriangleAlert,
	UnfoldVertical,
	X,
	Google,
	Svelte,
};

export type Icon = (typeof I)[keyof typeof I];

export default I;
