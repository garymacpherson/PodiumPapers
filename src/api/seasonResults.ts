import { SeasonData } from './season.types'

import { get, getSpecialEventLogo, getiRacingCookie } from './common'
import { iRacingApiRaceResults } from './raceResults.types'

type Request = {
  club: boolean
  driverid: number
  sessionid: string
  seasonid: string
  carclassid: string
}

export const seasonResultsHandler = async (request: Request): Promise<SeasonData | void> => {
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
    let driverClub = -1
    if (request.club) {
      const clubDataSignedURL = await get(`https://members-ng.iracing.com/data/member/get?cust_ids=${request.driverid}`, authCookie)
      const clubRequestUrl = JSON.parse(clubDataSignedURL.Body).link
      driverClub = JSON.parse((await get(clubRequestUrl, authCookie)).Body).members[0].club_id
    }

    var division = 0
    const sessionDataSignedURL = await get(`https://members-ng.iracing.com/data/results/get?subsession_id=${request.sessionid}&include_licenses=false`, authCookie)
    const sessionData = await get(JSON.parse(sessionDataSignedURL.Body).link, authCookie)
    const raceResults = JSON.parse(sessionData.Body) as iRacingApiRaceResults
    
    console.log('getting division for sessionid', request.sessionid)
    const driverSeasonDivision = raceResultsToDriverDivision(raceResults, request.driverid)
    console.log('setting division for SeasonId to ', driverSeasonDivision)
    division = driverSeasonDivision
    
    let driverStandingsSignedURL = `https://members-ng.iracing.com/data/stats/season_driver_standings?season_id=${request.seasonid}&car_class_id=${request.carclassid}&division=${division}&club_id=${driverClub}`
    let seasonDataSignedURL = await get(driverStandingsSignedURL, authCookie)
    let seasonData = await get(JSON.parse(seasonDataSignedURL.Body).link, authCookie)
    let seasonDataBody = JSON.parse(seasonData.Body)

    var Logo = getSpecialEventLogo(seasonDataBody.season_name)

    console.log('logo', Logo)

    if (!Logo) {
      const seriesAssetsSignedURL = await get('https://members-ng.iracing.com/data/series/assets', authCookie)
      const seriesAssetsRequestUrl = JSON.parse(seriesAssetsSignedURL.Body).link
      const seriesAssets = JSON.parse((await get(seriesAssetsRequestUrl, authCookie)).Body)
      if (seriesAssets[seasonDataBody.series_id]?.logo) {
        console.log('found logo for series id', seasonDataBody.series_id, seriesAssets[seasonDataBody.series_id].logo)
        Logo = seriesAssets[seasonDataBody.series_id].logo as string
      } else {
        Logo = 'nologofound.png'
      }
    }

    const currentTime = Math.floor(Date.now() / 1000)
    const ttl = currentTime + 1 * 15 * 60 // 15 minutes in seconds

    const id = `${request.seasonid}${request.carclassid}${request.driverid}${request.club ? 'club' : 'world'}`

    if (!seasonData.Success) {
      console.log('Unable to find season data in iRacing API.')

      return
    }

    try {
      const urls: string[] = seasonDataBody.chunk_info.chunk_file_names.map((chunkUrl: string) => seasonDataBody.chunk_info.base_download_url + chunkUrl)
      
      const promises = urls.map((url) =>
        get(url, authCookie)
          .then((response) => JSON.parse(response.Body))
      )
      // flatten array of arrays to an array 
      const seasonResultsData = (await Promise.all(promises)).reduce((accumulator, value) => accumulator.concat(value), [])
      
      const driverData = seasonResultsData.find((x: any) => x.cust_id === request.driverid)

      const seasonResult: SeasonData = {
        Club: driverData.club_name,
        Division: driverData.division,
        Driver: driverData.display_name,
        Logo,
        Points: driverData.points,
        Poles: driverData.poles,
        Position: driverData.rank,
        Series: seasonDataBody.series_name,
        Starts: driverData.starts,
        Wins: driverData.wins
      }
      
      return seasonResult
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
  if (!body.carclassid) {
    return 'Missing carclassid from request.'
  }
  if (!body.seasonid) {
    return 'Missing seasonid from request.'
  }
  if (!body.driverid) {
    return 'Missing driverid from request.'
  }
  if (!body.sessionid) {
    return 'Missing sessionid from request.'
  }
  if (!Number.isInteger(body.carclassid)) {
    return 'carclassid must be an integer.'
  }
  if (!Number.isInteger(body.seasonid)) {
    return 'seasonid must be an integer.'
  }
  if (!Number.isInteger(body.driverid)) {
    return 'driverid must be an integer.'
  }
  if (!Number.isInteger(body.sessionid)) {
    return 'sessionid must be an integer.'
  }
  if (body.club !== null && body.club !== undefined && body.club !== false && body.club !== true) {
    return 'club must be an boolean.'
  }
  return null
}

const raceResultsToDriverDivision = (raceResults: iRacingApiRaceResults, driverid: number): number => {
  const driverResult = raceResults.session_results.find(sr => sr.simsession_number === 0)?.results.find(r => r.cust_id === driverid)

  if (driverResult) {
    return driverResult.division
  }

  const teamResult = raceResults.session_results.find(sr => sr.simsession_number === 0)?.results.find(r => r.driver_results?.find(dr => dr.cust_id === driverid))

  if (teamResult) {
    return teamResult.driver_results!.find(r => r.cust_id === driverid)!.division
  }

  throw new Error('Unable to find driverid in subsessionid.')
}