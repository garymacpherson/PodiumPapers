import { CertificateData, iRacingApiRaceResults } from './raceResults.types'
import { get, getSpecialEventLogo, getiRacingCookie } from './common'

type Request = {
  subsessionid: number
  driverid: number
}

export const raceResultsHandler = async (request: Request): Promise<CertificateData | void> => {
  console.log('handling request', request)

  const error = getError(request)
  if (error) {
    console.log(error)
    return
  }

  const authCookie = await getiRacingCookie()

  if (authCookie) {
    const sessionDataSignedURL = await get(`https://members-ng.iracing.com/data/results/get?subsession_id=${request.subsessionid}&include_licenses=false`, authCookie)

    if (!sessionDataSignedURL.Success) {
      console.log('Unable to find subsessionid in iRacing API.')
      return
    }

    const sessionData = await get(JSON.parse(sessionDataSignedURL.Body).link, authCookie)

    if (!sessionData.Success) {
      console.log('Unable to query subsessionid data in iRacing API.')
      return
    }

    try {
      const raceResults = JSON.parse(sessionData.Body) as iRacingApiRaceResults
      let certificateData: CertificateData = raceResultsToDriverResult(raceResults, request.driverid)
      certificateData.Logo = getSpecialEventLogo(certificateData.SeasonLong, certificateData.Logo) as string

      console.log('Success', certificateData)
      
      return certificateData
    } catch (e) {
      console.log('Unable to parse iRacing API response for this driverid in this sessionid.', e)

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
  if (!body.subsessionid) {
    return 'Missing subsessionid from request.'
  }
  if (!body.driverid) {
    return 'Missing driverid from request.'
  }
  if (!Number.isInteger(body.subsessionid)) {
    return 'subsessionid must be an integer.'
  }
  if (!Number.isInteger(body.driverid)) {
    return 'driverid must be an integer.'
  }
  return null
}

const raceResultsToDriverResult = (raceResults: iRacingApiRaceResults, driverid: number): CertificateData => {
  const driverResult = raceResults.session_results.find(sr => sr.simsession_number === 0)?.results.find(r => r.cust_id === driverid)

  const Event = raceResults.league_name ? raceResults.league_name : raceResults.series_name
  const SeasonShort = raceResults.league_season_name ? raceResults.league_season_name : raceResults.season_short_name
  const Season = raceResults.league_season_name ? raceResults.league_season_name : raceResults.season_short_name
  const SeasonLong = raceResults.league_season_name ? raceResults.league_season_name : raceResults.season_name

  const LeagueEvent = !!raceResults.league_name

  if (driverResult) {
    return {
      Position: driverResult?.finish_position + 1,
      PositionInClass: driverResult?.finish_position_in_class + 1,
      Event,
      Class: driverResult?.car_class_name,
      Date: new Date(raceResults.start_time).toISOString(),
      SeasonShort,
      Season,
      SeasonLong,
      LeagueEvent,
      Split: raceResults.associated_subsession_ids.indexOf(raceResults.subsession_id) + 1,
      Splits: raceResults.associated_subsession_ids.length,
      Driver: driverResult?.display_name,
      TrackName: raceResults.track.track_name,
      Logo: raceResults.series_logo || '',
      CarName: driverResult.car_name
    }
  }

  // try find a team with this driver
  const teamResults = raceResults.session_results.find(sr => sr.simsession_number === 0)?.results.find(r => r.driver_results?.find(dr => dr.cust_id === driverid))

  if (teamResults) {
    return {
      Position: teamResults?.finish_position + 1,
      PositionInClass: teamResults?.finish_position_in_class + 1,
      Event,
      Class: teamResults?.car_class_name,
      Date: new Date(raceResults.start_time).toISOString(),
      SeasonShort,
      Season,
      SeasonLong,
      LeagueEvent,
      Split: raceResults.associated_subsession_ids.indexOf(raceResults.subsession_id) + 1,
      Splits: raceResults.associated_subsession_ids.length,
      Team: teamResults.display_name,
      TeamMembers: teamResults.driver_results?.map(dr => dr.display_name).join(','),
      TrackName: raceResults.track.track_name,
      Logo: raceResults.series_logo || '',
      CarName: teamResults.car_name
    }
  }

  throw new Error('Unable to find driverid in subsessionid.')
}