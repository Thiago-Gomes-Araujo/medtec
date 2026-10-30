import type { AdminSection } from '@/lib/admin-navigation';

interface FilterableNavigationFolder {
  label: string;
  visible: boolean;
  items: {
    section: AdminSection;
    label: string;
    tooltip: string;
    visible: boolean;
  }[];
}

// Usa os rótulos e permissões recebidos; títulos e descrições de seção não ampliam a busca.
export function filterAdminNavigation<TFolder extends FilterableNavigationFolder>(folders: TFolder[], sidebarSearch: string) {
  const searchQuery = sidebarSearch.trim().toLowerCase();
  const isSearching = searchQuery.length > 0;
  const homeMatchesSearch = !isSearching || 'início resumo do painel visão geral home'.includes(searchQuery);

  const filteredFolders = folders
    .map<TFolder>((folder) => {
      if (!folder.visible) return { ...folder, items: [] };

      const folderNameMatches = folder.label.toLowerCase().includes(searchQuery);
      const matchedItems = folder.items.filter((item) => {
        if (!item.visible) return false;
        if (!isSearching || folderNameMatches) return true;
        return (
          item.label.toLowerCase().includes(searchQuery) ||
          item.tooltip.toLowerCase().includes(searchQuery)
        );
      });

      return {
        ...folder,
        items: matchedItems,
        visible: matchedItems.length > 0,
      };
    })
    .filter((folder) => folder.visible);

  const hasAnySearchResult = homeMatchesSearch || filteredFolders.length > 0;

  return { isSearching, homeMatchesSearch, filteredFolders, hasAnySearchResult };
}
