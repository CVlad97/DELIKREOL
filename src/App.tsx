import { ErrorBoundary } from './components/ErrorBoundary';
import { PublicHomePage } from './pages/PublicHomePage';

function App() {
  return (
    <ErrorBoundary>
      <PublicHomePage />
    </ErrorBoundary>
  );
}

export default App;
