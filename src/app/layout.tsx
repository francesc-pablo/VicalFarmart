import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Vical Farmart',
  description: 'Connecting farmers and buyers for fresh agricultural produce.',
  icons: "https://res.cloudinary.com/ddvlexmvj/image/upload/v1751434079/VF_logo-removebg-preview_kgzusq.png",
};

const MissingEnvError = () => (
  <html lang="en">
    <head>
       <title>Configuration Error - Vical Farmart</title>
       <style>{`
          body { font-family: sans-serif; background-color: #fff1f1; color: #7f1d1d; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .container { text-align: center; max-width: 600px; padding: 2rem; border: 1px solid #fca5a5; border-radius: 8px; background-color: #fef2f2; }
          h1 { font-size: 1.5rem; color: #b91c1c; }
          code { background-color: #fee2e2; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
          ol { text-align: left; margin-top: 1rem; display: inline-block; }
          li { margin-bottom: 0.5rem; }
       `}</style>
    </head>
    <body>
       <div className="container">
          <h1>Configuration Error: Firebase Credentials Missing</h1>
          <p>The application cannot start because it's missing its connection details for Firebase.</p>
          <p>Please follow these steps to resolve the issue:</p>
          <ol>
              <li>Locate the <code>.env.local.example</code> file in your project directory.</li>
              <li>Create a copy of this file and rename it to <code>.env.local</code>.</li>
              <li>Open <code>.env.local</code> and replace the placeholders with your actual Firebase project credentials.</li>
              <li>Restart the development server for the changes to take effect.</li>
          </ol>
      </div>
    </body>
  </html>
);


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return <MissingEnvError />;
  }
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
