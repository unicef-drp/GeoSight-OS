import { dictDeepCopy } from "./main";

export const cleanDashboardData = (data: any) => {
  try {
    data.referenceLayer = {
      identifier: data?.referenceLayer?.identifier,
      bbox: data?.referenceLayer?.bbox,
    }
  } catch (err) {

  }
  data?.indicatorLayers?.map((ctx: any) => {
    ['group', 'loading', 'disabled', 'legend', 'trueId'].map(key => {
      try {
        delete ctx[key]
      } catch (err) {

      }
    })
  })
  data?.contextLayers?.map((ctx: any) => {
    ['group', 'loading', 'disabled', 'legend', 'trueId', 'parameters'].map(key => {
      try {
        delete ctx[key]
      } catch (err) {

      }
    })
  })

}
export const isDashboardDataSame = (
  original: any, target: any
) => {
  const _original = dictDeepCopy(original)
  const _target = dictDeepCopy(target)
  cleanDashboardData(_original)
  cleanDashboardData(_target)

  // If the identifier is different, the extent of target should be the same with bbox on the _target.referenceLayer
  if (_target?.referenceLayer?.identifier && _original?.referenceLayer?.identifier !== _target?.referenceLayer?.identifier) {
    try {
      delete _target.levelConfig
      delete _original.levelConfig
    } catch (err) {

    }
    if (_target.referenceLayer.bbox && JSON.stringify(_target.referenceLayer.bbox) !== JSON.stringify(_target.extent)) {
      try {
        delete _target.extent
        delete _original.extent
        delete _target.referenceLayer
        delete _original.referenceLayer
      } catch (err) {

      }
    }
  }
  return JSON.stringify(_original) === JSON.stringify(_target)
}