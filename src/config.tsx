import { ChangeEvent, useEffect, useRef, useState } from "react"

export enum Ratio {
  ISO216 = 1.414, // A4, A3, A2 etc.
  sixteenbynine = 1.778, // 16:9 screen
  USLetter = 1.2941, // US Letter
  onebyone = 1, // square
  threebytwo = 1.5, // 4x6 inch print
}

export interface ConfigProps {
  ratio: Ratio
  setRatio: (ratio: Ratio) => void
  removeNumbers: boolean
  setRemoveNumbers: (removeNumbers: boolean) => void
  setSelectedFile: (file: File) => void
  customHeader: string
  setCustomHeader: (header: string) => void
}

export const Config: React.FC<ConfigProps> = ({ ratio, setRatio, removeNumbers, setRemoveNumbers, setSelectedFile, customHeader, setCustomHeader }) => {
  const inputFile = useRef<HTMLInputElement | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className={'headerInputLabel'}>
        Custom Header
      </div>
      <input type='string' value={customHeader} onChange={(e) => { setCustomHeader(e.target.value) }} className='CertInput' />
      <div className={'fileInputLabel'}>
        Custom Series Logo
      </div>
      <input type='file' id='file' accept='image/png, image/jpeg' ref={inputFile} onChange={(e) => setSelectedFile(e.target.files![0])} className='fileInput' />
      <div style={{ display: 'flex' }}>
        <div style={{ textAlign: 'left' }}>
          <div className='radio'>
            <label>
              <input type='radio' value={Ratio.ISO216} checked={ratio === Ratio.ISO216} onChange={() => setRatio(Ratio.ISO216)} />
              ISO216 (A5, A4, A3 etc. paper)
            </label>
          </div>
          <div className='radio'>
            <label>
              <input type='radio' value={Ratio.sixteenbynine} checked={ratio === Ratio.sixteenbynine} onChange={() => setRatio(Ratio.sixteenbynine)} />
              16:9 (1920x1080, 2560x1440 etc.)
            </label>
          </div>
          <div className='radio'>
            <label>
              <input type='radio' value={Ratio.onebyone} checked={ratio === Ratio.USLetter} onChange={() => setRatio(Ratio.USLetter)} />
              US Letter
            </label>
          </div>
          <div className='radio'>
            <label>
              <input type='radio' value={Ratio.onebyone} checked={ratio === Ratio.onebyone} onChange={() => setRatio(Ratio.onebyone)} />
              1:1 Square
            </label>
          </div>
          <div className='radio'>
            <label>
              <input type='radio' value={Ratio.threebytwo} checked={ratio === Ratio.threebytwo} onChange={() => setRatio(Ratio.threebytwo)} />
              3:2 (4x6 inch prints)
            </label>
          </div>
        </div>
        <div style={{ textAlign: 'left' }}>
          <div className='checkbox'>
            <label>
              <input type='checkbox' checked={removeNumbers} onChange={() => setRemoveNumbers(!removeNumbers)} />
              Remove numbers from names
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

