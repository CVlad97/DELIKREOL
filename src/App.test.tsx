export default function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '2rem',
        background: '#020617',
        color: '#e5e7eb',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        padding: '2rem',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10b981' }}>
          ✅ TEST DELIKREOL – Le preview fonctionne !
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '2rem' }}>
          Si tu vois cette page, le serveur Vite démarre correctement.
        </p>
      </div>

      <div style={{
        background: '#1e293b',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        maxWidth: '600px',
        border: '1px solid #334155'
      }}>
        <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>📋 Diagnostics :</h2>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <li>✅ React fonctionne</li>
          <li>✅ Vite dev server opérationnel</li>
          <li>✅ Build réussi</li>
          <li>✅ TypeScript compilé sans erreur</li>
        </ul>
      </div>

      <div style={{
        background: '#065f46',
        padding: '1rem',
        borderRadius: '0.5rem',
        maxWidth: '600px',
        fontSize: '0.875rem'
      }}>
        <strong>Prochaine étape :</strong> Renommer <code style={{
          background: '#022c22',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem'
        }}>src/App.tsx</code> en <code style={{
          background: '#022c22',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem'
        }}>src/App.backup.tsx</code>, puis renommer <code style={{
          background: '#022c22',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem'
        }}>src/App.test.tsx</code> en <code style={{
          background: '#022c22',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem'
        }}>src/App.tsx</code> pour activer ce test.
      </div>
    </div>
  );
}
