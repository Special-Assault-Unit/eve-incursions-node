import Document, {DocumentContext, Head, Html, Main, NextScript} from 'next/document';
import React from 'react';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    return await Document.getInitialProps(ctx)
  }

  render() {
    return (
      <Html lang={'en'}>
        <Head>
          <link rel="manifest" href="/site.webmanifest" />
          <meta name="Description" content="Get the current all the current and past incursion spawns for EVE Online. With useful information you can't get anywhere else." />
          <meta name="theme-color" content="#212529"/>
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        </Head>
        <body>
        <script dangerouslySetInnerHTML={{__html: `
          (() => {
            const setTheme = (newTheme) => {
              window.__theme = newTheme;
              preferredTheme = newTheme;
              document.body.className = newTheme;
            }
            let preferredTheme;
            try {
              preferredTheme = localStorage.getItem('theme');
            } catch (err) { }
            window.__setPreferredTheme = function(newTheme) {
              setTheme(newTheme);
              try {
                localStorage.setItem('theme', newTheme);
              } catch (err) {}
            }
            var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
            darkQuery.addListener(function(e) {
              window.__setPreferredTheme(e.matches ? 'dark' : 'light')
            });
            setTheme(preferredTheme || (darkQuery.matches ? 'dark' : 'light'));
          })();
          `}} />
        <Main />
        <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
