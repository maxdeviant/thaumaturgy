import { ManifestedRef } from './ref';
import { Entity, EntityName } from './types';

export type ManifestWithRefs = (
  Entity: Entity,
  overrides: Partial<any>
) => {
  manifestedEntity: any;
  refs: ManifestedRef<any, any>[];
};

export class EntityGraphNode {
  readonly refs: EntityName[] = [];

  constructor(readonly Entity: Entity) {}
}

export class EntityGraph {
  private readonly nodes: EntityGraphNode[] = [];
  private readonly nodesByName = new Map<EntityName, EntityGraphNode>();

  constructor(entities: Entity[], manifestWithRefs: ManifestWithRefs) {
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
