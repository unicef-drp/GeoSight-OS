-- FOR NEW v_indicator_value_geo --
CREATE VIEW v_indicator_value_geo as
SELECT value.*,
    entity.concept_uuid             as concept_uuid,
    ref_view.id                     as reference_layer_id,
    entity.admin_level              as admin_level,
    indicator.type                  as indicator_type,
    indicator.shortcode             as indicator_shortcode,
    indicator.name                  as indicator_name,
    ref_view.name                   as reference_layer_name,
    ref_view.identifier             as reference_layer_uuid
FROM geosight_data_indicatorvalue as value
     LEFT JOIN geosight_data_indicator as indicator ON value.indicator_id = indicator.id
     LEFT JOIN geosight_georepo_entity as entity ON value.entity_id = entity.id
     LEFT JOIN geosight_georepo_referencelayerviewentity as ref_entity_view ON ref_entity_view.entity_id = entity.id
     LEFT JOIN geosight_georepo_referencelayerview as ref_view ON ref_view.id = ref_entity_view.reference_layer_view_id;