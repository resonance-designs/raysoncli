import type { ReactNode } from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '../docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const commands = [
  {
    title: 'finance export',
    description: 'Export shopping history data to CSV for spreadsheet workflows.'
  },
  {
    title: 'finance smartsheet',
    description: 'Generate Smartsheet-friendly export columns for easier sorting/filtering.'
  },
  {
    title: 'wsl startup',
    description: 'Run your WSL startup automation flow from one CLI command.'
  },
  {
    title: 'mongo ssl-setup',
    description: 'Run MongoDB SSL setup automation through RaySon.'
  }
];

const stack = [
  { name: 'Go', category: 'Core CLI' },
  { name: 'PowerShell', category: 'Automation' },
  { name: 'Bash', category: 'Automation' },
  { name: 'Node.js', category: 'Tooling' },
  { name: 'Docusaurus', category: 'Docs' },
  { name: 'GitHub Actions', category: 'CI/CD' }
];

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const introUrl = useBaseUrl('/docs/intro');
  const commandsUrl = useBaseUrl('/docs/commands');
  const readmeUrl = useBaseUrl('/docs/repo-readme');

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>
          Script-driven automation with a path to native Go commands.
        </p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a className="button button--secondary button--lg" href={introUrl}>
            Start Docs
          </a>
          <a className="button button--secondary button--lg" href={commandsUrl}>
            View Commands
          </a>
          <a className="button button--secondary button--lg" href={readmeUrl}>
            Full README
          </a>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="RaySon CLI"
      description="Go CLI for script-driven automation, release workflows, and maintainable developer tooling."
    >
      <HomepageHeader />

      <section className={styles.stats}>
        <div className="container">
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>Go</div>
              <div className={styles.statLabel}>CLI Core</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>Windows</div>
              <div className={styles.statLabel}>Primary Target</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>4</div>
              <div className={styles.statLabel}>Primary Commands</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>1</div>
              <div className={styles.statLabel}>Unified Entry Point</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.projectShowcase}>
        <div className="container">
          <h2 className={styles.sectionTitle}>What RaySon Does Today</h2>
          <div className={styles.projectGrid}>
            {commands.map((command) => (
              <article className={styles.projectCard} key={command.title}>
                <h3 className={styles.projectTitle}>{command.title}</h3>
                <p className={styles.projectDescription}>{command.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.techStack}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Tooling Stack</h2>
          <div className={styles.techGrid}>
            {stack.map((item) => (
              <div className={styles.techItem} key={item.name}>
                <span className={styles.techName}>{item.name}</span>
                <span className={styles.techCategory}>{item.category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
