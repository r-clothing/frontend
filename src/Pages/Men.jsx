import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../Components/NavBar.jsx';
import Footer from '../Components/Footer.jsx';
import { ToastContainer, toast } from 'react-toastify';
import { MdFavorite } from 'react-icons/md';
import API from '../api.jsx';
import { AuthContext } from '../Components/AuthContext.jsx';

export default function Men() {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('View All');
  const [sortOrder, setSortOrder] = useState('default');
  const [isSortHovered, setIsSortHovered] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const getProductDisplayImage = (product) => {
    if (!product.images || product.images.length === 0) return '';
    const mainImage = product.images.find((img) => img.main);
    return mainImage ? mainImage.url : product.images[0]?.url;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = { category: 'MEN' };

        if (sortOrder === 'price inc') params.ordering = 'price';
        if (sortOrder === 'price dec') params.ordering = '-price';

        const response = await API.get('/products/products/', { params });

        const activeProducts = response.data.filter((p) => p.is_active);

        setProducts(activeProducts);

        const uniqueTypes = [
          ...new Set(activeProducts.map((p) => p.product_type)),
        ].sort();

        setTypes(uniqueTypes);
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchProducts();
  }, [sortOrder]);

  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const res = await API.get('/wishlist/wishlist/');
        setWishlist(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWishlist();
  }, [user]);

  const getProductId = (item) => {
    if (typeof item.product === 'object') return item.product.id;
    return item.product;
  };

  const toggleWishlist = async (product) => {
    if (!user) {
      toast.warn('Please log in to use the wishlist!', { autoClose: 2000 });
      return;
    }

    const existingItem = wishlist.find(
      (item) => getProductId(item) === product.id
    );

    try {
      if (existingItem) {
        await API.delete(`/wishlist/wishlist/${existingItem.id}/`);
        setWishlist((prev) =>
          prev.filter((item) => item.id !== existingItem.id)
        );
        toast.success('Removed from wishlist', { autoClose: 2000 });
      } else {
        const res = await API.post('/wishlist/wishlist/', {
          product_id: product.id,
        });
        setWishlist((prev) => [...prev, res.data]);
        toast.success('Added to wishlist', { autoClose: 2000 });
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong.');
    }
  };

  if (loading || pageLoading) {
    return <p className='text-center mt-12'>Loading...</p>;
  }

  const displayedProducts =
    selectedType === 'View All'
      ? products
      : products.filter((p) => p.product_type === selectedType);

  const getDisplayPrice = (product) => {
    if (!product.variants || product.variants.length === 0) {
      return product.price;
    }

    const availableVariants = product.variants.filter(v => v.stock > 0);

    if (availableVariants.length === 0) return product.price;

    const prices = availableVariants.map(
      v => v.price || product.price
    );

    return Math.min(...prices);
  };

  return (
    <div className='min-h-screen flex flex-col bg-white'>
      <NavBar />
      <ToastContainer position='top-center' theme='dark' />

      <header className='max-w-7xl mx-auto px-6 py-8 pt-28'>
        <h1
          className='text-6xl mb-12 text-gray-900 text-center'
          style={{ fontFamily: 'Playfair Display' }}
        >
          MEN'S COLLECTION
        </h1>
      </header>

      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="w-full flex flex-wrap items-center gap-6 pl-10">
          <button
            onClick={() => setSelectedType('View All')}
            className={`text-xs uppercase ${
              selectedType === 'View All'
                ? 'text-black font-semibold'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            View All
          </button>

          {types.map((type, i) => (
            <button
              key={i}
              onClick={() => setSelectedType(type)}
              className={`text-xs uppercase ${
                selectedType === type
                  ? 'text-black font-semibold'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {type}
            </button>
          ))}

          <button
            className="relative uppercase text-xs font-bold w-24 text-center"
            onMouseEnter={() => setIsSortHovered(true)}
            onMouseLeave={() => setIsSortHovered(false)}
            onClick={() =>
              setSortOrder(
                sortOrder === 'default'
                  ? 'price inc'
                  : sortOrder === 'price inc'
                  ? 'price dec'
                  : 'default'
              )
            }
          >
            <span
              className={`transition-opacity duration-300 ${
                isSortHovered ? 'opacity-0' : 'opacity-100'
              }`}
            >
              Sort
            </span>

            <span
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                isSortHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {sortOrder === 'price inc'
                ? 'Price inc'
                : sortOrder === 'price dec'
                ? 'Price dec'
                : 'Default'}
            </span>
          </button>
        </div>
      </div>

      <main className='flex-grow max-w-7xl mx-auto px-6 pb-12'>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {displayedProducts.map((product) => {
            const isInWishlist = wishlist.some(
              (item) => getProductId(item) === product.id
            );

            return (
              <div key={product.id} className='bg-white'>
                <div
                  className='overflow-hidden cursor-pointer group'
                  onClick={() => navigate(`/men/${product.id}`)}
                >
                  <img
                    src={getProductDisplayImage(product)}
                    alt={product.name}
                    className='w-full object-contain transition-transform duration-500 group-hover:scale-105'
                  />
                </div>

                <div className='p-2 flex items-start justify-between gap-2'>
                  <div className="flex-1 min-w-0">
                    <h2 className='text-xs uppercase truncate'>
                      {product.name}
                    </h2>
                    <p className='text-xs text-gray-800 mt-1'>
                      ₹ {getDisplayPrice(product)}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className='inline-flex items-start justify-center pt-1 flex-shrink-0 group'
                  >
                    <MdFavorite
                      className={`
                        w-4 h-4 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                        transform
                        ${isInWishlist
                          ? 'text-red-600 scale-100 opacity-100'
                          : 'text-gray-300 scale-95 opacity-70 group-hover:text-red-600 group-hover:scale-110 group-hover:opacity-100'}
                      `}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}