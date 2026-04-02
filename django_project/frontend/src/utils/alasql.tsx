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
  try {
    return alasql(query, params);
  } catch (e) {
    const fixed = fixQuery(query);
    // If fixQuery made no changes, re-throw immediately — retrying is pointless
    if (fixed === query) {
      console.error('alasqlQuery failed', { query, error: e });
      throw e;
    }
    try {
      return alasql(fixed, params);
    } catch (e2) {
      console.error('alasqlQuery failed', { original: query, fixed, error: e2 });
      throw e2;
    }
  }
}

const exaampleQueries = [
  // Already-quoted string value
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = 'Lower Juba' ORDER BY concept_uuid`,
  // Unquoted string value after =
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Lower Juba ORDER BY concept_uuid`,
  // Numeric comparison (should not quote)
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.value > 50 ORDER BY concept_uuid`,
  // Already-quoted IN list
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name IN ('Lower Juba','Hiraan') ORDER BY concept_uuid`,
  // Unquoted IN list
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name IN (Lower Juba,Hiraan) ORDER BY concept_uuid`,
  // Multiple unquoted conditions + unquoted date + BETWEEN (1,2) syntax
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Lower Juba AND data.Date = 2026-01-01T00:00:00 AND data.Count BETWEEN (1,2) ORDER BY concept_uuid`,
  // Reserved keyword column name (Count) already fixed BETWEEN syntax
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Lower Juba AND data.Date = 2026-01-01T00:00:00 AND data.Count BETWEEN 1 AND 2 ORDER BY concept_uuid`,
  // Multiple reserved keyword columns (Count, Value, Status)
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.Count > 0 AND data.Value = 42 AND data.Status = Active ORDER BY concept_uuid`,
  // OR condition with unquoted strings
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Lower Juba OR data.name = Hiraan ORDER BY concept_uuid`,
  // Unquoted IN with single item
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.region IN (East Africa) ORDER BY concept_uuid`,
  // Mixed quoted and unquoted IN items
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name IN ('Lower Juba',Hiraan) ORDER BY concept_uuid`,
  // Numeric BETWEEN (valid syntax)
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.value BETWEEN 10 AND 100 ORDER BY concept_uuid`,
  // Numeric BETWEEN with (x,y) shorthand
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.value BETWEEN (10,100) ORDER BY concept_uuid`,
  // Complex real-world query — all already quoted/escaped
  `SELECT geometry_code as _geometry_code,MAX(data.\`Date\`) as _date, MAX(data.concept_uuid) as _concept_uuid, MAX(data.geometry_code) as _ucode, MAX(data.geometry_name) as _geometry_name, AVG(data.\`NoBeneficiaries\`) as _value, MAX(data.admin_level) as _admin_level FROM ? as data WHERE \`Partner\` IN ('') AND \`Sector\` = 'WASH' AND \`NoBeneficiaries\` >= 0 AND  data.\`Date\`>="2000-01-01T00:00:00+00:00" AND  data.\`Date\`<="2026-02-28T23:59:59+00:00" GROUP BY geometry_code ORDER BY geometry_code DESC `,
  // Complex real-world query — unquoted sector value needing fixup
  `SELECT geometry_code as _geometry_code,MAX(data.\`Date\`) as _date, MAX(data.concept_uuid) as _concept_uuid, MAX(data.geometry_code) as _ucode, MAX(data.geometry_name) as _geometry_name, AVG(data.\`NoBeneficiaries\`) as _value, MAX(data.admin_level) as _admin_level FROM ? as data WHERE \`Partner\` IN ('') AND \`Sector\` = WASH AND \`NoBeneficiaries\` >= 0 AND  data.\`Date\`>="2000-01-01T00:00:00+00:00" AND  data.\`Date\`<="2026-02-28T23:59:59+00:00" GROUP BY geometry_code ORDER BY geometry_code DESC `,
  // Unquoted multi-word value at end of query (no trailing clause)
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = East Africa`,
  // Unquoted value with special chars (hyphen, slash) — e.g. region codes
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.region = Sub-Saharan Africa ORDER BY concept_uuid`,
  // Unquoted datetime with timezone offset
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.Date = 2026-01-01T00:00:00+00:00 ORDER BY concept_uuid`,
  // Unquoted value after = with HAVING clause following
  `SELECT data.category, COUNT(concept_uuid) AS total FROM ? data GROUP BY data.category HAVING data.category = East`,
  // Reserved keyword column Name used with unquoted value
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.Name = Lower Juba ORDER BY concept_uuid`,
  // Reserved keyword column Value used in BETWEEN (x,y)
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.Value BETWEEN (10,100) ORDER BY concept_uuid`,
  // Reserved keyword column Status in IN list (unquoted)
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.Status IN (Active,Inactive) ORDER BY concept_uuid`,
  // Unquoted IN list with items containing spaces
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.region IN (East Africa,West Africa,North Africa) ORDER BY concept_uuid`,
  // Multiple = conditions all unquoted, ending without ORDER BY
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Lower Juba AND data.region = East Africa`,
  // Chained OR + AND mix with unquoted values
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Lower Juba OR data.name = Hiraan AND data.Status = Active ORDER BY concept_uuid`,
  // Unquoted IN + unquoted = in same query
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.region IN (East Africa,West Africa) AND data.Status = Active ORDER BY concept_uuid`,
  // BETWEEN with float boundaries using (x,y) syntax
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.value BETWEEN (0.5,99.9) ORDER BY concept_uuid`,
  // Reserved keyword column Count in complex multi-condition query
  `SELECT geometry_code, AVG(data.\`NoBeneficiaries\`) as _value FROM ? as data WHERE data.Count > 0 AND data.Status = Active AND data.Name IN (Lower Juba,Hiraan) AND data.Value BETWEEN (1,100) GROUP BY geometry_code ORDER BY geometry_code`,
  // MAX on reserved keyword column Count
  `SELECT MAX(data.Count) as max_count FROM ? data GROUP BY data.name ORDER BY data.name`,
  // MIN/MAX on reserved keyword columns Value and Date
  `SELECT MIN(data.Value) as min_val, MAX(data.Date) as max_date FROM ? data GROUP BY data.name`,
  // AVG on reserved keyword column Value + unquoted = in WHERE
  `SELECT data.name, AVG(data.Value) as avg_val FROM ? data WHERE data.Status = Active GROUP BY data.name ORDER BY data.name`,
  // GROUP BY on reserved keyword column Status + unquoted IN
  `SELECT data.Status, COUNT(concept_uuid) as total FROM ? data WHERE data.Status IN (Active,Inactive) GROUP BY data.Status ORDER BY data.Status`,
  // HAVING with unquoted string comparison
  `SELECT data.name, COUNT(concept_uuid) as total FROM ? data GROUP BY data.name HAVING data.name = Lower Juba`,
  // HAVING with BETWEEN (x,y) on aggregation result
  `SELECT data.name, SUM(data.Count) as total FROM ? data GROUP BY data.name HAVING SUM(data.Count) BETWEEN (1,10)`,
  // HAVING with unquoted multi-word string
  `SELECT data.name, AVG(data.Value) as avg_val FROM ? data GROUP BY data.name HAVING AVG(data.Value) > 50 AND data.name = East Africa`,
  // Aggregation selecting reserved keyword column Name + unquoted IN filter
  `SELECT data.Name, COUNT(concept_uuid) as total FROM ? data WHERE data.Name IN (Lower Juba,Hiraan) GROUP BY data.Name ORDER BY data.Name`,
  // SUM on reserved keyword column Count + BETWEEN (x,y) in HAVING
  `SELECT data.region, SUM(data.Count) as total FROM ? data GROUP BY data.region HAVING SUM(data.Count) BETWEEN (5,100) ORDER BY data.region`,
  // Complex aggregation — reserved keywords + unquoted IN + BETWEEN (x,y) + unquoted = in HAVING
  `SELECT data.Name, data.Status, AVG(data.Value) as avg_val, MAX(data.Count) as max_count FROM ? data WHERE data.Status IN (Active,Inactive) AND data.Date = 2026-01-01T00:00:00 GROUP BY data.Name, data.Status HAVING AVG(data.Value) BETWEEN (10,100) AND data.Name = Lower Juba ORDER BY data.Name`,
  // Value containing an apostrophe (would produce broken SQL if naively quoted)
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = O'Brien ORDER BY concept_uuid`,
  // IN list item containing an apostrophe
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name IN (O'Brien,Lower Juba) ORDER BY concept_uuid`,
  // Value already wrapped in double quotes (should not be re-quoted)
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = "Lower Juba" ORDER BY concept_uuid`,
  // Value with slash (e.g. zone code)
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.region = North/South Zone ORDER BY concept_uuid`,
  // Value with ampersand
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Lower & Upper Juba ORDER BY concept_uuid`,
  // Value with percent sign (e.g. label/tag field)
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.label = 50% coverage ORDER BY concept_uuid`,
  // Value with hash
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.tag = #region1 ORDER BY concept_uuid`,
  // Value with parentheses inside
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Juba (South) ORDER BY concept_uuid`,
  // IN list with double-quoted items (should not be re-quoted)
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name IN ("Lower Juba","Hiraan") ORDER BY concept_uuid`,
  // Mixed: one single-quoted, one double-quoted, one unquoted in IN list
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name IN ('Lower Juba',"Hiraan",Mogadishu) ORDER BY concept_uuid`,
  // Value with multiple consecutive spaces
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Lower  Juba ORDER BY concept_uuid`,
  // Aggregation HAVING with apostrophe in value
  `SELECT data.name, COUNT(concept_uuid) as total FROM ? data GROUP BY data.name HAVING data.name = O'Brien`,
  // Complex: apostrophe + slash + reserved column + unquoted IN
  `SELECT data.Name, AVG(data.Value) as avg_val FROM ? data WHERE data.Name IN (O'Brien,North/South) AND data.Status = Active GROUP BY data.Name ORDER BY data.Name`,
  // Arabic script
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = جوبا ORDER BY concept_uuid`,
  // Arabic in IN list (unquoted)
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name IN (جوبا,الخرطوم) ORDER BY concept_uuid`,
  // French accented characters
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Île-de-France ORDER BY concept_uuid`,
  // Spanish accented characters
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.region = América Latina ORDER BY concept_uuid`,
  // Cyrillic script
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Москва ORDER BY concept_uuid`,
  // Chinese characters
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = 北京 ORDER BY concept_uuid`,
  // Mixed ASCII and non-ASCII
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Côte d'Ivoire ORDER BY concept_uuid`,
  // Non-ASCII in IN list mixed with ASCII
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name IN (Lower Juba,جوبا,Île-de-France) ORDER BY concept_uuid`,
  // Non-ASCII unquoted value with reserved column
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.Name = Москва AND data.Status = Active ORDER BY concept_uuid`,
  // Non-ASCII in aggregation HAVING
  `SELECT data.name, COUNT(concept_uuid) as total FROM ? data GROUP BY data.name HAVING data.name = Île-de-France`,
]

export function testExampleQueries() {
  exaampleQueries.map(query => {
    alasqlQuery(query, [[]]);
  })
}