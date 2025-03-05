import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self' https://dapi.kakao.com https://t1.daumcdn.net https://openweathermap.org; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dapi.kakao.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://t1.daumcdn.net https://openweathermap.org; connect-src 'self' https://dapi.kakao.com https://api.openweathermap.org;"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 