import { createHash } from 'crypto'
import * as https from 'https'

type iRacingAPICookie = {
  cookie: string
  expiration: Date
}

export const getiRacingCookie = async (): Promise<string | null> => {
  let apiCookie

  const iRacingAPICookieString = localStorage.getItem('iRacingAPICookie')

  if (iRacingAPICookieString) {
    apiCookie = JSON.parse(iRacingAPICookieString) as iRacingAPICookie
  }

  if (!apiCookie || !apiCookie.cookie || !(new Date(apiCookie.expiration) > new Date())) {
    console.log('no cookie or is expired')

    return null
  } else {
    console.log('Using existing stored cookie')

    return apiCookie.cookie
  }
}

export const getNewiRacingCookie = async (iRacingUsername: string, iRacingPassword: string): Promise<string | null> => {
  let apiCookie

  const iRacingAPICookieString = localStorage.getItem('iRacingAPICookie')

  if (iRacingAPICookieString) {
    apiCookie = JSON.parse(iRacingAPICookieString) as iRacingAPICookie
  }

  if (!apiCookie || !apiCookie.cookie || !(new Date(apiCookie.expiration) > new Date())) {
    console.log('no cookie or is expired')

    const hash = createHash('sha256').update(`${iRacingPassword}${iRacingUsername.toLowerCase()}`).digest()
    const base64AuthString = Buffer.from(hash).toString('base64')

    const result = await post('https://members-ng.iracing.com/auth', { 'email': iRacingUsername, 'password': base64AuthString })
    if (JSON.parse(result).authcode) {
      const authCookie = getAuthCookie(JSON.parse(result).authcode, iRacingUsername)

      // store base64 encoded as the authCookie is a json object and will otherwise be annoying to store in a json object
      const expiration = new Date(new Date().setMinutes(new Date().getMinutes() + 55))
      localStorage.setItem('iRacingAPICookie',  `{"cookie": "${Buffer.from(authCookie, 'utf-8').toString('base64')}", "expiration": "${expiration}"}`)
      console.log('Updated cookie')

      return authCookie
    } else {
      return null
    }
  } else {
    console.log('Using existing stored cookie')

    return apiCookie.cookie
  }
}

export const getAuthCookie = (token: string, username: string): string => {
  const iRacingCredentialsFormattedObject = {
    'authtoken': {
      'authcode': token,
      'email': username
    }
  }

  return `authtoken_members=${JSON.stringify(iRacingCredentialsFormattedObject)}`
}

export const post = (url: string, data: Object): Promise<string> => {
  const dataString = JSON.stringify(data)

  const options: https.RequestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length,
    },
    timeout: 5000
  }

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      if (res.statusCode && (res.statusCode < 200 || res.statusCode > 299)) {
        return reject(new Error(`HTTP status code ${res.statusCode}.`))
      }

      if (res.headers['x-ratelimit-remaining']) {
        console.log('x-ratelimit-remaining', res.headers['x-ratelimit-remaining'])
      }

      const body = [] as any
      res.on('data', (chunk) => body.push(chunk))
      res.on('end', () => {
        resolve(Buffer.concat(body).toString())
      })
    })

    req.on('error', (err) => {
      reject(err)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timed out.'))
    })

    req.write(dataString)
    req.end()
  })
}

export interface ApiResponse {
  Success: boolean
  Body: any
}

export const get = (url: string, authCookie: string): Promise<ApiResponse> => {
  const options: https.RequestOptions = {
    timeout: 5000,
    headers: {
      'Cookie': authCookie
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.get(url, options, (res) => {
      if (res.statusCode && (res.statusCode < 200 || res.statusCode > 299)) {
        return reject(new Error(`HTTP status code ${res.statusCode}.`))
      }

      if (res.headers['x-ratelimit-remaining']) {
        console.log('x-ratelimit-remaining', res.headers['x-ratelimit-remaining'])
      }

      const body = [] as any
      res.on('data', (chunk) => body.push(chunk))
      res.on('end', () => {
        resolve(Buffer.concat(body).toString())
      })
    }).on('error', (err) => {
      reject(err)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timed out.'))
    })
  }).then((Body) => {
    return {
      Success: true,
      Body
    } as ApiResponse
  }).catch((Body) => {
    return {
      Success: false,
      Body
    } as ApiResponse
  })
}


