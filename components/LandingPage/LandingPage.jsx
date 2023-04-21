import styles from "./styles.module.css";

const LandingPage = () => {
  return (
    <div className={styles.LandingPage}>
      <header className={styles.Header}>
        <p className={styles.CompanyName}>Company Name</p>

        <nav className={styles.NavMenu}>
          <a className={styles.HomeLink}>Home</a>

          <a className={styles.AboutLink}>About us</a>

          <a className={styles.ContactLink}>Contact</a>

          <button className={styles.SignInButton}>
            <button className={styles.ButtonText}>Sign in</button>
          </button>
        </nav>
      </header>

      <footer className={styles.Footer}>
        <div className={styles.AddressDetails}>
          <p className={styles.LegalName}>Company Name Ltd.</p>

          <p className={styles.Street}>Street name 123, City</p>
        </div>

        <nav className={styles.SocialMediaNav}>
          <div className={styles.TwitterLogo}></div>

          <div className={styles.FacebookLogo}></div>

          <a className={styles.LinkedinLogo}></a>
        </nav>
      </footer>
    </div>
  );
};

export default LandingPage;
