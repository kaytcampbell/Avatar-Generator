'use client';

import { useState, type ComponentType } from 'react';
import { LayoutGrid, Gem, UtensilsCrossed, Sparkles, Image as ImageIcon, WandSparkles } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ASSET_CATEGORIES, getAssetsByCategory, getAllProps } from '@/lib/assets/placeholder-assets';
import { AssetLibraryItem } from './AssetLibraryItem';
import { CategoryUploadButton } from './CategoryUploadButton';
import { CustomPropCard } from './CustomPropCard';
import { CustomPropsPanel } from './CustomPropsPanel';
import type { AssetCategory, PlaceableAsset } from '@/types/asset';
import type { CustomProp } from '@/types/custom-prop';
import type { CustomPropsStatus } from '@/hooks/useCustomProps';

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  accessories: 'Accessories',
  'food-drink': 'Food & Drink',
  effects: 'Effects',
  backgrounds: 'Backgrounds',
};

const CATEGORY_ICONS: Record<AssetCategory, ComponentType<{ className?: string }>> = {
  accessories: Gem,
  'food-drink': UtensilsCrossed,
  effects: Sparkles,
  backgrounds: ImageIcon,
};

interface AssetLibraryProps {
  onAddAsset: (asset: PlaceableAsset) => void;
  onSetBackground: (asset: PlaceableAsset) => void;
  onRemoveBackground: () => void;
  activeBackgroundAssetId: string | null;
  userId: string | null;
  customProps: CustomProp[];
  customPropsStatus: CustomPropsStatus;
  customPropsError: string | null;
  onSaveCustomProp: (prop: CustomProp) => void;
  onRenameCustomProp: (id: string, name: string) => void;
  onDeleteCustomProp: (id: string) => void;
  onDeleteCustomProps: (ids: string[]) => void;
}

interface NavTriggerProps {
  value: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

function NavTrigger({ value, label, icon: Icon }: NavTriggerProps) {
  return (
    <TabsTrigger
      value={value}
      className="group flex h-auto flex-col items-center gap-1.5 rounded-xl border-l-2 border-transparent px-2 py-3 font-heading text-xs font-bold text-foreground transition-colors data-[state=inactive]:hover:text-violet-600 data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-950/40"
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-data-[state=inactive]:group-hover:text-violet-600 group-data-[state=active]:bg-violet-600 group-data-[state=active]:text-white">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      {label}
    </TabsTrigger>
  );
}

export function AssetLibrary({
  onAddAsset,
  onSetBackground,
  onRemoveBackground,
  activeBackgroundAssetId,
  userId,
  customProps,
  customPropsStatus,
  customPropsError,
  onSaveCustomProp,
  onRenameCustomProp,
  onDeleteCustomProp,
  onDeleteCustomProps,
}: AssetLibraryProps) {
  const allProps = getAllProps();

  // Bulk delete-select mode: scoped to whichever category tab is currently
  // visible, reset whenever the user switches tabs so stale checkboxes/
  // selections never carry over to a different tab.
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleDeleteSelected() {
    onDeleteCustomProps(Array.from(selectedIds));
    setDeleteMode(false);
    setSelectedIds(new Set());
  }

  function handleCancelDelete() {
    setDeleteMode(false);
    setSelectedIds(new Set());
  }

  return (
    <Tabs
      defaultValue="all"
      orientation="vertical"
      className="h-full"
      onValueChange={() => {
        setDeleteMode(false);
        setSelectedIds(new Set());
      }}
    >
      <TabsList className="h-fit w-20 shrink-0 flex-col items-stretch gap-1 bg-transparent p-0">
        <NavTrigger value="all" label="All" icon={LayoutGrid} />
        {ASSET_CATEGORIES.map((category) => (
          <NavTrigger key={category} value={category} label={CATEGORY_LABELS[category]} icon={CATEGORY_ICONS[category]} />
        ))}
        <NavTrigger value="custom-props" label="My Props" icon={WandSparkles} />
      </TabsList>

      <div className="min-w-0 flex-1 overflow-hidden">
        <TabsContent value="all" className="h-full">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-2 gap-2 p-2">
              {allProps.map((asset) => (
                <AssetLibraryItem key={asset.id} asset={asset} onSelect={onAddAsset} />
              ))}
              {customProps.map((prop) => (
                <CustomPropCard
                  key={prop.id}
                  prop={prop}
                  onAdd={() => onAddAsset(prop)}
                  onRename={(name) => onRenameCustomProp(prop.id, name)}
                  onDelete={() => onDeleteCustomProp(prop.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="custom-props" className="h-full">
          <ScrollArea className="h-full">
            <CustomPropsPanel
              userId={userId}
              customProps={customProps}
              status={customPropsStatus}
              error={customPropsError}
              onAddAsset={onAddAsset}
              onSave={onSaveCustomProp}
              onRename={onRenameCustomProp}
              onDelete={onDeleteCustomProp}
            />
          </ScrollArea>
        </TabsContent>

        {ASSET_CATEGORIES.map((category) => {
          const assets = getAssetsByCategory(category);
          const categoryCustomProps = customProps.filter((prop) => prop.category === category);
          const isBackgroundsTab = category === 'backgrounds';
          // Backgrounds and props share the same widened PlaceableAsset
          // signature now, so onSetBackground/onAddAsset can be used directly
          // for either built-in Assets or category-tagged CustomProps.
          const handleSelect = isBackgroundsTab ? onSetBackground : onAddAsset;
          const isEmpty = assets.length === 0 && categoryCustomProps.length === 0;
          return (
            <TabsContent key={category} value={category} className="h-full">
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-2 p-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {!deleteMode && userId && (
                      <CategoryUploadButton category={category} userId={userId} onUploaded={onSaveCustomProp} />
                    )}
                    {!deleteMode && categoryCustomProps.length > 0 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => setDeleteMode(true)}>
                        Delete props…
                      </Button>
                    )}
                    {deleteMode && (
                      <>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={selectedIds.size === 0}
                          onClick={handleDeleteSelected}
                        >
                          Delete Selected
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={handleCancelDelete}>
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                  {isEmpty ? (
                    <p className="p-2 text-sm text-muted-foreground">Nothing here yet — more good stuff on the way!</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {assets.map((asset) => (
                        <AssetLibraryItem
                          key={asset.id}
                          asset={asset}
                          onSelect={handleSelect}
                          isActive={isBackgroundsTab && asset.id === activeBackgroundAssetId}
                        />
                      ))}
                      {categoryCustomProps.map((prop) =>
                        isBackgroundsTab ? (
                          <AssetLibraryItem
                            key={prop.id}
                            asset={prop}
                            onSelect={handleSelect}
                            isActive={prop.id === activeBackgroundAssetId}
                            selectable={deleteMode}
                            selected={selectedIds.has(prop.id)}
                            onToggleSelect={() => toggleSelected(prop.id)}
                          />
                        ) : (
                          <CustomPropCard
                            key={prop.id}
                            prop={prop}
                            onAdd={() => onAddAsset(prop)}
                            onRename={(name) => onRenameCustomProp(prop.id, name)}
                            onDelete={() => onDeleteCustomProp(prop.id)}
                            selectable={deleteMode}
                            selected={selectedIds.has(prop.id)}
                            onToggleSelect={() => toggleSelected(prop.id)}
                          />
                        ),
                      )}
                    </div>
                  )}
                  {isBackgroundsTab && activeBackgroundAssetId && (
                    <Button variant="ghost" size="sm" onClick={onRemoveBackground} className="w-fit">
                      Remove background
                    </Button>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          );
        })}
      </div>
    </Tabs>
  );
}
