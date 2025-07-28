
import React from 'react';
import Link from 'next/link';
import styles from './styles.module.css';


interface HeaderLogoProps {
    imageStyle?: React.CSSProperties;
    textStyle?: React.CSSProperties;
}

const HeaderLogo = ({ imageStyle, textStyle }: HeaderLogoProps) => {
    return (
        <div className={styles.logo}>
            <img
                src="/logo.svg"
                alt="Logo"
                className={styles.logoImage}
                style={imageStyle?imageStyle:{height:'30px'}}
            />
            <Link href="/" style={textStyle ? textStyle : {fontSize:'30px'}}>AImperia</Link>
        </div>
    );
}

export default HeaderLogo;