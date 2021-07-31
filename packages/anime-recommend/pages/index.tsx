import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/App.module.scss'
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Сайт аниме рекомендаций"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <Header/>
            <main className={styles.main}>

            </main>

            <Footer/>
        </div>
    )
}
