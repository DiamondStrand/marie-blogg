export interface NavLink {
	href: string;
	label: string;
	icon?: string; // optional heroicons or iconify id
	cta?: boolean; // marks primary action
	footer?: boolean; // marks footer link
	header?: boolean; // marks header link
}

// Primary navigation links (order matters)<
export const MAIN_NAV: NavLink[] = [
	{ href: '/', label: 'Hem', icon: 'home-20-solid', footer: false, header: true },
	{ href: '/', label: 'Demo 1', icon: 'home-20-solid', footer: true, header: false },
	{ href: '/demo-two', label: 'Demo 2', icon: 'squares-2x2-20-solid', footer: true, header: false },
	{ href: '/demo-three', label: 'Demo 3', icon: 'newspaper-20-solid', footer: true },
	{
		href: '/alla-inlagg',
		label: 'Alla inlägg',
		icon: 'arrow-right-20-solid',
		footer: false,
		header: true
	}
];

// Primary call-to-action (kept separate for layout flexibility)
export const MAIN_CTA: NavLink = {
	href: '/alla-inlagg',
	label: 'Börja läsa',
	icon: 'arrow-right-20-solid',
	cta: true
};

// Helper to find nav item by href (could be used for breadcrumbs later)
export function findNav(href: string): NavLink | undefined {
	return MAIN_NAV.find((l) => l.href === href) || (MAIN_CTA.href === href ? MAIN_CTA : undefined);
}
