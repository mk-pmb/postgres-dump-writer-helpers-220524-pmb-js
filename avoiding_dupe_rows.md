
Avoiding duplicate rows
=======================

… is more complex than I had hoped:
I'd love to use a hash index to quickly detect non-dupes, like this:

```sql
CREATE INDEX "pets_no_duplicate_rows" ON "public"."pets"
    USING HASH ("id", "name", "genus", "species", "details");
ALTER TABLE "public"."pets" ADD CONSTRAINT "pets_no_duplicate_rows"
  UNIQUE ("id", "name", "genus", "species", "details") NULLS NOT DISTINCT
  USING INDEX "pets_no_duplicate_rows";
```

Thas way, we could restrict comparison of actual data to rows with the same
hash. Due to the rarity of hash collisions, this means we'd usually only
compare at most one row, and that row (if found) is almost certainly an
exact dupe.

Of course, that would be waaay too easy.

* First, `NULLS NOT DISTINCT` isn't implemented in Postgres 17, so we have
  to drop that right away or we get `syntax error at or near "NULLS"`.
* The hash function only works for one column, and in Postgres 17
  we cannot use `HASH (json_agg(json_build_array(…)))` because
  `aggregate functions are not allowed in index expressions`.
* So to make it work with multi-column tables, we need to use BTree, GIN
  or GiST instead. However, we run into lots of
  `ERROR: data type … has no default operator class for access method "…"`:
  * BTree cannot use complex data types like JSON and arrays.
    We'd need to convert them to something simple (e.g. `::text`),
    but that would occupy more space in the index.
  * In contrast, GIN and GiST both can't do simple flat data types like
    `character varying`.
  * &rArr; There is no easy solution that would work with any table.
















