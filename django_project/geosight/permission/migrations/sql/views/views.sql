-- Reference Layer Indicator Permission in flat mode --
CREATE VIEW v_referencelayer_indicator_permission as
SELECT permission.*,
       ref_ind.indicator_id,
       ref_ind.reference_layer_id,
       ref_ind.indicator_id || '-' || ref_ind.reference_layer_id AS identifier
from geosight_permission_referencelayerindicatorpermission as permission
         LEFT JOIN geosight_georepo_referencelayerindicator as ref_ind
                   ON permission.obj_id = ref_ind.id;