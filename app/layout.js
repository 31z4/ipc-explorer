export const dynamic = 'error';

export const metadata = {
  title: "IPC Explorer",
  description: "Browse IPC subnets",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
