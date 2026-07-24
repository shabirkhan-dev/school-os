import { SearchInput } from "@school-os/ui/components/search-input";

export function HeaderSearch() {
	return (
		<SearchInput aria-label="Search" placeholder="Search" showShortcut className="global-search" />
	);
}
