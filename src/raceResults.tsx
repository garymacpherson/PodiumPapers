import React, { useEffect, useState } from 'react'
import { Certificate, RaceCertificateData } from './certificate'
import * as qs from 'qs'
import { ResultsProps } from './common'
import { raceResultsHandler } from './api/raceResults'

export const RaceResults: React.FC<ResultsProps> = ({ ratio, removeNumbers, configSection, customSeriesImage, customHeader}) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [certData, setCertData] = useState<RaceCertificateData | null>(null)
  const [sessionId, setSessionId] = useState<string>('')
  const [driverId, setDriverId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    var preloadSessionId = qs.parse(window.location.search, { ignoreQueryPrefix: true }).sessionid
    var preloadDriverId = qs.parse(window.location.search, { ignoreQueryPrefix: true }).driverid
 
    if (!preloadDriverId) {
      preloadDriverId = localStorage.getItem('driverId') || undefined
    }

    if (preloadSessionId && !Number.isNaN(preloadSessionId)) {
      setSessionId(preloadSessionId.toString())
    }

    if (preloadDriverId && !Number.isNaN(preloadDriverId)) {
      setDriverId(preloadDriverId.toString())
    }

    if (preloadSessionId && preloadDriverId && !Number.isNaN(preloadSessionId) && !Number.isNaN(preloadDriverId)) {
      requestCertificate(preloadSessionId.toString(), preloadDriverId.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runDemo = async () => {
    setSessionId('60570590')
    setDriverId('334578')
    await requestCertificate('60570590', '334578')
  }

  const requestCertificate = async (sessionId: string | undefined, driverId: string | undefined) => {
    if (sessionId && !isNaN(Number.parseInt(sessionId)) && driverId && !isNaN(Number.parseInt(driverId))) {
      const request = {
        subsessionid: Number.parseInt(sessionId),
        driverid: Number.parseInt(driverId)
      }

      setLoading(true)
      setCertData(null)
      setError(null)

      const result = await raceResultsHandler(request)

      if (result) {
        setError(null)
        setCertData(result)
        setLoading(false)
      } else {
        setLoading(false)
        setError('its all gone wrong')
        setCertData(null)
      }

      console.log(result)
    }
  }

  return (
    <div className='Main-Container'>
      <div style={{ display: 'flex', flexDirection: 'column', width: '600px', margin: 'auto', alignItems: 'center' }}>
        <div className={'inputLabel'}>
          Session ID
        </div>
        <input type='number' name='session' min='1' max='99999999' value={sessionId} onChange={(e) => { setSessionId(e.target.value); setCertData(null); setError(null) }}  className='CertInput' />
        <div className={'inputLabel'}>
          Driver ID
        </div>
        <input type='number' name='driver' min='1' max='999999' value={driverId} onChange={(e) => { setDriverId(e.target.value); setCertData(null); setError(null); localStorage.setItem('driverId', e.target.value) }} className='CertInput' />
        <div style={{ display: 'flex', width: '100%' }}>
          <button onClick={async () => { await requestCertificate(sessionId, driverId) }} className='Button' style={{ width: '70%' }}>{loading ? 'WORKING...' : certData ? 'DONE!' : 'CREATE CERTIFICATE'}</button>
          <button onClick={async () => { await runDemo() }} className='Button Blue' style={{ width: '30%' }}>DEMO</button>
        </div>
      </div>
      <Certificate ratio={ratio} data={certData} loading={loading} removeNumbers={removeNumbers} error={error} configSection={configSection} customSeriesImage={customSeriesImage} customHeader={customHeader} />
      <div style={{ marginTop: '2rem' }}>
        Support another great community built tool at <a href={driverId ? `https://www.iracingtrophies.com/#/user/${driverId}` : `https://www.iracingtrophies.com`} target="_blank" rel="noreferrer">iRacing Trophies!</a>
      </div>
      <div style={{ marginTop: '1rem' }}>
        iRacing.com&trade; is a trademark of <a href='https://iracing.com'>iRacing.com</a> Motorsport Simulations.
      </div>
    </div>
  )
}
