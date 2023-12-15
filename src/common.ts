import { RaceCertificateData } from "./certificate"
import { Ratio } from "./config"
import { SeasonCertificateData } from "./seasonCertificate"

export const setPosition = (data: SeasonCertificateData | RaceCertificateData | null,
    setSeriesLogo: React.Dispatch<React.SetStateAction<boolean>>,
    setPositionText: React.Dispatch<React.SetStateAction<string | undefined>>,
    customHeader: string) => {

    if (data) {
      setSeriesLogo(true)
  
      if (customHeader.length > 0) {
        setPositionText(customHeader)
      } else {
        const result = data.Position.toString()
  
      let suffix = ''
  
      switch (result.charAt(result.length - 1)) {
        case '1':
          suffix = 'st'
          break
        case '2':
          suffix = 'nd'
          break
        case '3':
          suffix = 'rd'
          break
        default:
          suffix = 'th'
      }
  
      // "teen" number
      if (result.substring(result.length - 2, result.length - 1) === '1') {
        suffix = 'th'
      }
  
      setPositionText(result + suffix)
      }
    }
}

export const carText = (Class: string, CarName: string): React.ReactNode => {
  if (Class === CarName) {
    return Class
  } else {
    return `${Class} | ${CarName}`
  }
}

export const modifyDriverName = (Driver: string, removeNumbers: boolean): React.ReactNode => {
  if (removeNumbers) {
    for (let i = Driver.length - 1; i >= 0; i--) {
      if (/\d/.test(Driver[i])) {
        Driver = Driver.slice(0, i)
      } else {
        return Driver
      }
    }
    return 'Your name is all numbers? That is cool!'
  } else {
    return Driver
  }
}

export interface ResultsProps {
  ratio: Ratio
  removeNumbers: boolean
  configSection: React.ReactNode
  customSeriesImage: string | undefined
  customHeader: string
}