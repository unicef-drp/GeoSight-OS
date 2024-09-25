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
 * __date__ = '22/02/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import React, { useEffect, useState } from "react";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Select } from "../../../../components/Input";
import { Handle } from "../../../../components/SortableTreeForm/TreeItem";
import { DjangoRequests } from "../../../../Requests";

function Selection({ fileId, title, name, properties }) {
  const [loading, setLoading] = useState(false)
  const options = properties.map(prop => {
    return {
      value: prop,
      label: prop
    }
  })
  const [value, setValue] = useState({
    label: properties[0],
    value: properties[0],
  });

  // When selection changed
  useEffect(() => {
    setLoading(true)
    DjangoRequests.post(
      urls.api.updateLevelvalue, {
        createdAt: createdAt,
        id: fileId,
        name: name,
        value: value.value,
      }
    ).then(() => {
      setLoading(false)
    })
  }, [value])

  return <div className="BasicFormSection">
    <div className='RuleTable-Title'>{title}</div>
    <Select
      name={name}
      value={value}
      onChange={evt => {
        setValue(evt)
      }}

      options={options}
      menuPlacement={'bottom'}
      isDisabled={loading}
    />
  </div>
}

export default function PreviewComponent(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const { meta } = props

  return (
    <div ref={setNodeRef} style={style} className='Draggable'>
      <Card sx={{ minWidth: 730, marginTop: 1 }}>
        <CardContent style={{ padding: '0px' }}>
          <Grid container>
            <Handle {...attributes} {...listeners} />
            <Grid item flexGrow={1}>
              <Grid container flexDirection='column'>
                <Grid container>
                  <Grid item xs={12} md={8} style={{ textAlign: 'left' }}>
                    <Typography
                      sx={{ fontSize: 14 }} color='text.secondary'
                      gutterBottom>
                      {meta.type}
                    </Typography>
                    <Typography variant="h6" component="div">
                      {meta.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography
                      sx={{ marginRight: 1 }}
                      textAlign={'right'}>
                      Level {meta.level}
                    </Typography>
                  </Grid>
                </Grid>
                <LinearProgress
                  variant="determinate" value={meta.percent}
                  sx={{ marginTop: 2 }}/>
              </Grid>
            </Grid>
          </Grid>
          {
            meta.properties ?
              <div className='property-selection'>
                <Selection
                  fileId={props.id}
                  title='Property name for name boundary'
                  name={`name_field`}
                  properties={meta.properties}/>
                <Selection
                  fileId={props.id}
                  title='Column name for ucode'
                  name={`ucode_field`}
                  properties={meta.properties}/>
                {
                  meta.level !== 0 ? <Selection
                    fileId={props.id}
                    title='Column name for parent ucode'
                    name={`parent_ucode_field`}
                    properties={meta.properties}/> : <></>
                }
              </div> : <></>
          }
        </CardContent>
      </Card>
    </div>
  );
}