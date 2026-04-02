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
import { alasqlQuery } from '.';
import { exampleData } from './test.data';

// count = expected result.length from alasqlQuery(query, [exampleData])
// ARRAY() aggregate always returns 1 row (even with 0 matches).
// GROUP BY returns one row per group that survives HAVING.
// See test.data.tsx header comment for row-count breakdown used to derive these.
const exaampleQueries: { query: string; count: number }[] = [
  // --- Basic = and IN ---
  // Already-quoted string value
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = 'Lower Juba' ORDER BY concept_uuid`, count: 1 },
  // Unquoted string value after =
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Lower Juba ORDER BY concept_uuid`, count: 1 },
  // Numeric comparison (should not quote)
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.value > 50 ORDER BY concept_uuid`, count: 1 },
  // Already-quoted IN list
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name IN ('Lower Juba','Hiraan') ORDER BY concept_uuid`, count: 1 },
  // Unquoted IN list
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name IN (Lower Juba,Hiraan) ORDER BY concept_uuid`, count: 1 },

  // --- BETWEEN ---
  // Multiple unquoted conditions + unquoted date + BETWEEN (1,2) syntax
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Lower Juba AND data.Date = 2026-01-01T00:00:00 AND data.Count BETWEEN (1,2) ORDER BY concept_uuid`, count: 1 },
  // Already-valid BETWEEN syntax
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Lower Juba AND data.Date = 2026-01-01T00:00:00 AND data.Count BETWEEN 1 AND 2 ORDER BY concept_uuid`, count: 1 },
  // Numeric BETWEEN (valid syntax)
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.value BETWEEN 10 AND 100 ORDER BY concept_uuid`, count: 1 },
  // Numeric BETWEEN with (x,y) shorthand
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.value BETWEEN (10,100) ORDER BY concept_uuid`, count: 1 },
  // BETWEEN with float boundaries using (x,y) syntax
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.value BETWEEN (0.5,99.9) ORDER BY concept_uuid`, count: 1 },

  // --- Reserved keyword columns ---
  // Multiple reserved keyword columns (Count, Value, Status)
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.Count > 0 AND data.Value = 42 AND data.Status = Active ORDER BY concept_uuid`, count: 1 },
  // Reserved keyword column Name used with unquoted value
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.Name = Lower Juba ORDER BY concept_uuid`, count: 1 },
  // Reserved keyword column Value used in BETWEEN (x,y)
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.Value BETWEEN (10,100) ORDER BY concept_uuid`, count: 1 },
  // Reserved keyword column Status in IN list (unquoted)
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.Status IN (Active,Inactive) ORDER BY concept_uuid`, count: 1 },

  // --- OR / AND combos ---
  // OR condition with unquoted strings
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Lower Juba OR data.name = Hiraan ORDER BY concept_uuid`, count: 1 },
  // Chained OR + AND mix — AND binds tighter, so only uuid-1 matches
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Lower Juba OR data.name = Hiraan AND data.Status = Active ORDER BY concept_uuid`, count: 1 },

  // --- IN with spaces / mixed quotes ---
  // Unquoted IN with single item
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.region IN (East Africa) ORDER BY concept_uuid`, count: 1 },
  // Mixed quoted and unquoted IN items
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name IN ('Lower Juba',Hiraan) ORDER BY concept_uuid`, count: 1 },
  // Unquoted IN list with items containing spaces
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.region IN (East Africa,West Africa,North Africa) ORDER BY concept_uuid`, count: 1 },
  // Unquoted IN + unquoted = in same query
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.region IN (East Africa,West Africa) AND data.Status = Active ORDER BY concept_uuid`, count: 1 },
  // IN list with double-quoted items (alasql double-quote string handling)
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name IN ("Lower Juba","Hiraan") ORDER BY concept_uuid`, count: 1 },
  // Mixed: single-quoted, double-quoted, unquoted in IN list
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name IN ('Lower Juba',"Hiraan",Mogadishu) ORDER BY concept_uuid`, count: 1 },

  // --- Unquoted values (various terminator positions) ---
  // Unquoted multi-word value at end of query (no trailing clause)
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = East Africa`, count: 1 },
  // Multiple = conditions all unquoted, ending without ORDER BY
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Lower Juba AND data.region = East Africa`, count: 1 },
  // Unquoted value with special chars (hyphen, slash) — e.g. region codes
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.region = Sub-Saharan Africa ORDER BY concept_uuid`, count: 1 },
  // Unquoted datetime with timezone offset
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.Date = 2026-01-01T00:00:00+00:00 ORDER BY concept_uuid`, count: 1 },

  // --- Special characters in values ---
  // Value containing an apostrophe
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = O'Brien ORDER BY concept_uuid`, count: 1 },
  // IN list item containing an apostrophe
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name IN (O'Brien,Lower Juba) ORDER BY concept_uuid`, count: 1 },
  // Value already wrapped in double quotes (should not be re-quoted)
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = "Lower Juba" ORDER BY concept_uuid`, count: 1 },
  // Value with slash (e.g. zone code)
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.region = North/South Zone ORDER BY concept_uuid`, count: 1 },
  // Value with ampersand
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Lower & Upper Juba ORDER BY concept_uuid`, count: 1 },
  // Value with percent sign
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.label = 50% coverage ORDER BY concept_uuid`, count: 1 },
  // Value with hash
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.tag = #region1 ORDER BY concept_uuid`, count: 1 },
  // Value with parentheses inside
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Juba (South) ORDER BY concept_uuid`, count: 1 },
  // Value with multiple consecutive spaces (uuid-15 has name='Lower  Juba')
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Lower  Juba ORDER BY concept_uuid`, count: 1 },

  // --- Non-ASCII values ---
  // Arabic script
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = جوبا ORDER BY concept_uuid`, count: 1 },
  // Arabic in IN list (unquoted)
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name IN (جوبا,الخرطوم) ORDER BY concept_uuid`, count: 1 },
  // French accented characters
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Île-de-France ORDER BY concept_uuid`, count: 1 },
  // Spanish accented characters (region='América Latina' on uuid-14)
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.region = América Latina ORDER BY concept_uuid`, count: 1 },
  // Cyrillic script
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Москва ORDER BY concept_uuid`, count: 1 },
  // Chinese characters
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = 北京 ORDER BY concept_uuid`, count: 1 },
  // Mixed ASCII and non-ASCII with apostrophe
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Côte d'Ivoire ORDER BY concept_uuid`, count: 1 },
  // Non-ASCII in IN list mixed with ASCII
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name IN (Lower Juba,جوبا,Île-de-France) ORDER BY concept_uuid`, count: 1 },
  // Non-ASCII unquoted value with reserved column
  { query: `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.Name = Москва AND data.Status = Active ORDER BY concept_uuid`, count: 1 },

  // --- Real-world complex queries ---
  // Already quoted/escaped — 14 WASH rows across 9 distinct geometry_codes
  { query: `SELECT geometry_code as _geometry_code,MAX(data.\`Date\`) as _date, MAX(data.concept_uuid) as _concept_uuid, MAX(data.geometry_code) as _ucode, MAX(data.geometry_name) as _geometry_name, AVG(data.\`NoBeneficiaries\`) as _value, MAX(data.admin_level) as _admin_level FROM ? as data WHERE \`Partner\` IN ('') AND \`Sector\` = 'WASH' AND \`NoBeneficiaries\` >= 0 AND  data.\`Date\`>="2000-01-01T00:00:00+00:00" AND  data.\`Date\`<="2026-02-28T23:59:59+00:00" GROUP BY geometry_code ORDER BY geometry_code DESC `, count: 9 },
  // Unquoted sector value — fixQuery converts WASH to 'WASH', same result as above
  { query: `SELECT geometry_code as _geometry_code,MAX(data.\`Date\`) as _date, MAX(data.concept_uuid) as _concept_uuid, MAX(data.geometry_code) as _ucode, MAX(data.geometry_name) as _geometry_name, AVG(data.\`NoBeneficiaries\`) as _value, MAX(data.admin_level) as _admin_level FROM ? as data WHERE \`Partner\` IN ('') AND \`Sector\` = WASH AND \`NoBeneficiaries\` >= 0 AND  data.\`Date\`>="2000-01-01T00:00:00+00:00" AND  data.\`Date\`<="2026-02-28T23:59:59+00:00" GROUP BY geometry_code ORDER BY geometry_code DESC `, count: 9 },
  // Reserved keyword columns + unquoted IN + BETWEEN — uuid-1 only → 1 geometry_code group
  { query: `SELECT geometry_code, AVG(data.\`NoBeneficiaries\`) as _value FROM ? as data WHERE data.Count > 0 AND data.Status = Active AND data.Name IN (Lower Juba,Hiraan) AND data.Value BETWEEN (1,100) GROUP BY geometry_code ORDER BY geometry_code`, count: 1 },

  // --- Aggregation queries ---
  // MAX on reserved keyword column Count — 15 distinct names
  { query: `SELECT MAX(data.Count) as max_count FROM ? data GROUP BY data.name ORDER BY data.name`, count: 15 },
  // MIN/MAX on reserved keyword columns Value and Date — 15 distinct names
  { query: `SELECT MIN(data.Value) as min_val, MAX(data.Date) as max_date FROM ? data GROUP BY data.name`, count: 15 },
  // AVG on reserved Value + unquoted Status — 13 Active rows → 13 distinct names
  { query: `SELECT data.name, AVG(data.Value) as avg_val FROM ? data WHERE data.Status = Active GROUP BY data.name ORDER BY data.name`, count: 13 },
  // GROUP BY Status — Active and Inactive → 2 groups
  { query: `SELECT data.Status, COUNT(concept_uuid) as total FROM ? data WHERE data.Status IN (Active,Inactive) GROUP BY data.Status ORDER BY data.Status`, count: 2 },
  // Complex: apostrophe + reserved column + unquoted IN — uuid-3 (O'Brien, Active) → 1 group
  { query: `SELECT data.Name, AVG(data.Value) as avg_val FROM ? data WHERE data.Name IN (O'Brien,North/South) AND data.Status = Active GROUP BY data.Name ORDER BY data.Name`, count: 1 },
];

export function testExampleQueries() {
  exaampleQueries.forEach(({ query, count }) => {
    const result = alasqlQuery(query, [exampleData]);
    if (!Array.isArray(result)) {
      throw new Error(`alasqlQuery: expected array result\nQuery: ${query}`);
    }
    if (result.length !== count) {
      throw new Error(
        `alasqlQuery: expected ${count} row(s) but got ${result.length}\nQuery: ${query}`
      );
    }
  });
}