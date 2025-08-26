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
 * __date__ = '19/08/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import { useCallback, useState } from "react";

export function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial);

  const openFn = useCallback(() => setOpen(true), []);
  const closeFn = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  return { open, openFn, closeFn, toggle };
}
