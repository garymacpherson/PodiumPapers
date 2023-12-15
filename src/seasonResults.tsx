import React, { useEffect, useState } from 'react'
import { SeasonCertificate, SeasonCertificateData } from './seasonCertificate'
import axios from 'axios'
import { ResultsProps } from './common'

export interface ParticipationData {
  SeasonId: number
  Series: string
  SeriesShort: string
  CarClass: string
  CarClassId: number
  CarName: string
  SessionId: number
}

export const SeasonResults: React.FC<ResultsProps> = ({ ratio, removeNumbers, configSection, customSeriesImage, customHeader}) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [participationData, setParticipationData] = useState<ParticipationData[] | null>(null)
  const [selectedSeriesData, setSelectedSeriesData] = useState<ParticipationData | null>(null)
  const [certData, setCertData] = useState<SeasonCertificateData | null>(null)
  const [year, setYear] = useState<string>('2023')
  const [quarter, setQuarter] = useState<string>('1')
  const [driverId, setDriverId] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [seasonId, setSeasonId] = useState<string | null>(null)
  const [carClassId, setCarClassId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [myClubOnly, setMyClubOnly] = useState<boolean>(false)

  useEffect(() => {
    const preloadDriverId = localStorage.getItem('driverId') || undefined

    if (preloadDriverId && !Number.isNaN(preloadDriverId)) {
      setDriverId(preloadDriverId.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetData = () => {
    setParticipationData(null)
    setSelectedSeriesData(null)
    setCertData(null)
    setError(null)
  }

  const resetCertificateData = () => {
    setCertData(null)
    setError(null)
  }

  const requestParticipationData = (year: string | undefined, quarter: string | undefined, driverId: string | undefined) => {
    if (year && !isNaN(Number.parseInt(year)) && quarter && !isNaN(Number.parseInt(quarter)) && driverId && !isNaN(Number.parseInt(driverId))) {
      const body = {
        year: Number.parseInt(year),
        quarter: Number.parseInt(quarter),
        driverid: Number.parseInt(driverId)
      }

      setLoading(true)
      setParticipationData(null)
      setError(null)

      axios.get(`https://pihqafk0xh.execute-api.ap-southeast-2.amazonaws.com/prod/api/getseasonparticipation/${year}${quarter}${driverId}`)
        .then((result) => {
          if (result.status === 200) {
            setError(null)
            setParticipationData(result.data.ParticipationData)
            setLoading(false)
          } else {
            axios.post('https://pihqafk0xh.execute-api.ap-southeast-2.amazonaws.com/prod/api/createseasonparticipation', body)
              .then(() => {
                pollForParticipationData(year, quarter, driverId)
              })
          }
        }).catch(e => {
          setLoading(false)
          setError(e.response.data.Error)
          setCertData(null)
        })
    }
  }

  const pollForParticipationData = (year: string, quarter: string, driverId: string) => {
    setTimeout(() => {
      axios.get(`https://pihqafk0xh.execute-api.ap-southeast-2.amazonaws.com/prod/api/getseasonparticipation/${year}${quarter}${driverId}`)
        .then((result) => {
          if (result.status === 200) {
            setError(null)
            setParticipationData(result.data.ParticipationData)
            setLoading(false)
          }
          if (result.status === 202) {
            pollForParticipationData(year, quarter, driverId)
          }
        }).catch(e => {
          setLoading(false)
          setError(e.response.data.Error)
          setParticipationData(null)
        })
    }, 4000)
  }

  const requestCertificate = (seasonId: string | null, carClassId: string | null, driverId: string | undefined, sessionId: string | undefined, myClubOnly: boolean) => {
    if (seasonId && !isNaN(Number.parseInt(seasonId)) &&
      carClassId && !isNaN(Number.parseInt(carClassId)) &&
      driverId && !isNaN(Number.parseInt(driverId)) &&
      sessionId && !isNaN(Number.parseInt(sessionId))) {
      const body = {
        seasonid: Number.parseInt(seasonId),
        carclassid: Number.parseInt(carClassId),
        driverid: Number.parseInt(driverId),
        sessionid: Number.parseInt(sessionId),
        club: myClubOnly
      }

      setLoading(true)
      setCertData(null)
      setError(null)

      axios.get(`https://pihqafk0xh.execute-api.ap-southeast-2.amazonaws.com/prod/api/getseasoncert/${seasonId}${carClassId}${driverId}${myClubOnly ? 'club' : 'world'}`)
        .then((result) => { 
          if (result.status === 200) {
            setError(null)
            setCertData(result.data)
            setLoading(false)
          } else {
            axios.post('https://pihqafk0xh.execute-api.ap-southeast-2.amazonaws.com/prod/api/createseasoncert', body)
              .then(() => {
                pollForResult(seasonId, carClassId, driverId, sessionId, myClubOnly)
              })
          }
        }).catch(e => {
          setLoading(false)
          setError(e.response.data.Error)
          setCertData(null)
        })
    }
  }

  const pollForResult = (seasonId: string, carClassId: string, driverId: string, sessionId: string, myClubOnly: boolean) => {
    setTimeout(() => {
      axios.get(`https://pihqafk0xh.execute-api.ap-southeast-2.amazonaws.com/prod/api/getseasoncert/${seasonId}${carClassId}${driverId}${myClubOnly ? 'club' : 'world'}`)
        .then((result) => {
          if (result.status === 200) {
            setError(null)
            setCertData(result.data)
            setLoading(false)
          }
          if (result.status === 202) {
            pollForResult(seasonId, carClassId, driverId, sessionId, myClubOnly)
          }
        }).catch(e => {
          setLoading(false)
          setError(e.response.data.Error)
          setCertData(null)
        })
    }, 4000)
  }

  const handleSeriesSelection = (value: string): void => {
    if (value !== 'SELECT') {
      const values = value.split('|')
      setSeasonId(values[0])
      setCarClassId(values[1])
      setSessionId(values[2])
      setSelectedSeriesData(participationData?.find(pd => pd.SeasonId.toString() === values[0] && pd.CarClassId.toString() === values[1])!)
      setCertData(null)
    }
  }

  const mergedData = certData && selectedSeriesData ? { ...selectedSeriesData, ...certData, Year: year, Quarter: quarter, myClubOnly } : null

  return (
    <div className='Main-Container'>
      <div style={{ display: 'flex', flexDirection: 'column', width: '600px', margin: 'auto', alignItems: 'center' }}>
        <div className={'inputLabel'}>
          Year
        </div>
        <input type='number' min='2008' max='2099' value={year} onChange={(e) => { setYear(e.target.value); resetData() }} className='CertInput' />
        <div className={'inputLabel'}>
          Season
        </div>
        <input type='number' min='1' max='4' value={quarter} onChange={(e) => { setQuarter(e.target.value); resetData() }} className='CertInput' />
        <div className={'inputLabel'}>
          Driver ID
        </div>
        <input type='number' min='1' max='999999' value={driverId} onChange={(e) => { setDriverId(e.target.value); resetData(); localStorage.setItem('driverId', e.target.value) }} className='CertInput' />
        <div style={{display: 'flex', marginBottom: '2rem', justifyContent: 'center', gap: '2rem' }}>
          <div className='radio'>
            <label>
              <input type='radio' checked={myClubOnly === false} onChange={() => {setMyClubOnly(false); resetCertificateData()}} />
              Worldwide
            </label>
          </div>
          <div className='radio'>
            <label>
              <input type='radio' checked={myClubOnly === true} onChange={() => {setMyClubOnly(true); resetCertificateData()}} />
              My Club
            </label>
          </div>
        </div>
        {participationData && <>
          <div className={'inputLabel'}>
            Series & Car
          </div>
          <select onChange={(e) => handleSeriesSelection(e.target.value)} className='CertSelect'>
            <option value={undefined}>SELECT</option>
            {participationData.map(pd => <option key={`${pd.SeasonId}|${pd.CarClassId}`} value={`${pd.SeasonId}|${pd.CarClassId}|${pd.SessionId}`}>{pd.Series} | {pd.CarName}</option>)}
          </select>
        </>}
        {!participationData && <button onClick={() => { requestParticipationData(year, quarter, driverId) }} className='Button' style={{width: '100%'}}>{loading ? 'WORKING...' : 'GET SERIES DATA'}</button>}
        {participationData && <button onClick={() => { requestCertificate(seasonId, carClassId, driverId, sessionId, myClubOnly) }} className='Button' style={{width: '100%'}}>{loading ? 'WORKING...' : certData ? 'DONE!' : 'CREATE CERTIFICATE'}</button>}
      </div>
      <SeasonCertificate ratio={ratio} data={mergedData} loading={loading} removeNumbers={removeNumbers} error={error} configSection={configSection} customSeriesImage={customSeriesImage} customHeader={customHeader} />
      <div style={{ marginTop: '2rem' }}>
        Support another great community built tool at <a href={driverId ? `https://www.iracingtrophies.com/#/user/${driverId}` : `https://www.iracingtrophies.com`} target="_blank" rel="noreferrer">iRacing Trophies!</a>
      </div>
      <div style={{ marginTop: '1rem' }}>
        iRacing.com&trade; is a trademark of <a href='https://iracing.com'>iRacing.com</a> Motorsport Simulations.
      </div>
    </div>
  )
}
