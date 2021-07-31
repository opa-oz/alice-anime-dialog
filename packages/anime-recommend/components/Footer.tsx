import styles from '../styles/Footer.module.scss';

export default function Footer() {
    return <footer className={styles.footer}>
        <div>
            <div className={styles.logo}>Аниме рекомендации</div>
            <div>
                <ul className={styles.links}>
                    <li>
                        <a href="/license" className={styles.link}>Лицензионное соглашение</a>
                    </li>
                    <li>
                        <a href="/policity" className={styles.link}>Политика конфиденциальности</a>
                    </li>
                </ul>
            </div>
            <div className={styles.copyright}>
                &copy; Аниме рекомендации {new Date().getFullYear()}
            </div>
        </div>
        <div>
            <div className={styles.group}>
                <div className={styles.groupHeader}>Категории</div>
                <div>
                    <ul className={styles.groupList}>
                        <li className={styles.groupLink}>ТОПы</li>
                        <li className={styles.groupLink}>Сезоны</li>
                        <li className={styles.groupLink}>Года</li>
                        <li className={styles.groupLink}>Страны</li>
                    </ul>
                </div>
            </div>
        </div>
        <div>
            <div className={styles.group}>
                <div className={styles.groupHeader}>Поддержка</div>
                <div>
                    <ul className={styles.groupList}>
                        <li className={styles.groupLink}>
                            <a href="mailto:opaozhub@gmail.com">support@anime-recommend.ru</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </footer>
}
