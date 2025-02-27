-- FOR NEW v_indicator_value_geo --
CREATE VIEW v_indicator_value_geo as
SELECT value.*,
    ref_view.id                     as reference_layer_id,
    ref_view.name                   as reference_layer_name,
    ref_view.identifier             as reference_layer_uuid,
    entity.admin_level              as admin_level,
    entity.concept_uuid             as concept_uuid,
    indicator.type                  as indicator_type,
    indicator.shortcode             as indicator_shortcode,
    indicator.name                  as indicator_name
FROM geosight_data_indicatorvalue as value
     LEFT JOIN geosight_data_indicator as indicator ON value.indicator_id = indicator.id
     LEFT JOIN geosight_georepo_entity as entity ON value.entity_id = entity.id
     LEFT JOIN geosight_georepo_referencelayerviewentity as ref_entity_view ON ref_entity_view.entity_id = entity.id
     LEFT JOIN geosight_georepo_referencelayerview as ref_view ON ref_view.id = ref_entity_view.reference_layer_id;

-- FOR NEW v_indicator_value_geo --
CREATE VIEW v_indicator_value_geo_master as
SELECT value.*,
    ref_view.id                     as reference_layer_id,
    ref_view.name                   as reference_layer_name,
    ref_view.identifier             as reference_layer_uuid,
    entity.admin_level              as admin_level,
    entity.concept_uuid             as concept_uuid,
    indicator.type                  as indicator_type,
    indicator.shortcode             as indicator_shortcode,
    indicator.name                  as indicator_name
FROM geosight_data_indicatorvalue_master as value
     LEFT JOIN geosight_data_indicator as indicator ON value.indicator_id = indicator.id
     LEFT JOIN geosight_georepo_entity as entity ON value.entity_id = entity.id
     LEFT JOIN geosight_georepo_referencelayerviewentity as ref_entity_view ON ref_entity_view.entity_id = entity.id
     LEFT JOIN geosight_georepo_referencelayerview as ref_view ON ref_view.id = ref_entity_view.reference_layer_id;


-- FOR NEW v_indicator_value_geo --
CREATE VIEW v_indicator_value_geo as
SELECT value.date                   as date,
    value.value                     as value,
    value.value_str                 as value_str,
    value.geom_id                   as geom_id,
    value.indicator_id              as indicator_id,
    value.entity_id                 as entity_id,

    ref_view.id                     as reference_layer_id,
    ref_view.name                   as reference_layer_name,
    ref_view.identifier             as reference_layer_uuid,

    entity.admin_level              as admin_level,
    entity.concept_uuid             as concept_uuid,
    entity.start_date               as entity_start_date,
    entity.end_date                 as entity_end_date,

    indicator.type                  as indicator_type,
    indicator.shortcode             as indicator_shortcode,
    indicator.name                  as indicator_name

FROM geosight_data_indicatorvalue as value
     LEFT JOIN geosight_data_indicator as indicator ON value.indicator_id = indicator.id
     LEFT JOIN geosight_georepo_entity as entity ON value.entity_id = entity.id
     LEFT JOIN geosight_georepo_referencelayerviewentity as ref_entity_view ON ref_entity_view.entity_id = entity.id
     LEFT JOIN geosight_georepo_referencelayerview as ref_view ON ref_view.id = ref_entity_view.reference_layer_id;

-- FOR NEW v_indicator_value_geo --
CREATE VIEW v_indicator_value_geo as
SELECT value.*,
    entity.admin_level              as admin_level,
    entity.concept_uuid             as concept_uuid,
    indicator.type                  as indicator_type,
    indicator.shortcode             as indicator_shortcode,
    indicator.name                  as indicator_name
FROM geosight_data_indicatorvalue as value
     LEFT JOIN geosight_data_indicator as indicator ON value.indicator_id = indicator.id
     LEFT JOIN geosight_georepo_entity as entity ON value.entity_id = entity.id
     LEFT JOIN geosight_georepo_entity as country ON entity.country_id = country.id;

-- FOR NEW v_indicator_value_geo --
CREATE VIEW v_indicator_value_geo_master as
SELECT value.*,
    entity.admin_level              as admin_level,
    entity.concept_uuid             as concept_uuid,
    indicator.type                  as indicator_type,
    indicator.shortcode             as indicator_shortcode,
    indicator.name                  as indicator_name
FROM geosight_data_indicatorvalue_master as value
     LEFT JOIN geosight_data_indicator as indicator ON value.indicator_id = indicator.id
     LEFT JOIN geosight_georepo_entity as entity ON value.entity_id = entity.id
     LEFT JOIN geosight_georepo_entity as country ON entity.country_id = country.id;

CREATE VIEW v_indicator_value_geo_with_country as
SELECT value.date                   as date,
    value.value                     as value,
    value.value_str                 as value_str,
    value.geom_id                   as geom_id,
    value.indicator_id              as indicator_id,
    value.entity_id                 as entity_id,
    value.country_id                as country_id,

    entity.admin_level              as admin_level,
    entity.concept_uuid             as concept_uuid,
    entity.start_date               as entity_start_date,
    entity.end_date                 as entity_end_date,

    indicator.type                  as indicator_type,
    indicator.shortcode             as indicator_shortcode,
    indicator.name                  as indicator_name
FROM geosight_data_indicatorvalue as value
     LEFT JOIN geosight_data_indicator as indicator ON value.indicator_id = indicator.id
     LEFT JOIN geosight_georepo_entity as entity ON value.entity_id = entity.id
     LEFT JOIN geosight_georepo_entity as country ON entity.country_id = country.id;

CREATE VIEW v_indicator_value_geo_with_country_flat as
SELECT value.date                   as date,
    value.value                     as value,
    value.value_str                 as value_str,
    value.geom_id                   as geom_id,
    value.indicator_id              as indicator_id,
    value.entity_id                 as entity_id,
    value.country_id                as country_id,

    value.admin_level               as admin_level,
    value.concept_uuid              as concept_uuid,
    value.entity_start_date         as entity_start_date,
    value.entity_end_date           as entity_end_date,

    value.indicator_type            as indicator_type,
    value.indicator_shortcode       as indicator_shortcode,
    value.indicator_name            as indicator_name
FROM geosight_data_indicatorvalue as value;