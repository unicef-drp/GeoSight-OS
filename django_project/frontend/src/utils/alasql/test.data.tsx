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

// Sample dataset — 15 rows covering every field/value referenced in exaampleQueries.
// Value=60 on uuid-7 is intentional: needed for HAVING AVG(Value) > 50 AND name='East Africa'.
// uuid-15 has name='Lower  Juba' (two spaces) to cover the double-space test case.
//
// Count summary used to derive expected query results:
//   Total rows   : 15
//   Active rows  : 13  (uuid-2 Inactive, uuid-5 Inactive)
//   WASH rows    : 14  (uuid-3 is HEALTH)
//   geometry_codes in WASH: GC001,GC002,GC004,GC005,GC006,GC007,GC008,GC009,GC010 = 9 distinct
//   regions      : East Africa(7), West Africa(2), North Africa(2), Sub-Saharan Africa(1),
//                  North/South Zone(1), East Asia(1), América Latina(1) = 7 distinct
//   categories   : East(13), North(1), West(1)
export const exampleData = [
  {
    concept_uuid: 'uuid-1',
    name: 'Lower Juba', Name: 'Lower Juba',
    region: 'East Africa',
    Date: '2026-01-01T00:00:00', date: '2026-01-01T00:00:00',
    Count: 1, Value: 42, Status: 'Active',
    value: 75, label: '50% coverage', tag: '#region1', category: 'East',
    geometry_code: 'GC001', geometry_name: 'Lower Juba Region', admin_level: 1,
    NoBeneficiaries: 100, Partner: '', Sector: 'WASH',
  },
  {
    concept_uuid: 'uuid-2',
    name: 'Hiraan', Name: 'Hiraan',
    region: 'West Africa',
    Date: '2025-06-15T00:00:00', date: '2025-06-15T00:00:00',
    Count: 2, Value: 55, Status: 'Inactive',
    value: 30, label: 'other', tag: 'tag2', category: 'East',
    geometry_code: 'GC002', geometry_name: 'Hiraan Region', admin_level: 1,
    NoBeneficiaries: 200, Partner: '', Sector: 'WASH',
  },
  {
    concept_uuid: 'uuid-3',
    name: "O'Brien", Name: "O'Brien",
    region: 'North/South Zone',
    Date: '2025-01-01T00:00:00', date: '2025-01-01T00:00:00',
    Count: 5, Value: 80, Status: 'Active',
    value: 60, label: 'other', tag: 'tag3', category: 'North',
    geometry_code: 'GC003', geometry_name: 'North Region', admin_level: 2,
    NoBeneficiaries: 50, Partner: '', Sector: 'HEALTH',
  },
  {
    concept_uuid: 'uuid-4',
    name: 'جوبا', Name: 'جوبا',
    region: 'East Africa',
    Date: '2026-01-01T00:00:00+00:00', date: '2026-01-01T00:00:00+00:00',
    Count: 3, Value: 20, Status: 'Active',
    value: 15, label: 'other', tag: 'tag4', category: 'East',
    geometry_code: 'GC001', geometry_name: 'Juba Region', admin_level: 1,
    NoBeneficiaries: 75, Partner: '', Sector: 'WASH',
  },
  {
    concept_uuid: 'uuid-5',
    name: 'Île-de-France', Name: 'Île-de-France',
    region: 'Sub-Saharan Africa',
    Date: '2025-12-01T00:00:00', date: '2025-12-01T00:00:00',
    Count: 7, Value: 65, Status: 'Inactive',
    value: 50, label: 'other', tag: 'tag5', category: 'East',
    geometry_code: 'GC004', geometry_name: 'IDF Region', admin_level: 2,
    NoBeneficiaries: 300, Partner: '', Sector: 'WASH',
  },
  {
    concept_uuid: 'uuid-6',
    name: 'Москва', Name: 'Москва',
    region: 'North Africa',
    Date: '2025-09-01T00:00:00', date: '2025-09-01T00:00:00',
    Count: 4, Value: 35, Status: 'Active',
    value: 90, label: 'other', tag: 'tag6', category: 'East',
    geometry_code: 'GC005', geometry_name: 'Москва Region', admin_level: 1,
    NoBeneficiaries: 150, Partner: '', Sector: 'WASH',
  },
  {
    // Value=60 so AVG(Value)>50 holds for HAVING test on name='East Africa'
    concept_uuid: 'uuid-7',
    name: 'East Africa', Name: 'East Africa',
    region: 'East Africa',
    Date: '2025-05-01T00:00:00', date: '2025-05-01T00:00:00',
    Count: 1, Value: 60, Status: 'Active',
    value: 20, label: 'other', tag: 'tag7', category: 'East',
    geometry_code: 'GC006', geometry_name: 'East Africa Region', admin_level: 1,
    NoBeneficiaries: 50, Partner: '', Sector: 'WASH',
  },
  {
    concept_uuid: 'uuid-8',
    name: 'Mogadishu', Name: 'Mogadishu',
    region: 'East Africa',
    Date: '2025-03-01T00:00:00', date: '2025-03-01T00:00:00',
    Count: 2, Value: 45, Status: 'Active',
    value: 40, label: 'other', tag: 'tag8', category: 'East',
    geometry_code: 'GC006', geometry_name: 'Mogadishu Region', admin_level: 1,
    NoBeneficiaries: 80, Partner: '', Sector: 'WASH',
  },
  {
    concept_uuid: 'uuid-9',
    name: "Côte d'Ivoire", Name: "Côte d'Ivoire",
    region: 'West Africa',
    Date: '2025-07-01T00:00:00', date: '2025-07-01T00:00:00',
    Count: 3, Value: 60, Status: 'Active',
    value: 55, label: 'other', tag: 'tag9', category: 'West',
    geometry_code: 'GC007', geometry_name: "Côte d'Ivoire Region", admin_level: 1,
    NoBeneficiaries: 120, Partner: '', Sector: 'WASH',
  },
  {
    concept_uuid: 'uuid-10',
    name: 'الخرطوم', Name: 'الخرطوم',
    region: 'North Africa',
    Date: '2025-04-01T00:00:00', date: '2025-04-01T00:00:00',
    Count: 2, Value: 25, Status: 'Active',
    value: 35, label: 'other', tag: 'tag10', category: 'East',
    geometry_code: 'GC008', geometry_name: 'Khartoum Region', admin_level: 1,
    NoBeneficiaries: 90, Partner: '', Sector: 'WASH',
  },
  {
    concept_uuid: 'uuid-11',
    name: '北京', Name: '北京',
    region: 'East Asia',
    Date: '2025-08-01T00:00:00', date: '2025-08-01T00:00:00',
    Count: 1, Value: 70, Status: 'Active',
    value: 45, label: 'other', tag: 'tag11', category: 'East',
    geometry_code: 'GC009', geometry_name: 'Beijing Region', admin_level: 1,
    NoBeneficiaries: 200, Partner: '', Sector: 'WASH',
  },
  {
    concept_uuid: 'uuid-12',
    name: 'Juba (South)', Name: 'Juba (South)',
    region: 'East Africa',
    Date: '2025-10-01T00:00:00', date: '2025-10-01T00:00:00',
    Count: 2, Value: 50, Status: 'Active',
    value: 65, label: 'other', tag: 'tag12', category: 'East',
    geometry_code: 'GC001', geometry_name: 'Juba South Region', admin_level: 1,
    NoBeneficiaries: 60, Partner: '', Sector: 'WASH',
  },
  {
    concept_uuid: 'uuid-13',
    name: 'Lower & Upper Juba', Name: 'Lower & Upper Juba',
    region: 'East Africa',
    Date: '2025-11-01T00:00:00', date: '2025-11-01T00:00:00',
    Count: 3, Value: 55, Status: 'Active',
    value: 80, label: 'other', tag: 'tag13', category: 'East',
    geometry_code: 'GC001', geometry_name: 'Upper Lower Juba Region', admin_level: 1,
    NoBeneficiaries: 40, Partner: '', Sector: 'WASH',
  },
  {
    concept_uuid: 'uuid-14',
    name: 'América Latina', Name: 'América Latina',
    region: 'América Latina',
    Date: '2025-02-01T00:00:00', date: '2025-02-01T00:00:00',
    Count: 2, Value: 40, Status: 'Active',
    value: 45, label: 'other', tag: 'tag14', category: 'East',
    geometry_code: 'GC010', geometry_name: 'América Latina Region', admin_level: 1,
    NoBeneficiaries: 110, Partner: '', Sector: 'WASH',
  },
  {
    // Double-space name to cover the consecutive-spaces test case
    concept_uuid: 'uuid-15',
    name: 'Lower  Juba', Name: 'Lower  Juba',
    region: 'East Africa',
    Date: '2025-01-15T00:00:00', date: '2025-01-15T00:00:00',
    Count: 1, Value: 30, Status: 'Active',
    value: 25, label: 'other', tag: 'tag15', category: 'East',
    geometry_code: 'GC001', geometry_name: 'Lower Juba (Alt) Region', admin_level: 1,
    NoBeneficiaries: 30, Partner: '', Sector: 'WASH',
  },
];