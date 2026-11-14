import {
  actionGeneric,
  mutationGeneric,
  queryGeneric,
  type ActionBuilder,
  type DataModelFromSchemaDefinition,
  type MutationBuilder,
  type QueryBuilder,
} from "convex/server";
import type schema from "./schema";

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;
export const query: QueryBuilder<DataModel, "public"> = queryGeneric;
export const mutation: MutationBuilder<DataModel, "public"> = mutationGeneric;
export const action: ActionBuilder<DataModel, "public"> = actionGeneric;