export const getSpecialEventLogo = (specialEventName: string, currentLogo?: string ): string | null => {
  switch (specialEventName.trimEnd()) {
    case '2022 10 Hours of Suzuka Powered by VCO':
      return 'iRSE_SUZUKA_10HR_2022_LOGO.png'
    case '2023 12 Hours of Sebring Presented by VCO':
      return 'iRSE_SEBRING_12_2023_VCO.png'
    case '2022 12 Hours of Sebring Powered by Heusinkveld':
      return 'iRSE_SEBRING_12_2022_LOGO.png'
    case '2022 24 Hours of Nurburgring Powered by VCO':
      return 'iRSE_NÜRBURGRING_24_2022_LOGO.png'
    case '2022 6 Hours of the Glen':
      return 'iRSE_WATKINS_GLEN_6HR_2022_LOGO.png'
    case '2022 Bathurst 1000 AU':
      return 'iRSE_BATHURST_1000_AU_2022_LOGO.png'
    case '2022 Bathurst 1000 US':
      return 'iRSE_BATHURST_1000_2022_LOGO.png'
    case '2023 Bathurst 12 Hour':
      return 'iRSE_BATHURST_12.png'
    case '2022 Bathurst 12 Hour':
      return 'iRSE_BATHURST_12_2022_LOGO.png'
    case '2022 Crandon Championship':
      return 'iRSE_CRANDON_PRO4_CHAMPIONSHIP_2022_LOGO.png'
    case '2023 24 Hours of Daytona Powered by VCO':
      return 'iRSE_DAYTONA_24_2023_VCO.png'
    case '2022 24 Hours of Daytona':
      return 'iRSE_DAYTONA_24_2022_LOGO.png'
    case '2022 iRacing Chili Bowl Nationals':
      return 'iRSE_CHILI_BOWL_2022_LOGO.png'
    case '2022 iRacing Knoxville Nationals':
      return 'iRSE_KNOXVILLE_NATIONALS_2022_LOGO.png'
    case '2022 iRacing.com Indy 500':
      return 'iRSE_INDY_500_2022_LOGO.png'
    case '2022 iRacing.com Indy 500 - Fixed':
      return 'iRSE_INDY_500_FIXED_2022_LOGO.png'
    case '2022 Petit Le Mans Powered by VCO':
      return 'iRSE_PETIT_LE_MANS_2022_LOGO.png'
    case '2023 Road America 500':
      return 'iRSE_ROAD_AMERICA_500.png'
    case 'iRacing 24 hours of Spa Powered by Heusinkveld- 2022':
      return 'iRSE_SPA_24_2022_LOGO.png'
    case 'Falken Tyre 24 hours of Spa - 2023':
      return 'iRSE_FALKEN_TIRE_SPA_24HR.png'
    case 'Roar Before the 24 - 2023':
      return 'iRSE_ROAR_2023_LOGO.png'
    case 'Roar Before the 24 - 2022':
      return 'iRSE_ROAR_2022_LOGO.png'
    case 'Winter Derby Presented by iRacing - 2022':
      return 'iRSE_WINTER_DERBY_2022_LOGO.png'
    case 'Winter Derby Fixed Presented by iRacing - 2022':
      return 'iRSE_WINTER_DERBY_2022_LOGO.png'
    case '2022 Peachtree Three benefiting the National MS Society':
      return 'iRSE_NMS_PEACHTREE_THREE_2022.png'
    case '2023 24 Hours of Nurburgring Presented by iRacing':
      return 'iRSE_NÜRBURGRING_24H.png'
    default:
      return currentLogo || null
  }
}