import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Nav from './components/Nav';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TaFlo - Advanced Task Management',
  description: 'Your futuristic task companion with categories, priorities, time tracking, and more',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TaFlo',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TaFlo" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes auroraFloat {
              0% { transform: translate(-20px, -10px) rotate(0deg); }
              100% { transform: translate(20px, 10px) rotate(360deg); }
            }
            .glass-card {
              background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
              border: 1px solid rgba(255,255,255,0.08);
              border-radius: 16px;
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
            }
            .gradient-text {
              background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #34d399 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .btn-neon {
              background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
              border: 1px solid rgba(59, 130, 246, 0.3);
              color: #60a5fa;
              padding: 0.5rem 1rem;
              border-radius: 8px;
              transition: all 0.2s ease;
            }
            .btn-neon:hover {
              background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
              border-color: rgba(59, 130, 246, 0.5);
              transform: translateY(-1px);
            }
            .input {
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              color: #f1f5f9;
              padding: 0.75rem;
              border-radius: 8px;
              width: 100%;
            }
            .input:focus {
              outline: none;
              border-color: rgba(59, 130, 246, 0.5);
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
          `
        }} />
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0f172a 50%, #0a0a0a 100%)',
          color: '#f1f5f9',
          minHeight: '100vh'
        }}
      >
        {/* animated background */}
        <div 
          className="aurora" 
          style={{
            position: 'fixed',
            top: '-50%',
            left: '-50%',
            right: '-50%',
            bottom: '-50%',
            pointerEvents: 'none',
            filter: 'blur(20px)',
            background: `
              radial-gradient(400px circle at 20% 20%, rgba(59, 130, 246, 0.08), transparent 50%),
              radial-gradient(400px circle at 80% 30%, rgba(139, 92, 246, 0.06), transparent 50%),
              radial-gradient(400px circle at 30% 80%, rgba(34, 197, 94, 0.04), transparent 50%)
            `,
            animation: 'auroraFloat 30s ease-in-out infinite alternate',
            zIndex: -3,
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
        />
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        <Nav />
        <main>{children}</main>
        
        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
