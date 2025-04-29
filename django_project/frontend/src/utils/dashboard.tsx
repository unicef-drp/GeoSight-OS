import { dictDeepCopy } from "./main";

export const cleanDashboardData = (data: any) => {
  try {
    data.referenceLayer = {
      identifier: data?.referenceLayer.identifier
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
    ['group', 'loading', 'disabled', 'legend', 'trueId'].map(key => {
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

  return JSON.stringify(_original) === JSON.stringify(_target)
}