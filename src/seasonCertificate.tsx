import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ReactComponent as TopSvg } from './top.svg'
import { ReactComponent as BottomSvg } from './bottom.svg'
import { Ratio } from './config'
import { toJpeg, toPng } from 'html-to-image'
import { carText, modifyDriverName, setPosition } from './common'

export interface CertificateProps {
  loading: boolean
  data: SeasonCertificateData | null
  ratio: Ratio
  removeNumbers: boolean
  error: string | null
  configSection: React.ReactNode
  customSeriesImage: string | undefined
  customHeader: string
}

export interface SeasonCertificateData {
  Club: string
  Division: string
  Driver: string
  Logo: string
  Points: number
  Poles: number
  Position: number
  Series: string
  Starts: number
  Wins: number
  CarClass: string
  CarName: string
  Year: string
  Quarter: string
  myClubOnly: boolean
}

export const SeasonCertificate: React.FC<CertificateProps> = ({ data, loading, ratio, removeNumbers, error, configSection, customSeriesImage, customHeader }) => {
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
        link.download = data ? `${data.Series} ${data.CarClass} ${data.Year} ${data.Quarter} ${data.Division}.png` : 'podiumprints.png'
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
                    {data.Year} Season {data.Quarter}
                  </div>
                  {data.Division.toString() === '-1' ? <div style={{ fontWeight: 'bold' }}>
                    {data.myClubOnly ? data.Club : 'Worldwide'}
                  </div> : <div style={{ fontWeight: 'bold' }}>
                    {data.myClubOnly ? data.Club : 'Worldwide'} {data.Division === '10' && 'Rookie'} Division {data.Division !== '10' && (Number.parseInt(data.Division) + 1)}
                  </div>}
                  <div style={{ fontWeight: 'bold' }}>
                    {data.Series}
                  </div>
                  <div>
                    {carText(data.CarClass, data.CarName)}
                  </div>
                  <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <div>
                      {data.Points} Point{data.Points > 1 && 's'}
                    </div>
                    {data.Wins > 0 && <div>
                      {data.Wins} Win{data.Wins > 1 && 's'}
                    </div>}
                    {data.Poles > 0 && <div>
                      {data.Poles} Pole{data.Poles > 1 && 's'}
                    </div>}
                  </div>
                  <div style={{ paddingTop: '1rem', fontWeight: 'bold', fontSize: '2rem' }}>
                    {modifyDriverName(data.Driver, removeNumbers)}
                  </div>
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