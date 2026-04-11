import { useEffect, useState, useContext } from "react";

import { useNavigate } from "react-router-dom";

import { MdFavorite, MdFavoriteBorder } from "react-icons/md";

import API from "../api.jsx";
import { AuthContext } from "../Components/AuthContext.jsx";
import NavBar from "../Components/NavBar.jsx";
import Footer from "../Components/Footer.jsx";

export default function Kids() {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  const { user, loading } = useContext(AuthContext);

  const navigate = useNavigate();

  const getProductDisplayImage = (product) => {
    if (!product.images || product.images.length === 0) return '';
    const mainImage = product.images.find((img) => img.main === true);

    return mainImage ? mainImage.url : product.images[0]?.url;
  };

  const getProductId = (item) => {
    if (typeof item.product === "object") return item.product.id;

    return item.product;
  };

  useEffect(() => {
    const fetchProducts = async () => {

      try {
        const response = await API.get("/products/products/", {
          params: { category: "KIDS" },
        });

        const activeProducts = response.data.filter((p) => p.is_active);

        setProducts(activeProducts);
      }

      catch (err) {
        console.error(err);
      }

      finally {
        setPageLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!user) {
      setWishlist([]);

      return;
    }

    const fetchWishlist = async () => {
      try {
        const res = await API.get("/wishlist/wishlist/");

        setWishlist(res.data);
      }

      catch (err) {
        console.error(err);
      }
    };

    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (product) => {
    if (!user) return;

    const existingItem = wishlist.find(
      (item) => getProductId(item) === product.id
    );

    try {
      if (existingItem) {
        await API.delete(`/wishlist/wishlist/${existingItem.id}/`);

        setWishlist((prev) =>
          prev.filter((item) => item.id !== existingItem.id)
        );
      }

      else {
        const res = await API.post("/wishlist/wishlist/", {
          product_id: product.id,
        });

        setWishlist((prev) => [...prev, res.data]);
      }
    }

    catch (err) {
      console.error(err);
    }
  };

  if (loading || pageLoading) {
    return <p className="text-center mt-12">Loading...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />

      <header className="max-w-7xl mx-auto px-6 py-8 pt-28">
        <h1
          className="text-6xl mb-12 text-gray-900 text-center"
          style={{ fontFamily: "Playfair Display" }}
        >
          KID'S COLLECTION
        </h1>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const isInWishlist = wishlist.some(
              (item) => getProductId(item) === product.id
            );

            return (
              <div
                key={product.id}
                className="bg-white overflow-hidden group transition-all duration-300"
              >
                <div
                  className="overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/kids/${product.id}`)}
                >
                  <img
                    src={getProductDisplayImage(product)}
                    alt={product.name}
                    className="w-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-2 flex items-center justify-between">
                  <div>
                    <h2 className="text-xs uppercase truncate max-w-[150px]">
                      {product.name}
                    </h2>
                    <p className="text-xs text-gray-800">
                      ₹ {product.price}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleWishlist(product)}
                    disabled={!user}
                    className={`text-lg transition-colors duration-300 ${
                      isInWishlist
                        ? "text-red-600"
                        : user
                        ? "text-gray-300 hover:text-red-600"
                        : "text-gray-200 cursor-not-allowed"
                    }`}
                  >
                    {isInWishlist ? <MdFavorite /> : <MdFavoriteBorder />}
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