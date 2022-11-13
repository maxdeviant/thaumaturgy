import { z } from 'zod';
import { extractEntityName } from './entity-name';
import { ManifestedRef } from './ref';
import { EntityC, EntityName } from './types';

export type ManifestWithRefs = <C extends EntityC>(
  Entity: C,
  overrides: Partial<z.TypeOf<C>>
) => {
  manifestedEntity: any;
  refs: ManifestedRef<C, any>[];
};

export class EntityGraphNode<C extends EntityC> {
  readonly refs: EntityName[] = [];

  constructor(readonly Entity: C) {}
}

export class EntityGraph {
  private readonly nodes: EntityGraphNode<EntityC>[] = [];
  private readonly nodesByName = new Map<
    EntityName,
    EntityGraphNode<EntityC>
  >();

  constructor(entities: EntityC[], manifestWithRefs: ManifestWithRefs) {
    for (const Entity of entities) {
      const node = new EntityGraphNode(Entity);
      this.nodes.push(node);
      this.nodesByName.set(extractEntityName(Entity), node);
    }

    for (const node of this.nodes) {
      const { refs } = manifestWithRefs(node.Entity, {});

      for (const ref of refs) {
        const entityNode = this.get(extractEntityName(ref.Entity));
        if (entityNode) {
          node.refs.push(extractEntityName(ref.Entity));
        }
      }
    }
  }

  get(entityName: EntityName) {
    return this.nodesByName.get(entityName);
  }
}
