import { useEffect } from 'react';

export function AdminOperations() {
  useEffect(() => { document.title = 'Opérations — Admin DeliKreol'; }, []);
  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Opérations</h1>
      <p className="text-muted-foreground">Module opérations en cours de développement.</p>
    </div>
  );
}
export default AdminOperations;
