export interface CertificateData {
  Position: number
  PositionInClass: number
  Event: string
  Class: string
  Date: string
  Season: string
  SeasonShort: string
  SeasonLong: string
  LeagueEvent: boolean
  Split: number
  Splits: number
  Driver?: string
  Team?: string
  TeamMembers?: string
  TrackName: string
  Logo: string
  CarName: string
}

export interface ApiResponse {
  Success: boolean
  Body: any
}

export interface iRacingApiRaceResults {
  subsession_id: number,
  season_name: string,
  season_short_name: string,
  season_year: number,
  season_quarter: number,
  series_name: string,
  series_short_name: string,
  series_logo: string,
  start_time: string,
  league_name: string,
  league_season_name: string,
  track: {
    track_name: string,
    config_name: string
  },
  session_results: [
    {
      simsession_number: number,
      simsession_type_name: string,
      simsession_name: string,
      results: [
        {
          cust_id?: number,
          team_id?: number
          display_name: string,
          finish_position: number,
          finish_position_in_class: number,
          car_class_name: string,
          car_class_short_name: string,
          car_name: string
          driver_results?: [
            {
              display_name: string
              cust_id: number
              division: number
            }
          ],
          division: number
        }
      ]
    }
  ],
  associated_subsession_ids : number[]
}