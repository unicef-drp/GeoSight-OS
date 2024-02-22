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
 * __date__ = '13/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

const path = require("path");
const BundleTracker = require('webpack-bundle-tracker');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const mode = process.env.npm_lifecycle_event;
const isDev = (mode === 'dev');
const filename = isDev ? "[name]" : "[name].[fullhash]";
const statsFilename = isDev ? './webpack-stats.dev.json' : './webpack-stats.prod.json';
const minimized = !isDev;

let conf = {
  entry: {
    Home: ['./src/pages/Home'],
    Login: ['./src/pages/Login'],
    SignUp: ['./src/pages/SignUp'],
    GeoRepoAuthFailed: ['./src/pages/GeoRepoAuthFailed'],
    Dashboard: ['./src/pages/Dashboard/Page'],
    DashboardForm: ['./src/pages/Admin/Dashboard/Form'],
    AdminDashboardList: ['./src/pages/Admin/Dashboard/List'],
    AdminIndicatorList: ['./src/pages/Admin/Indicator/List'],
    AdminIndicatorForm: ['./src/pages/Admin/Indicator/Form'],
    AdminBasemapList: ['./src/pages/Admin/Basemap/List'],
    AdminBasemapForm: ['./src/pages/Admin/Basemap/Form'],
    AdminContextLayerList: ['./src/pages/Admin/ContextLayer/List'],
    AdminContextLayerForm: ['./src/pages/Admin/ContextLayer/Form'],
    AdminStyleList: ['./src/pages/Admin/Style/List'],
    AdminStyleForm: ['./src/pages/Admin/Style/Form'],
    AdminUserForm: ['./src/pages/Admin/UserAndGroup/User/Form'],
    AdminGroupForm: ['./src/pages/Admin/UserAndGroup/Group/Form'],
    AdminUserGroupList: ['./src/pages/Admin/UserAndGroup/List'],
    AdminDataset: ['./src/pages/Admin/Dataset'],
    AdminDataBrowser: ['./src/pages/Admin/DataBrowser'],
    AdminDataAccess: ['./src/pages/Admin/DataAccess'],
    AdminRelatedTableForm: ['./src/pages/Admin/RelatedTable/Form'],
    AdminRelatedTableList: ['./src/pages/Admin/RelatedTable/List'],
    AdminRelatedTableData: ['./src/pages/Admin/RelatedTable/Data'],

    // DATA MANAGEMENT
    AdminDataManagement: ['./src/pages/Admin/Importer/List'],
    AdminImporter: ['./src/pages/Admin/Importer/Form'],
    AdminImporterDetail: ['./src/pages/Admin/Importer/ImporterDetail'],
    AdminImporterLogDetail: ['./src/pages/Admin/Importer/LogDetail'],
    AdminImporterLogData: ['./src/pages/Admin/Importer/LogData'],

    // ACCESS REQUEST
    AdminAccessRequestList: ['./src/pages/Admin/AccessRequest/List'],
    AdminAccessRequestUserDetail: ['./src/pages/Admin/AccessRequest/Detail/User'],
    AdminAccessRequestPermissionDetail: ['./src/pages/Admin/AccessRequest/Detail/Permission'],

    // INDICATOR MANAGEMENT
    IndicatorValueList: ['./src/pages/Admin/Indicator/IndicatorValueList'],
    IndicatorValueManagementMap: ['./src/pages/Admin/Indicator/ValueManagementMap'],
    IndicatorValueManagementForm: ['./src/pages/Admin/Indicator/ValueManagementForm'],

    // REFERENCE LAYER VIEW
    AdminReferenceLayerViewForm: ['./src/pages/Admin/ReferenceLayerView/Form'],
    AdminReferenceLayerViewList: ['./src/pages/Admin/ReferenceLayerView/List'],
    AdminReferenceLayerViewEntityBrowser: ['./src/pages/Admin/ReferenceLayerView/EntityBrowser'],
    AdminReferenceLayerImporterForm: ['./src/pages/Admin/ReferenceLayerView/Importer'],
  },
  output: {
    path: path.resolve(__dirname, "./bundles/frontend"),
    filename: filename + '.js'
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: [
          { loader: 'babel-loader' },
          {
            loader: 'react-svg-loader',
            options: {
              jsx: true,
              svgo: {
                plugins: [
                  {
                    removeViewBox: false,
                  },
                ],
              }
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [{ loader: 'babel-loader' }],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        test: /\.css$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
        ],
      },
    ],
  },
  optimization: {
    minimize: minimized
  },
  plugins: [
    new BundleTracker({ filename: statsFilename }),
    new MiniCssExtractPlugin({
      filename: filename + '.css',
      chunkFilename: filename + '.css',
    }),
  ],
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx']
  },
};

// This is for dev
if (isDev) {
  conf['output'] = {
    path: path.resolve(__dirname, "./bundles"),
    filename: filename + '.js',
    publicPath: 'http://localhost:9000/',
  }
  conf['devServer'] = {
    hot: true,
    port: 9000,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  }
  conf['plugins'].push(
    isDev && new ReactRefreshWebpackPlugin({ overlay: false })
  )
}
module.exports = conf;