import './global.css';

export const metadata = {
  title: 'Project Bio-Tesseract — Astronaut Bio-Telemetry & Deep Space Mission Monitor',
  description: 'A simulated astronaut health and life-support mission dashboard for demonstration purposes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💠</text></svg>" />
      </head>
      <body>
        <div className="app-layout">
          {children}
        </div>
      </body>
    </html>
  );
}
