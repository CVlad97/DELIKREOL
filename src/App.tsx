import { ErrorBoundary } from './components/ErrorBoundary';
import { LaunchNetworkPage } from './pages/LaunchNetworkPage';

function App() {
  return (
    <ErrorBoundary>
      <LaunchNetworkPage />
    </ErrorBoundary>
  );
}

export default App;
