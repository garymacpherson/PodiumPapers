import React, { useEffect, useState } from 'react'
import './app.css'
import { RaceResults } from './raceResults'
import { SeasonResults } from './seasonResults'
import { ReactComponent as Podium } from './podium.svg'
import { Config, Ratio } from './config'

export const App = () => {
  const [type, setType] = useState<'Race' | 'Season'>('Race')
  const [ratio, setRatio] = useState<Ratio>(Ratio.ISO216)
  const [removeNumbers, setRemoveNumbers] = useState<boolean>(false)
  const [customHeader, setCustomHeader] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File>()
  const [customSeriesImage, setCustomSeriesImage] = useState<string>()

  useEffect(() => {
    if (selectedFile) {
      const objectURL = URL.createObjectURL(selectedFile)
      setCustomSeriesImage(objectURL) 
      return () => URL.revokeObjectURL(objectURL)
    } else {
      setCustomSeriesImage(undefined)
    }
  }, [selectedFile])
  
  const configSection = <Config
    ratio={ratio}
    removeNumbers={removeNumbers}
    setRatio={setRatio}
    setRemoveNumbers={setRemoveNumbers}
    setSelectedFile={setSelectedFile}
    customHeader={customHeader}
    setCustomHeader={setCustomHeader} />
  
  return (
    <div className='App'>
      <header className='App-header'>
        <Podium />
        <h1 className='App-title'>
          PODIUM<br />PAPERS
        </h1>
        <h2 className='App-subtitle'>
          iRacing results certificates... but better.
        </h2>
      </header>
      <div style={{background: '#e0e0e0', display: 'flex', justifyContent: 'center', borderBottom: '4px #df2826 solid'}}>
        <button className={type === 'Race' ? 'Button Red' : 'Button Grey'} style={{width: '50%'}} onClick={() => {setType('Race'); setSelectedFile(undefined)}}>
          RACE
        </button>
        <button className={type === 'Season' ? 'Button Red' : 'Button Grey'} style={{width: '50%'}} onClick={() => {setType('Season'); setSelectedFile(undefined)}}>
          SEASON
        </button>
      </div>
      {type === 'Race' && <RaceResults ratio={ratio} removeNumbers={removeNumbers} customSeriesImage={customSeriesImage} customHeader={customHeader} configSection={configSection} />}
      {type === 'Season' && <SeasonResults ratio={ratio} removeNumbers={removeNumbers} customSeriesImage={customSeriesImage} customHeader={customHeader} configSection={configSection} />}
    </div>
  )
}

export default App