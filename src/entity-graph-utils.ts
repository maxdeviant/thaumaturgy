import { EntityGraph, ManifestWithRefs } from './entity-graph';
import { EntityC, EntityName } from './types';

export type Batch = EntityC[];

export const topologicallyBatchEntities = (
  entitiesToBatch: EntityC[],
  manifestWithRefs: ManifestWithRefs
) => {
  const entities = entitiesToBatch.slice();

  const entityGraph = new EntityGraph(entitiesToBatch, manifestWithRefs);

  const refCounts = entities
    .flatMap(Entity => {
      const node = entityGraph.get(Entity.name);

      return node?.refs ?? [];
    })
    .reduce((acc, ref) => {
      if (!acc[ref]) {
        acc[ref] = 0;
      }

      acc[ref]++;

      return acc;
    }, {} as Record<EntityName, number>);

  const batches: Batch[] = [];

  while (entities.length) {
    const batch: Batch = entities.filter(Entity => {
      const node = entityGraph.get(Entity.name);
      if (!node) {
        return false;
      }

      return node.refs.filter(ref => refCounts[ref]).length === 0;
    });

    batches.push(batch);

    for (const Entity of batch) {
      delete refCounts[Entity.name];
      entities.splice(entities.indexOf(Entity), 1);
    }
  }

  return batches;
};
