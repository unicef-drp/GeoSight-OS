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

function fixQuery(query: string) {
  // Fix unquoted string values in IN (...) clauses
  // e.g. IN (Lower Juba,Hiraan) -> IN ('Lower Juba','Hiraan')
  query = query.replace(/\bIN\s*\(([^)]+)\)/gi, (_match, inner) => {
    const fixedInner = inner.split(',').map((v: string) => {
      const trimmed = v.trim();
      // Skip if already quoted or is a number or empty
      if (!trimmed || /^'.*'$/.test(trimmed) || /^".*"$/.test(trimmed) || /^-?\d+(\.\d+)?$/.test(trimmed)) {
        return v;
      }
      return v.replace(trimmed, `'${trimmed}'`);
    });
    return `IN (${fixedInner.join(',')})`;
  });

  // Fix unquoted string values after = operator (but not >=, <=, !=, <>)
  // e.g. data.name = Lower Juba -> data.name = 'Lower Juba'
  query = query.replace(
    /(?<![<>!])=\s+(?!['"`])(?!\d)(.+?)(?=\s+(?:ORDER|GROUP|AND|OR|HAVING|LIMIT|WHERE|JOIN)\b|\s*$)/gi,
    (_match, value) => {
      const trimmed = value.trim();
      if (!trimmed || /^-?\d+(\.\d+)?$/.test(trimmed)) return _match;
      return `= '${trimmed}'`;
    }
  );

  return query;
}

export function alasqlQuery(query: string, params: any[]) {
  try {
    return alasql(query, params);
  } catch (e) {
    return alasql(fixQuery(query), params);
  }
}

const exaampleQueries = [
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = 'Lower Juba' ORDER BY concept_uuid`,
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name = Lower Juba ORDER BY concept_uuid`,
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.value > 50 ORDER BY concept_uuid`,
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name IN ('Lower Juba','Hiraan') ORDER BY concept_uuid`,
  `SELECT ARRAY(concept_uuid) AS concept_uuids FROM ? data WHERE data.name IN (Lower Juba,Hiraan) ORDER BY concept_uuid`,
  `SELECT geometry_code as _geometry_code,MAX(data.\`Date\`) as _date, MAX(data.concept_uuid) as _concept_uuid, MAX(data.geometry_code) as _ucode, MAX(data.geometry_name) as _geometry_name, AVG(data.\`NoBeneficiaries\`) as _value, MAX(data.admin_level) as _admin_level FROM ? as data WHERE \`Partner\` IN ('') AND \`Sector\` = 'WASH' AND \`NoBeneficiaries\` >= 0 AND  data.\`Date\`>="2000-01-01T00:00:00+00:00" AND  data.\`Date\`<="2026-02-28T23:59:59+00:00" GROUP BY geometry_code ORDER BY geometry_code DESC `,
  `SELECT geometry_code as _geometry_code,MAX(data.\`Date\`) as _date, MAX(data.concept_uuid) as _concept_uuid, MAX(data.geometry_code) as _ucode, MAX(data.geometry_name) as _geometry_name, AVG(data.\`NoBeneficiaries\`) as _value, MAX(data.admin_level) as _admin_level FROM ? as data WHERE \`Partner\` IN ('') AND \`Sector\` = WASH AND \`NoBeneficiaries\` >= 0 AND  data.\`Date\`>="2000-01-01T00:00:00+00:00" AND  data.\`Date\`<="2026-02-28T23:59:59+00:00" GROUP BY geometry_code ORDER BY geometry_code DESC `,
]

export function testExampleQueries() {
  exaampleQueries.map(query => {
    alasqlQuery(query, [[]]);
  })
}