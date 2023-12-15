import { SeasonParticipationData, iRacingApiSeriesSearchResults } from './season.types'

import { get, getiRacingCookie } from './common'

type Request = {
  year: number
  quarter: number
  driverid: number
}

export const seasonParticipationHandler = async (request: Request): Promise<SeasonParticipationData[] | void> => {
  console.log('handling request', request)

  const error = getError(request)
  if (error) {
    console.log(error)
    return
  }

  if (!process.env.TABLE_NAME) {
    console.log('No table_name process env var found.')
    return
  }

  const authCookie = await getiRacingCookie()

  if (authCookie) {
    const seriesSearchSignedURL = await get(`https://members-ng.iracing.com/data/results/search_series?season_year=${request.year}&season_quarter=${request.quarter}&official_only=true&event_types=5&cust_id=${request.driverid}`, authCookie)

    if (!seriesSearchSignedURL.Success) {
      console.log('Unable to find participation data in iRacing API.')

      return
    }

    const dataBody = JSON.parse(seriesSearchSignedURL.Body)
    let seasonParticipationData: iRacingApiSeriesSearchResults[] = []

    if (dataBody.data.chunk_info.num_chunks === 0) {
      console.log('No participation in any series for this year, season and driverid.')

      return
    }

    for (const chunk of dataBody.data.chunk_info.chunk_file_names as string[]) {
      const chunkDataUrl = dataBody.data.chunk_info.base_download_url + chunk
      const chunkData = await get(chunkDataUrl, authCookie)

      if (!chunkData.Success) {
        console.log('Unable to find any series participation data in iRacing API.')
        return
      }
      seasonParticipationData = seasonParticipationData.concat(JSON.parse(chunkData.Body))
    }

    try {
      const participationData: SeasonParticipationData[] = seasonParticipationData
        .filter((v,i,a)=>a.findIndex(v2=>['season_id','car_class_id','car_name']
        .every(k=>v2[k as keyof iRacingApiSeriesSearchResults] === v[k as keyof iRacingApiSeriesSearchResults]))===i)
        .map(sr => {
          return {
            SeasonId: sr.season_id,
            Series: sr.series_name,
            SeriesShort: sr.series_short_name,
            CarClass: sr.car_class_name,
            CarClassId: sr.car_class_id,
            CarName: sr.car_name,
            SessionId: sr.subsession_id
          }
        })
        .sort((a, b) => a.Series.localeCompare(b.Series))

      return participationData
    } catch (e) {
      console.log('Unable to parse iRacing API response.', e)

      return
    }
  } else {
    console.log('Auth error to iRacing API.')
    return
  }
}

const getError = (body: any): string | null => {
  if (!body) {
    return 'Missing body from request.'
  }
  if (!body.year) {
    return 'Missing year from request.'
  }
  if (!body.quarter) {
    return 'Missing quarter from request.'
  }
  if (!body.driverid) {
    return 'Missing driverid from request.'
  }
  if (!Number.isInteger(body.year)) {
    return 'year must be an integer.'
  }
  if (!Number.isInteger(body.quarter)) {
    return 'quarter must be an integer.'
  }
  if (!Number.isInteger(body.driverid)) {
    return 'driverid must be an integer.'
  }
  return null
}