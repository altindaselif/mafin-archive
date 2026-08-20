import styles from "./SearchInput.module.css";

export default function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className={styles.wrap}>
      <svg className={styles.icon} width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
        <circle cx="6.5" cy="6.5" r="5" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        className={styles.input}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
    </div>
  );
}
