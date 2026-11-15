import './global.css';
import { ThemeProvider } from '../components/theme/ThemeProvider';

const themeBootstrap = `try { var stored = localStorage.getItem('bio-tesseract-theme'); var theme = stored === 'light' || stored === 'dark' ? stored : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.dataset.theme = theme; } catch (error) { document.documentElement.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }`;

export const metadata = {
  title: 'Project Bio-Tesseract — Astronaut Bio-Telemetry & Deep Space Mission Monitor',
  description: 'A simulated astronaut health and life-support mission dashboard for demonstration purposes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💠</text></svg>" />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <ThemeProvider>
          <div className="app-layout">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
