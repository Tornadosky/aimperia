
import React from 'react';
import Link from 'next/link';
import styles from './styles.module.css';


const HeaderLogo = () => {
    return (
        <div className={styles.logo}>
            <img
                src="/logo.svg"
                alt="Logo"
                className={styles.logoImage}
            />
            <Link href="/">AImperia</Link>
        </div>
    );
}

export default HeaderLogo;