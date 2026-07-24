import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(50),
  orderBy: z.string().min(1).optional(),
  orderDirection: z.enum(["asc", "desc"]).default("desc"),
  queryFilter: z.string().min(1).optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export type PaginationEnvelope<T> = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  items: T[];
};

/** Reads page/perPage from parsed pagination query params into a Prisma skip/take pair. */
export function toSkipTake(pagination: Pick<PaginationQuery, "page" | "perPage">) {
  return {
    skip: (pagination.page - 1) * pagination.perPage,
    take: pagination.perPage,
  };
}

export function toPaginationEnvelope<T>(
  items: T[],
  total: number,
  pagination: Pick<PaginationQuery, "page" | "perPage">,
): PaginationEnvelope<T> {
  return {
    page: pagination.page,
    perPage: pagination.perPage,
    total,
    totalPages: Math.max(1, Math.ceil(total / pagination.perPage)),
    items,
  };
}
