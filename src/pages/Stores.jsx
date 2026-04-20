import { useState, useEffect } from 'react';
import { getStores, createStore, deleteStore } from '../api/axiosConfig';

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', location: '' });
  const [saving, setSaving] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStores();
      setStores(data);
    } catch (err) {
      setError('Failed to load stores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleAddStore = async (e) => {
    e.preventDefault();
    if (!newStore.name.trim()) return;
    
    setSaving(true);
    try {
      await createStore({
        name: newStore.name.trim(),
        location: newStore.location.trim() || null,
      });
      setNewStore({ name: '', location: '' });
      setShowAddForm(false);
      fetchStores();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create store');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStore = async (id) => {
    if (!confirm('Delete this store? This will also delete all prices.')) return;
    
    try {
      await deleteStore(id);
      fetchStores();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete store');
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Stores</h1>
        <button onClick={() => setShowAddForm(true)} style={styles.addBtn}>
          + Store
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={() => setError('')} style={styles.errorBtn}>✕</button>
        </div>
      )}

      {showAddForm && (
        <div style={styles.formCard}>
          <h3>New Store</h3>
          <form onSubmit={handleAddStore}>
            <div style={styles.field}>
              <label>Name *</label>
              <input
                type="text"
                value={newStore.name}
                onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.field}>
              <label>Location</label>
              <input
                type="text"
                value={newStore.location}
                onChange={(e) => setNewStore({ ...newStore, location: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.formActions}>
              <button type="submit" style={styles.saveBtn} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setNewStore({ name: '', location: '' }); }}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.grid}>
        {stores.length === 0 ? (
          <div style={styles.empty}>No stores. Create one!</div>
        ) : (
          stores.map((store) => (
            <div key={store.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3>{store.name}</h3>
                <button onClick={() => handleDeleteStore(store.id)} style={styles.deleteBtn}>
                  Delete
                </button>
              </div>
              <p style={styles.location}>{store.location || 'No location'}</p>
              <p style={styles.id}>ID: {store.id}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { color: '#2c3e50' },
  loading: { padding: '2rem', textAlign: 'center' },
  error: { backgroundColor: '#e74c3c', color: 'white', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' },
  errorBtn: { background: 'none', border: 'none', color: 'white', cursor: 'pointer' },
  addBtn: { padding: '0.5rem 1rem', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  formCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  field: { marginBottom: '1rem' },
  input: { padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', width: '100%', fontSize: '1rem' },
  formActions: { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
  saveBtn: { padding: '0.5rem 1rem', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  cancelBtn: { padding: '0.5rem 1rem', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
  card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  location: { color: '#7f8c8d', marginBottom: '0.5rem' },
  id: { color: '#bdc3c7', fontSize: '0.875rem' },
  deleteBtn: { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' },
  empty: { gridColumn: '1 / -1', textAlign: 'center', color: '#7f8c8d', padding: '2rem' },
};

export default Stores;