import * as t from 'io-ts';
import { ManifestedRef } from './ref';
import { EntityName } from './types';

export type ManifestWithRefs = <C extends t.Any>(
  Entity: C,
  overrides: Partial<t.TypeOf<C>>
) => {
  manifestedEntity: any;
  refs: ManifestedRef<C, any>[];
};

export class EntityGraphNode<C extends t.Any> {
  readonly refs: EntityName[] = [];

  constructor(readonly Entity: C) {}
}

export class EntityGraph {
  private readonly nodes: EntityGraphNode<t.Any>[] = [];
  private readonly nodesByName = new Map<EntityName, EntityGraphNode<t.Any>>();

  constructor(entities: t.Any[], manifestWithRefs: ManifestWithRefs) {
    for (const Entity of entities) {
      const node = new EntityGraphNode(Entity);
      this.nodes.push(node);
      this.nodesByName.set(Entity.name, node);
    }

    for (const node of this.nodes) {
      const { refs } = manifestWithRefs(node.Entity, {});

      for (const ref of refs) {
        const entityNode = this.get(ref.Entity.name);
        if (entityNode) {
          node.refs.push(ref.Entity.name);
        }
      }
    }
  }

  get(entityName: EntityName) {
    return this.nodesByName.get(entityName);
  }
}
