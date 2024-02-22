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
import React from "react";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";


export default function UploadComponent({ ...props }) {
  const { meta } = props
  return <Card sx={{ minWidth: 730, marginTop: 1 }}>
    <CardContent
      style={{ display: 'flex', flexDirection: 'row', padding: '0px' }}>
      <Grid container>
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
                  Level {props.level}
                </Typography>
              </Grid>
            </Grid>
            <LinearProgress
              variant="determinate" value={meta.percent}
              sx={{ marginTop: 2 }}/>
          </Grid>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
}