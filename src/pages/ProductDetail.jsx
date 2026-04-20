import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getProductPrices, getCurrentPrices, createPrice, deletePrice, getStores, getSubcategories, updateProduct, uploadImage } from '../api/axiosConfig';
import { Card, Button, Input, Badge, Skeleton } from '../components/ui';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [prices, setPrices] = useState([]);
  const [currentPrices, setCurrentPrices] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [showImageForm, setShowImageForm] = useState(false);
  const [newPrice, setNewPrice] = useState({ price: '', discount_price: '', is_discount: false, store_id: '' });
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const productData = await getProductById(id);
      setProduct(productData);

      const pricesData = await getProductPrices(id);
      setPrices(pricesData);

      try {
        const currentPricesData = await getCurrentPrices(id);
        setCurrentPrices(currentPricesData);
      } catch (e) {
        setCurrentPrices([]);
      }

      const storesData = await getStores();
      setStores(storesData);

      if (productData.subcategory_id) {
        const subcatsData = await getSubcategories();
        const subcat = subcatsData.find(s => s.id === productData.subcategory_id);
        setProduct(prev => ({ ...prev, subcategory_name: subcat?.name || 'Unknown' }));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load product';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddPrice = async (e) => {
    e.preventDefault();

    if (!newPrice.price || !newPrice.store_id) {
      setError('Price and Store are required');
      return;
    }

    setSaving(true);
    try {
      const priceData = {
        price: parseFloat(newPrice.price),
        store_id: parseInt(newPrice.store_id),
        is_discount: newPrice.is_discount || false,
      };

      if (newPrice.is_discount && newPrice.discount_price) {
        priceData.discount_price = parseFloat(newPrice.discount_price);
      }

      await createPrice(id, priceData);
      setNewPrice({ price: '', discount_price: '', is_discount: false, store_id: '' });
      setShowPriceForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add price');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePrice = async (priceId) => {
    if (!confirm('Delete this price?')) return;

    try {
      await deletePrice(id, priceId);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete price');
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    setError('');
    try {
      console.log('Uploading file:', file.name, file.size);
      const result = await uploadImage(file);
      console.log('Upload result:', result);
      const imageUrl = result.url;
      console.log('Updating product with image URL:', imageUrl);
      await updateProduct(id, { image_url: imageUrl });
      setShowImageForm(false);
      setPreviewImage(null);
      fetchData();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to upload image');
    } finally {
      setSaving(false);
    }
  };

  const handleUrlSubmit = async (url) => {
    if (!url.trim()) return;

    setSaving(true);
    try {
      await updateProduct(id, { image_url: url.trim() });
      setShowImageForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update image');
    } finally {
      setSaving(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const takePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      setSaving(true);
      stopCamera();

      try {
        const file = new File([blob], 'camera_photo.jpg', { type: 'image/jpeg' });
        const result = await uploadImage(file);
        const imageUrl = result.url;
        await updateProduct(id, { image_url: imageUrl });
        setShowImageForm(false);
        fetchData();
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to upload photo');
      } finally {
        setSaving(false);
      }
    }, 'image/jpeg');
  };

  const getStoreName = (storeId) => {
    const store = stores.find(s => s.id === storeId);
    return store?.name || 'Unknown';
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeletonCard}>
          <Skeleton variant="rect" height="300px" />
          <div className={styles.skeletonContent}>
            <Skeleton height="32px" width="60%" />
            <Skeleton height="20px" width="40%" />
            <Skeleton height="24px" width="30%" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link to="/products" className={styles.backLink}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to Products
      </Link>

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

      <div className={styles.grid}>
        <Card className={styles.productCard}>
          <div className={styles.imageWrapper}>
            {product?.image_url ? (
              <img src={product.image_url} alt={product.name} className={styles.image} />
            ) : (
              <div className={styles.imagePlaceholder}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
            )}
            <button
              onClick={() => setShowImageForm(!showImageForm)}
              className={styles.imageEditBtn}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>

          {showImageForm && (
            <div className={styles.imageForm}>
              <div className={styles.uploadOptions}>
                <div className={styles.uploadOption}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className={styles.fileInput}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className={styles.uploadLabel}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Subir archivo
                  </label>
                </div>

                <button type="button" onClick={startCamera} className={styles.cameraBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  Tomar foto
                </button>
              </div>

              <div className={styles.urlOption}>
                <p className={styles.orText}>o usa una URL</p>
                <Input
                  placeholder="https://example.com/image.jpg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUrlSubmit(e.target.value);
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={(e) => {
                    const input = e.target.previousSibling?.querySelector('input');
                    if (input) handleUrlSubmit(input.value);
                  }}
                  loading={saving}
                >
                  Guardar URL
                </Button>
              </div>

              <Button variant="ghost" size="sm" onClick={() => setShowImageForm(false)}>
                Cancelar
              </Button>

              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          )}

          {showCamera && (
            <div className={styles.cameraModal}>
              <div className={styles.cameraContent}>
                <h3>Tomar foto del producto</h3>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className={styles.cameraVideo}
                />
                <div className={styles.cameraActions}>
                  <Button variant="secondary" onClick={stopCamera}>
                    Cancelar
                  </Button>
                  <Button onClick={takePhoto} loading={saving}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <circle cx="12" cy="12" r="10"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Capturar
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className={styles.productInfo}>
            <h1 className={styles.title}>{product?.name}</h1>
            <p className={styles.description}>{product?.description || 'No description'}</p>
            <Badge variant="default" size="sm">
              {product?.subcategory_name || 'Unknown'}
            </Badge>
          </div>

          {currentPrices.length > 0 && (
            <div className={styles.currentPrices}>
              <h3 className={styles.sectionTitle}>Current Prices</h3>
              <div className={styles.priceGrid}>
                {currentPrices.map((p) => (
                  <div key={p.id} className={styles.priceChip}>
                    <span className={styles.priceChipStore}>{getStoreName(p.store_id)}</span>
                    <span className={styles.priceChipValue}>
                      {p.is_discount && p.discount_price ? (
                        <>
                          <span className={styles.discounted}>{formatPrice(p.discount_price)}</span>
                          <span className={styles.original}>{formatPrice(p.price)}</span>
                        </>
                      ) : (
                        formatPrice(p.price)
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className={styles.pricesCard}>
          <div className={styles.pricesHeader}>
            <div>
              <h2>Price History</h2>
              <p className={styles.pricesCount}>{prices.length} prices</p>
            </div>
            <Button onClick={() => setShowPriceForm(!showPriceForm)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Price
            </Button>
          </div>

          {showPriceForm && (
            <form onSubmit={handleAddPrice} className={styles.priceForm}>
              <Input
                label="Price"
                type="number"
                step="0.01"
                min="0"
                value={newPrice.price}
                onChange={(e) => setNewPrice({ ...newPrice, price: e.target.value })}
                placeholder="0.00"
                required
              />

              <div className={styles.field}>
                <label className={styles.label}>Store</label>
                <select
                  value={newPrice.store_id}
                  onChange={(e) => setNewPrice({ ...newPrice, store_id: e.target.value })}
                  className={styles.select}
                  required
                >
                  <option value="">Select store</option>
                  {stores.map(store => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.checkbox}>
                <input
                  type="checkbox"
                  id="is_discount"
                  checked={newPrice.is_discount}
                  onChange={(e) => setNewPrice({ ...newPrice, is_discount: e.target.checked })}
                />
                <label htmlFor="is_discount">Has discount</label>
              </div>

              {newPrice.is_discount && (
                <Input
                  label="Discount Price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPrice.discount_price}
                  onChange={(e) => setNewPrice({ ...newPrice, discount_price: e.target.value })}
                  placeholder="Discount price"
                />
              )}

              <div className={styles.formActions}>
                <Button type="submit" loading={saving}>Save Price</Button>
                <Button variant="secondary" onClick={() => setShowPriceForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className={styles.priceList}>
            {prices.length === 0 ? (
              <div className={styles.empty}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <h3>No prices yet</h3>
                <p>Add a price to get started</p>
              </div>
            ) : (
              prices.map((p) => (
                <div key={p.id} className={styles.priceItem}>
                  <div className={styles.priceInfo}>
                    <div className={styles.priceValues}>
                      {p.is_discount && p.discount_price ? (
                        <>
                          <span className={styles.discountValue}>
                            {formatPrice(p.discount_price)}
                          </span>
                          <span className={styles.originalValue}>
                            {formatPrice(p.price)}
                          </span>
                        </>
                      ) : (
                        <span className={styles.priceValue}>
                          {formatPrice(p.price)}
                        </span>
                      )}
                    </div>
                    <div className={styles.priceMeta}>
                      <Badge variant="primary" size="sm">{getStoreName(p.store_id)}</Badge>
                      <span className={styles.date}>{formatDate(p.date)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePrice(p.id)}
                    className={styles.deletePriceBtn}
                    title="Delete price"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetail;