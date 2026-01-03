import type { KindProps } from './common';
import type { Interaction } from '../../domain/types';
import {
  NameField,
  TypeField,
  ListSection,
  SectionTitle,
  OptionsSection,
  type StyledListItem,
  DescriptionSection,
} from './sections';

type ExtendedKindProps = KindProps & {
  nodeNames?: Record<string, string>;
};

export default function ParameterMenu(p: ExtendedKindProps) {
  const d: any = p.node.data;
  const disabled = p.disabled;

  const handleToggleHidden = (
    category: 'data' | 'interactions',
    val: boolean
  ) => {
    const nextCats = { ...(d.collapsedCategories || {}), [category]: val };
    p.onChange({ collapsedCategories: nextCats } as any);
    window.dispatchEvent(
      new CustomEvent('designer:toggle-hidden', {
        detail: { nodeId: p.node.id, category, hidden: val },
      })
    );
  };

  const interactions: Interaction[] = Array.isArray(d.interactions)
    ? (d.interactions as Interaction[])
    : [];

  const interactionListItems: (StyledListItem & {
    _interactionId: string;
    _targetId?: string;
    _targetDataRef?: string;
  })[] = [];

  interactions.forEach((ix) => {
    if (ix.targetDetails && ix.targetDetails.length > 0) {
      ix.targetDetails.forEach((detail) => {
        const targetName =
          p.nodeNames?.[detail.targetId] || detail.targetId || 'Unknown';
        let subtitle = `Target: ${targetName}`;
        if (detail.targetDataRef) subtitle += ' (Data)';
        interactionListItems.push({
          name: ix.name,
          badge: ix.result,
          subtitle,
          _interactionId: ix.id,
          _targetId: detail.targetId,
          _targetDataRef: detail.targetDataRef,
        });
      });
    } else if (ix.targets && ix.targets.length > 0) {
      ix.targets.forEach((targetId) => {
        const targetName = p.nodeNames?.[targetId] || targetId;
        interactionListItems.push({
          name: ix.name,
          badge: ix.result,
          subtitle: `Target: ${targetName}`,
          _interactionId: ix.id,
          _targetId: targetId,
        });
      });
    } else {
      interactionListItems.push({
        name: ix.name,
        badge: ix.result,
        subtitle: '(No target)',
        _interactionId: ix.id,
      });
    }
  });

  const options = d.options as string[] | undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontWeight: 700, textAlign: 'center' }}>MENU</div>
      <SectionTitle>Properties</SectionTitle>
      <NameField
        value={d.title ?? ''}
        onChange={(val) => p.onChange({ title: val })}
        disabled={disabled}
      />
      <TypeField value="Parameter" />

      <DescriptionSection
        placeholder="Describe this parameter"
        value={d.description}
        disabled={disabled}
        onChange={(val) => p.onChange({ description: val })}
      />

      <OptionsSection
        title="Parameter options"
        items={options ?? []}
        onChange={(list) => p.onChange({ options: list })}
        disabled={disabled}
      />

      <SectionTitle>Actions</SectionTitle>

      <ListSection
        title="Interaction list"
        items={interactionListItems}
        onAdd={() => {
          window.dispatchEvent(
            new CustomEvent('designer:open-interactions', {
              detail: { nodeId: p.node.id },
            })
          );
        }}
        onItemClick={(i) => {
          const item = interactionListItems[i];
          if (item) {
            window.dispatchEvent(
              new CustomEvent('designer:select-interaction', {
                detail: {
                  interactionId: item._interactionId,
                  targetId: item._targetId,
                  targetDataRef: item._targetDataRef,
                },
              })
            );
          }
        }}
        addTooltip="Add interaction"
        disabled={disabled}
        hidden={d.collapsedCategories?.interactions}
        onToggleHidden={(v) => handleToggleHidden('interactions', v)}
      />
    </div>
  );
}
