CREATE TABLE geosight_data_indicatorvalue_master (
    LIKE geosight_data_indicatorvalue INCLUDING CONSTRAINTS
) PARTITION BY LIST (indicator_id);

-- sequence --
CREATE SEQUENCE geosight_data_indicatorvalue_master_id_seq
    START WITH 1
    INCREMENT BY 1
    OWNED BY geosight_data_indicatorvalue_master.id;
SELECT setval('geosight_data_indicatorvalue_master_id_seq', (SELECT MAX(id) FROM geosight_data_indicatorvalue));
ALTER TABLE geosight_data_indicatorvalue_master
    ALTER COLUMN id SET DEFAULT nextval('geosight_data_indicatorvalue_master_id_seq');

-- create constraints --
ALTER TABLE geosight_data_indicatorvalue_master
    ADD CONSTRAINT geosight_data_indicator_value_indicator_date_geom
    UNIQUE (indicator_id, date, geom_id);

-- create indexes --
CREATE INDEX geosight_data_indicatorvalue_indicator_country_admin_level ON geosight_data_indicatorvalue_master(indicator_id, country_id, admin_level);
CREATE INDEX geosight_data_indicatorvalue_indicator_country ON geosight_data_indicatorvalue_master(indicator_id, country_id);
CREATE INDEX geosight_data_indicatorvalue_indicator_admin_level ON geosight_data_indicatorvalue_master(indicator_id, admin_level);
CREATE INDEX geosight_data_indicatorvalue_indicator_entity ON geosight_data_indicatorvalue_master(indicator_id, entity_id);
CREATE INDEX geosight_data_indicatorvalue_country_id ON geosight_data_indicatorvalue_master(country_id);
CREATE INDEX geosight_data_indicatorvalue_entity_id ON geosight_data_indicatorvalue_master(entity_id);
CREATE INDEX geosight_data_indicatorvalue_indicator_id ON geosight_data_indicatorvalue_master(indicator_id);
CREATE INDEX geosight_data_indicatorvalue_geom_id ON geosight_data_indicatorvalue_master(geom_id);

-- Foreign keys --
ALTER TABLE geosight_data_indicatorvalue_master
    ADD CONSTRAINT geosight_data_indicator_value_entity_foreign_key FOREIGN KEY (entity_id) REFERENCES geosight_georepo_entity(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE geosight_data_indicatorvalue_master
    ADD CONSTRAINT geosight_data_indicator_value_indicator_foreign_key FOREIGN KEY (indicator_id) REFERENCES geosight_data_indicator(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE geosight_data_indicatorvalue_master
    ADD CONSTRAINT geosight_data_indicator_value_country_foreign_key FOREIGN KEY (country_id) REFERENCES geosight_georepo_entity(id) DEFERRABLE INITIALLY DEFERRED;