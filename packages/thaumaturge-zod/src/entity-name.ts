import { z } from 'zod';

export const extractEntityName = (Entity: z.ZodTypeAny) => {
  const entityName = Entity.description;
  if (!entityName) {
    throw new Error('Entity must have a name.');
  }

  return entityName;
};
