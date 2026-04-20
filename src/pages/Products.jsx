import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts, getCategories, getSubcategories, createProduct, deleteProduct } from '../api/axiosConfig';
import ProductCard from '../components/ProductCard';
import { Button, Input, Card, SearchBar, Skeleton } from '../components/ui';
import styles from './Products.module.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [skip, setSkip] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', subcategory_id: '' });
  const [saving, setSaving] = useState(false);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const limit = 12;

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [productsData, categoriesData, subcategoriesData] = await Promise.all([
        getProducts(skip, limit),
        getCategories(),
        getSubcategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setSubcategories(subcategoriesData);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [skip]);

  useEffect(() => {
    if (searchQuery) {
      const searchProducts = async () => {
        setLoading(true);
        try {
          const allProducts = await getProducts(0, 100);
          const filtered = allProducts.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setProducts(filtered);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      searchProducts();
    } else {
      fetchData();
    }
  }, [searchQuery]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.subcategory_id) return;
    
    setSaving(true);
    try {
      await createProduct({
        name: newProduct.name.trim(),
        description: newProduct.description.trim() || null,
        subcategory_id: parseInt(newProduct.subcategory_id),
      });
      setNewProduct({ name: '', description: '', subcategory_id: '' });
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    
    try {
      await deleteProduct(id);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete product');
    }
  };

  const handlePrev = () => {
    if (skip >= limit) setSkip(skip - limit);
  };

  const handleNext = () => {
    if (products.length === limit) setSkip(skip + limit);
  };

  const getSubcategoryName = (subcategoryId) => {
    const sub = subcategories.find(s => s.id === subcategoryId);
    return sub?.name || 'Unknown';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>Manage your product catalog</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Product
        </Button>
      </div>

      {error && (
        <div className={styles.error}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
          <button onClick={() => setError('')} className={styles.errorClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {showAddForm && (
        <Card className={styles.formCard}>
          <div className={styles.formHeader}>
            <h3>New Product</h3>
            <button onClick={() => { setShowAddForm(false); setNewProduct({ name: '', description: '', subcategory_id: '' }); }} className={styles.formClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <form onSubmit={handleAddProduct}>
            <Input
              label="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="Enter product name"
              required
            />
            <Input
              label="Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              placeholder="Enter product description"
            />
            <div className={styles.field}>
              <label className={styles.label}>Subcategory</label>
              <select
                value={newProduct.subcategory_id}
                onChange={(e) => setNewProduct({ ...newProduct, subcategory_id: e.target.value })}
                className={styles.select}
                required
              >
                <option value="">Select subcategory</option>
                {subcategories.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formActions}>
              <Button type="submit" loading={saving}>Save Product</Button>
              <Button variant="secondary" onClick={() => { setShowAddForm(false); setNewProduct({ name: '', description: '', subcategory_id: '' }); }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className={styles.grid}>
          {Array(8).fill(0).map((_, i) => (
            <Card key={i} className={styles.skeletonCard}>
              <Skeleton variant="rect" height="160px" className={styles.skeletonImage} />
              <div className={styles.skeletonContent}>
                <Skeleton height="20px" width="80%" />
                <Skeleton height="16px" width="60%" />
                <Skeleton height="24px" width="40%" />
              </div>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className={styles.empty}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
          <h3>No products found</h3>
          <p>Get started by adding your first product</p>
          <Button onClick={() => setShowAddForm(true)}>Add Product</Button>
        </Card>
      ) : (
        <>
          <div className={styles.grid}>
            {products.map((product, index) => (
              <div key={product.id} style={{ animationDelay: `${index * 50}ms` }} className={styles.cardWrapper}>
                <ProductCard 
                  product={product} 
                  onDelete={handleDeleteProduct}
                />
              </div>
            ))}
          </div>

          {products.length >= limit && (
            <div className={styles.pagination}>
              <Button variant="secondary" onClick={handlePrev} disabled={skip === 0}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Previous
              </Button>
              <span className={styles.pageInfo}>Page {Math.floor(skip / limit) + 1}</span>
              <Button variant="secondary" onClick={handleNext} disabled={products.length < limit}>
                Next
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;