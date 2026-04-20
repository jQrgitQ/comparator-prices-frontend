import { useState, useEffect } from 'react';
import { getCategories, getSubcategories, createCategory, deleteCategory, createSubcategory, deleteSubcategory, deleteProduct, deleteStore } from '../api/axiosConfig';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [cats, subs] = await Promise.all([
        getCategories(),
        getSubcategories(),
      ]);
      setCategories(cats);
      setSubcategories(subs);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    setSaving(true);
    try {
      await createCategory({ name: newCategoryName.trim() });
      setNewCategoryName('');
      setShowAddCategory(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    
    try {
      await deleteCategory(id);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete category');
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    if (!newSubcategoryName.trim() || !selectedCategory) return;
    
    setSaving(true);
    try {
      await createSubcategory({ 
        name: newSubcategoryName.trim(), 
        category_id: selectedCategory 
      });
      setNewSubcategoryName('');
      setShowAddSubcategory(false);
      setSelectedCategory(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create subcategory');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubcategory = async (id) => {
    if (!confirm('Delete this subcategory?')) return;
    
    try {
      await deleteSubcategory(id);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete subcategory');
    }
  };

  const getSubcatsByCategory = (categoryId) => {
    return subcategories.filter(s => s.category_id === categoryId);
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Categories</h1>
        <button 
          onClick={() => setShowAddCategory(true)}
          style={styles.addBtn}
        >
          + Category
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={() => setError('')} style={styles.errorBtn}>✕</button>
        </div>
      )}

      {/* Add Category Form */}
      {showAddCategory && (
        <form onSubmit={handleAddCategory} style={styles.formCard}>
          <h3>New Category</h3>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name"
            style={styles.input}
            required
          />
          <div style={styles.formActions}>
            <button type="submit" style={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button 
              type="button" 
              onClick={() => { setShowAddCategory(false); setNewCategoryName(''); }}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      <div style={styles.grid}>
        {categories.length === 0 ? (
          <div style={styles.empty}>No categories. Create one!</div>
        ) : (
          categories.map((category) => (
            <div key={category.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.categoryName}>{category.name}</h3>
                <div style={styles.cardActions}>
                  <button 
                    onClick={() => { setSelectedCategory(category.id); setShowAddSubcategory(true); }}
                    style={styles.smallBtn}
                    title="Add subcategory"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(category.id)}
                    style={styles.deleteBtn}
                    title="Delete category"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div style={styles.subcats}>
                {getSubcatsByCategory(category.id).length === 0 ? (
                  <p style={styles.noSubcats}>No subcategories</p>
                ) : (
                  getSubcatsByCategory(category.id).map(sub => (
                    <div key={sub.id} style={styles.subcatItem}>
                      <span>{sub.name}</span>
                      <button 
                        onClick={() => handleDeleteSubcategory(sub.id)}
                        style={styles.subcatDelete}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Subcategory Modal */}
      {showAddSubcategory && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Add Subcategory</h3>
            <p style={styles.modalSubtitle}>
              to: {categories.find(c => c.id === selectedCategory)?.name}
            </p>
            <form onSubmit={handleAddSubcategory}>
              <input
                type="text"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                placeholder="Subcategory name"
                style={styles.input}
                required
              />
              <div style={styles.formActions}>
                <button type="submit" style={styles.saveBtn} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowAddSubcategory(false); setNewSubcategoryName(''); }}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { color: '#2c3e50' },
  loading: { padding: '2rem', textAlign: 'center' },
  error: { backgroundColor: '#e74c3c', color: 'white', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' },
  errorBtn: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1rem' },
  addBtn: { padding: '0.5rem 1rem', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  formCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  formActions: { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
  input: { padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', width: '100%', fontSize: '1rem' },
  saveBtn: { padding: '0.5rem 1rem', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  cancelBtn: { padding: '0.5rem 1rem', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
  card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  categoryName: { margin: 0, color: '#2c3e50' },
  cardActions: { display: 'flex', gap: '0.5rem' },
  smallBtn: { width: '28px', height: '28px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' },
  deleteBtn: { width: '28px', height: '28px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' },
  subcats: { marginTop: '0.5rem' },
  noSubcats: { color: '#7f8c8d', fontSize: '0.875rem', fontStyle: 'italic' },
  subcatItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #eee' },
  subcatDelete: { background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '0.875rem' },
  empty: { gridColumn: '1 / -1', textAlign: 'center', color: '#7f8c8d', padding: '2rem' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px' },
  modalSubtitle: { color: '#7f8c8d', marginBottom: '1rem' },
};

export default Categories;