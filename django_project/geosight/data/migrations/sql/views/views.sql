-- Indicator Value x Geometry
CREATE VIEW v_indicator_value_geo as
SELECT value.*, date_part('day', value.date) as day,
    date_part('month', value.date) as month,
    date_part('year', value.date) as year,
    entity.concept_uuid,
    entity.reference_layer_id,
    entity.admin_level,
    indicator.type as indicator_type,
    indicator.shortcode as indicator_shortcode,
    value.indicator_id || '-' || entity.reference_layer_id AS identifier
        from geosight_data_indicatorvalue as value
             LEFT JOIN geosight_georepo_entity as entity ON value.geom_id = entity.geom_id
             LEFT JOIN geosight_data_indicator as indicator ON value.indicator_id = indicator.id;