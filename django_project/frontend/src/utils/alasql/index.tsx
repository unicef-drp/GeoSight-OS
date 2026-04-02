/**
 * GeoSight is UNICEF's geospatial web-based business intelligence platform.
 *
 * Contact : geosight-no-reply@unicef.org
 *
 * .. note:: This program is free software; you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation; either version 3 of the License, or
 *     (at your option) any later version.
 *
 * __author__ = 'irwan@kartoza.com'
 * __date__ = '31/03/2026'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import alasql from "alasql";

// SQL reserved keywords that alasql will mis-parse when used as column names
const RESERVED_COLUMN_KEYWORDS = /^(COUNT|SUM|AVG|MIN|MAX|DATE|VALUE|NAME|GROUP|ORDER|INDEX|KEY|LEVEL|TYPE|STATUS|RANK)$/i;

/** Escape a string value for use inside single-quoted SQL literals. */
function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

function fixQuery(query: string) {
  // Escape reserved SQL keywords used as dot-accessed column names
  // e.g. data.Count -> data.`Count`  (COUNT is an alasql aggregate function)
  // Negative lookahead (?!\s*\() prevents matching actual function calls like COUNT(...)
  query = query.replace(/(\w+)\.([A-Za-z_]\w*)(?!\s*\()/g, (_match, table, col) => {
    if (RESERVED_COLUMN_KEYWORDS.test(col)) {
      return `${table}.\`${col}\``;
    }
    return _match;
  });

  // Fix BETWEEN (x,y) -> BETWEEN x AND y
  // e.g. data.count BETWEEN (1,2) -> data.count BETWEEN 1 AND 2
  query = query.replace(/\bBETWEEN\s*\(([^,]+),([^)]+)\)/gi, (_match, low, high) => {
    return `BETWEEN ${low.trim()} AND ${high.trim()}`;
  });

  // Fix unquoted string values in IN (...) clauses
  // e.g. IN (Lower Juba,Hiraan) -> IN ('Lower Juba','Hiraan')
  query = query.replace(/\bIN\s*\(([^)]+)\)/gi, (_match, inner) => {
    const fixedInner = inner.split(',').map((v: string) => {
      const trimmed = v.trim();
      // Skip if already quoted or is a number or empty
      if (!trimmed || /^'.*'$/.test(trimmed) || /^".*"$/.test(trimmed) || /^-?\d+(\.\d+)?$/.test(trimmed)) {
        return v;
      }
      return v.replace(trimmed, `'${escapeSqlString(trimmed)}'`);
    });
    return `IN (${fixedInner.join(',')})`;
  });

  // Fix unquoted string values after = operator (but not >=, <=, !=, <>)
  // e.g. data.name = Lower Juba -> data.name = 'Lower Juba'
  // e.g. data.Date = 2026-01-01T00:00:00 -> data.Date = '2026-01-01T00:00:00'
  query = query.replace(
    /(?<![<>!])=\s+(?!['"`])(.+?)(?=\s+(?:ORDER|GROUP|AND|OR|HAVING|LIMIT|BETWEEN|WHERE|JOIN)\b|\s*$)/gi,
    (_match, value) => {
      const trimmed = value.trim();
      // Skip if empty, already quoted, or a plain number
      if (!trimmed || /^'.*'$/.test(trimmed) || /^".*"$/.test(trimmed) || /^-?\d+(\.\d+)?$/.test(trimmed)) {
        return _match;
      }
      return `= '${escapeSqlString(trimmed)}'`;
    }
  );

  return query;
}

export function alasqlQuery(query: string, params: any[]) {
  // Always pre-process: unquoted single-word values (e.g. Sector = WASH) are
  // valid SQL identifiers so alasql returns [] silently without throwing.
  // fixQuery must run before the first alasql call to catch those cases.
  const fixed = fixQuery(query);
  try {
    return alasql(fixed, params);
  } catch (e) {
    // fixQuery made no changes — retrying with original is pointless
    if (fixed === query) {
      console.error('alasqlQuery failed', { query, error: e });
      throw e;
    }
    // Fixed query failed — fall back to original as last resort
    try {
      return alasql(query, params);
    } catch (e2) {
      console.error('alasqlQuery failed', { original: query, fixed, error: e2 });
      throw e2;
    }
  }
}
