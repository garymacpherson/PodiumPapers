export interface SeasonParticipationData {
  SeasonId: number
  Series: string
  SeriesShort: string
  CarClass: string
  CarClassId: number
  CarName: string
  SessionId: number
}

export interface SeasonData {
  Position: number,
  Driver: string,
  Division: number,
  Club: string,
  Starts: number,
  Wins: number,
  Poles: number,
  Points: number,
  Logo: string,
  Series: string,
}

export interface iRacingApiSeriesSearchResults {
  car_class_id: number
  car_class_name: string
  car_name: string
  season_id: number
  series_name: string
  series_short_name: string
  subsession_id: number
}