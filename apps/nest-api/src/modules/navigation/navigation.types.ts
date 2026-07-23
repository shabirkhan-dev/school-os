export type NavigationNode = {
	id: string;
	key: string;
	label: string;
	href: string | null;
	iconKey: string | null;
	children: NavigationNode[];
};

export type NavigationSection = {
	heading: string;
	items: NavigationNode[];
};

export type NavigationResponse = {
	sections: NavigationSection[];
};
