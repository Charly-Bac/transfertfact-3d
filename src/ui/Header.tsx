// Header blanc repris du site transfertfact.fr, avec la mention « concept 3D ».

const MENU = [
  { label: "Accueil", href: "https://www.transfertfact.fr/", current: true },
  { label: "Dématérialisation", href: "https://www.transfertfact.fr/recuperation-automatique-factures/" },
  { label: "Souscrire", href: "https://www.transfertfact.fr/tarifs/" },
  { label: "Contact", href: "https://www.transfertfact.fr/contact/" },
  { label: "Démo", href: "https://www.si-expertise.fr/webinars/" },
  { label: "transfertBANQUE", href: "https://www.transfertbanque.fr" },
  { label: "transfertCAISSE", href: "https://www.transfertcaisse.fr" },
];

export function Header() {
  return (
    <header className="top">
      <a className="logo" href="https://www.transfertfact.fr/" target="_blank" rel="noopener" aria-label="transfertFACT, site officiel">
        <svg viewBox="0 0 26 26" aria-hidden="true">
          <rect width="26" height="26" rx="6" fill="#4aac35" />
          <path d="M8 6h7l4 4v10H8z" fill="#fff" />
          <path d="M15 6v4h4" fill="#d7efd1" />
          <rect x="10.5" y="13" width="6" height="1.6" fill="#4aac35" />
          <rect x="10.5" y="16" width="4" height="1.6" fill="#4ebbb7" />
        </svg>
        <span>
          transfert<b>FACT</b>
        </span>
        <small>concept 3D</small>
      </a>
      <nav className="menu" aria-label="Menu du site">
        {MENU.map((m) => (
          <a key={m.label} className={m.current ? "on" : undefined} href={m.href} target="_blank" rel="noopener">
            {m.label}
          </a>
        ))}
        <a href="https://app.transfertfact.fr" target="_blank" rel="noopener">
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 5V3.6a3 3 0 0 1 6 0V5h.6c.5 0 .9.4.9.9v4.7c0 .5-.4.9-.9.9H2.4a.9.9 0 0 1-.9-.9V5.9c0-.5.4-.9.9-.9zm1.4 0h3.2V3.6a1.6 1.6 0 0 0-3.2 0z" />
          </svg>
          Application
        </a>
      </nav>
    </header>
  );
}
