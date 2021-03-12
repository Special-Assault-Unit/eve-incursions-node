import '../styles/globals.scss';
import {AppProps} from 'next/app';
import React, {useEffect} from 'react';
import Link from 'next/link';
import Head from 'next/head';
import {ThemeToggle} from '../components/theme-toggle/theme-toggle';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';


function MyApp({Component, pageProps}: AppProps) {
  useEffect(() => {
    if('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js').catch();
    }
  }, []);

  return (
    <>
      <Head>
        <title>EVE Incursions</title>
      </Head>
      <div id="app">
        <Navbar variant={'dark'} className="bg-dark" expand={'md'}>

          <Container>
            <Navbar.Toggle/>
            <Navbar.Brand><img src="/images/logo.svg" className={'logo'} alt={'EVE Incursions'}/> EVE-Incursions</Navbar.Brand>

            <Navbar.Collapse id="responsive-navbar-nav">
              <ul className="navbar-nav mr-auto">
                <li className="nav-item">
                  <Link href="/"><a className="nav-link">Status</a></Link>
                </li>
                <li className="nav-item">
                  <Link href="/history"><a className="nav-link">History</a></Link>
                </li>
                <li className="nav-item">
                  <Link href="/communities"><a className="nav-link">Communities</a></Link>
                </li>
                <li className="nav-item">
                  <Link href="/about"><a className="nav-link">About</a></Link>
                </li>
              </ul>
              <ThemeToggle/>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <div className="container main-container">
          <Component {...pageProps} />
        </div>
        <footer className="footer">
          <div className="container">
            <p className="text-muted">EVE Online, the EVE logo, EVE and all associated logos and designs are the intellectual property of CCP hf. All artwork,
              screenshots, characters, vehicles, storylines, world facts or other recognizable features of the intellectual property relating to these
              trademarks
              are likewise the intellectual property of CCP hf. EVE Online and the EVE logo are the registered trademarks of CCP hf. All rights are reserved
              worldwide. All other trademarks are the property of their respective owners. CCP hf. has granted permission to shadowlauch.de to use EVE Online
              and
              all associated logos and designs for promotional and information purposes on its website but does not endorse, and is not in any way affiliated
              with,
              incursions.shadowlauch.de. CCP is in no way responsible for the content on or functioning of this website, nor can it be liable for any damage
              arising
              from the use of this website.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default MyApp;
