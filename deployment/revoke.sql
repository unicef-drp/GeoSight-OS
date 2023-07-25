-- ===============================================================================
-- GeoSight is UNICEF's geospatial web-based business intelligence platform.
--
-- Contact : geosight-no-reply@unicef.org
--
-- .. note:: This program is free software; you can redistribute it and/or modify
--     it under the terms of the GNU Affero General Public License as published by
--     the Free Software Foundation; either version 3 of the License, or
--     (at your option) any later version.
--
-- __author__ = 'irwan@kartoza.com'
-- __date__ = '13/06/2023'
-- __copyright__ = ('Copyright 2023, Unicef')
-- ===============================================================================
REVOKE CONNECT ON DATABASE django FROM public;

SELECT pid, pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database() AND pid <> pg_backend_pid();
