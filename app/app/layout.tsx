import './globals.css';
import VersionDisplay from './components/VersionDisplay';

export const metadata = {
  title: "Looma.sh",
  description: "Vehicle-to-Vehicle Realtime Communication Network"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <VersionDisplay />
      </body>
    </html>
  );
}
