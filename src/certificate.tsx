import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ReactComponent as TopSvg } from './top.svg'
import { ReactComponent as BottomSvg } from './bottom.svg'
import { Ratio } from './config'
import { toPng } from 'html-to-image'
import { carText, modifyDriverName, setPosition } from './common'

export interface CertificateProps {
  loading: boolean
  data: RaceCertificateData | null
  ratio: Ratio
  removeNumbers: boolean
  error: string | null
  configSection: React.ReactNode
  customSeriesImage: string | undefined
  customHeader: string
}

export interface RaceCertificateData {
  Position: number
  PositionInClass: number
  Event: string
  Class: string
  Date: string
  SeasonShort: string
  Season: string
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

export const Certificate: React.FC<CertificateProps> = ({ data, loading, ratio, removeNumbers, error, configSection, customSeriesImage, customHeader }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [positionText, setPositionText] = useState<string>()
  const maxHeight = `${Math.floor(180 * (1.6 / (ratio * ratio)))}px`
  const [seriesLogo, setSeriesLogo] = useState<boolean>(true)

  useEffect(() => {
    setPosition(data, setSeriesLogo, setPositionText, customHeader)
  }, [data, customHeader])

  const print = useCallback(() => {
    if (ref.current === null) {
      return
    }

    toPng(ref.current)
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = data ? `${data.Event} ${data.Date}.png` : 'podiumprints.png'
        link.href = dataUrl
        link.click()
      })
      .catch((err) => {
        console.log(err)
      })
  }, [ref, data])

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ background: 'white', padding: '1rem' }}>
        <div ref={ref}>
          <div style={{ position: 'relative', aspectRatio: ratio, width: '1056px', margin: 'auto', background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ position: 'absolute' }}>
              <TopSvg />
            </div>
            <div>
              <img src='/logos/iRacing-Inline-Color-Blue.png' style={{ margin: '3rem auto 0 auto', width: '25%' }} alt='iRacing Logo' />
              <div style={{ color: '#1E4488', fontWeight: 'bold' }}>
                Certificate of Achievement
              </div>
            </div>
            {error && <div style={{ fontWeight: 'bold', color: '#DF2826' }}>
              {error}
            </div>}
            {data && !loading ?
              <>
                <div style={{ color: '#DF2826', fontWeight: 'bold', fontFamily: 'monospacedFont', fontSize: '100px', lineHeight: '75%', marginTop: '1rem', marginBottom: '0.5rem' }}>
                  {positionText}
                </div>
                {customSeriesImage && <img src={customSeriesImage} style={{ margin: 'auto', maxHeight, maxWidth: '50%' }} alt='Series Logo' /> }
                {!customSeriesImage && seriesLogo && <img src={`/logos/${data.Logo}`} onError={(e) => { setSeriesLogo(false) }} style={{ margin: 'auto', maxHeight, maxWidth: '50%' }} alt='Series Logo' /> }
                <div>
                  <div style={{ fontWeight: 'bold' }}>
                    {data.Event} | {data.TrackName.replace('[Legacy] ', '').replace('[Retired] ', '')}
                  </div>
                  <div>
                    {data.LeagueEvent ? data.SeasonShort : `Split #${data.Split}/${data.Splits}`}
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    {carText(data.Class, data.CarName)}
                  </div>
                  <div>
                    <div style={{ display: 'inline' }}>
                      {`${new Date(data.Date).toDateString()} `}
                    </div>
                    <div style={{ display: 'inline' }}>
                      {new Date(data.Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                    </div>
                  </div>
                  {data.Driver ? <div style={{ paddingTop: '1rem', fontWeight: 'bold', fontSize: '2rem' }}>
                    {modifyDriverName(data.Driver, removeNumbers)}
                  </div> : <>
                    <div style={{ paddingTop: '1rem', fontWeight: 'bold' }}>
                      {data.Team}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', columnGap: '1rem', flexWrap: 'wrap', width: '60%', margin: 'auto' }}>
                      {data.TeamMembers && data.TeamMembers.split(',').map(name => {
                        return <div key={name}>
                          {modifyDriverName(name, removeNumbers)}
                        </div>
                      })
                      }
                    </div>
                  </>}
                </div>
              </> : loading ? <div className="loader" /> : <div />
            }
            <div style={{ textAlign: 'right', marginBottom: '-26px' }}>
              <BottomSvg />
              <div style={{ color: '#1E4488', fontWeight: 'bold', textAlign: 'center', transform: 'translateY(-70px)' }}>
                <div style={{ display: 'inline' }}>
                  John Henry
                </div>
                <div style={{ display: 'inline', marginLeft: '380px' }}>
                  David Kaemmer
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      { configSection }
      <button onClick={() => { print() }} className='Button' style={{ marginTop: '2rem' }}>DOWNLOAD</button>
      <div style={{ marginTop: '0.5rem', fontFamily: 'monospacedFont' }}>
        Note: Download only works on Chrome and Edge (for now...). <br /> Just screenshot if this is not available to you.
      </div>
    </div>
  )
}