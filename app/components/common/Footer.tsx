import React, { ReactNode } from "react";
import styles from "../../styles/Footer.module.css";

interface FooterProps {
  children: ReactNode;
}

const Footer: React.FC<FooterProps> = ({ children }) => (
  <footer className={styles.footer}>{children}</footer>
);

export default Footer;
