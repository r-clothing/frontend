import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";

import { PiShoppingCartSimpleFill, PiShoppingCartSimple } from "react-icons/pi";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";

import { toast } from "react-toastify";

import API from "../api.jsx";
import { AuthContext } from "../Components/AuthContext.jsx";
import NavBar from "../Components/NavBar.jsx";
import Footer from "../Components/Footer.jsx";

export default function Details() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const { user, loading } = useContext(AuthContext);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`products/products/${id}/`);

        setProduct(res.data);
      }

      catch (err) {
        console.error(err);

        toast.error("Failed to load product");
      }

      finally {
        setPageLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch wishlist
  const fetchWishlist = async () => {
    try {
      const res = await API.get("wishlist/wishlist/");

      setWishlist(res.data);
    }

    catch (err) {
      console.error(err);
    }
  };

  // Fetch cart
  const fetchCart = async () => {
    try {
      const res = await API.get("cart/cart/");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.items || [];

        setCartItems(data);
    }

    catch (err) {
      console.error(err);
    }
  };

  // Load wishlist + cart
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      setCartItems([]);

      return;
    }

    fetchWishlist();
    fetchCart();
  }, [user]);

  const variants = product?.variants || [];

  const selectedVariant = variants.find(
    (v) => v.size.value === selectedSize
  );

  const getDisplayPrice = () => {
    if (selectedVariant) {
      return selectedVariant.price || product.price;
    }

    const available = variants.filter((v) => v.stock > 0);

    if (!available.length) return product.price;

    return Math.min(
      ...available.map((v) => v.price || product.price)
    );
  };

  // Wishlist state
  const isInWishlist = wishlist.some(
    (item) => item.product?.id === product?.id
  );

  const toggleWishlist = async () => {
    if (!user) {
      toast.warning("Please log in first!");

      return;
    }

    try {
      if (isInWishlist) {
        const item = wishlist.find(
          (w) => w.product?.id === product.id
        );

        await API.delete(`wishlist/wishlist/${item.id}/`);

        toast.info("Removed from wishlist");
      }

      else {
        await API.post("wishlist/wishlist/", {
          product_id: product.id,
        });

        toast.success("Added to wishlist");
      }

      await fetchWishlist();
    }

    catch (err) {
      console.error(err);

      toast.error("Wishlist action failed");
    }
  };

  // Cart states
  const isVariantInCart = cartItems.some(
    (item) => item?.variant?.id === selectedVariant?.id
  );

  const isProductInCart = cartItems.some(
    (item) => item?.variant?.product?.id === product?.id
  );

  const toggleCart = async () => {
    if (!user) {
      toast.warning("Please log in first!");

      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size first!");

      return;
    }

    if (!selectedVariant || selectedVariant.stock === 0) {
      toast.error("Selected size is out of stock");

      return;
    }

    try {
      if (isVariantInCart) {
        const item = cartItems.find(
          (c) => c.variant.id === selectedVariant.id
        );

        await API.delete(`cart/cart/${item.id}/`);

        toast.info("Removed from cart");
      }

      else {
        await API.post("cart/cart/", {
          variant_id: selectedVariant.id,
          quantity: 1,
        });

        toast.success("Added to cart");
      }

      await fetchCart();
    }

    catch (err) {
      console.error(err);

      toast.error("Cart action failed");
    }
  };

  if (loading || pageLoading || !product) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />

      <main className="flex-grow max-w-7xl mx-auto px-6 pb-12 flex flex-col md:flex-row gap-6 pt-28">
        {/* Image */}
        <div className="flex-1">
          <img
            src={product.images[0]?.url}
            alt={product.name}
            className="w-full object-contain"
          />
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col space-y-4">
          <h2 className="text-gray-900 uppercase text-xl font-bold">
            {product.name}
          </h2>

          <p className="text-gray-800 text-lg">
            {product.description || "No description available."}
          </p>

          {/* Sizes */}
          <div className="flex space-x-2 mt-2">
            {variants.map((v) => {
              const isOutOfStock = v.stock === 0;

              return (
                <span
                  key={v.id}
                  onClick={() => {
                    if (isOutOfStock) return;
                    setSelectedSize(
                      selectedSize === v.size.value
                        ? null
                        : v.size.value
                    );
                  }}
                  className={`px-3 py-1 border transition ${
                    isOutOfStock
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : selectedSize === v.size.value
                      ? "bg-gray-800 text-white cursor-pointer"
                      : "border-gray-400 hover:bg-gray-200 cursor-pointer"
                  }`}
                >
                  {v.size.value}
                </span>
              );
            })}
          </div>

          {/* Price */}
          <p className="text-gray-900 text-xl font-semibold mt-2">
            ₹ {Number(getDisplayPrice()).toFixed(2)}
          </p>

          {/* Wishlist */}
          <button
            onClick={toggleWishlist}
            disabled={!user}
            className={`w-48 py-2 font-semibold border-b border-gray-800 flex items-center justify-center gap-2 transition ${
              isInWishlist
                ? "bg-red-600 text-white"
                : "hover:bg-red-600 hover:text-white"
            } ${!user && "opacity-50 cursor-not-allowed"}`}
          >
            {isInWishlist ? (
              <>
                <MdFavorite /> In Wishlist
              </>
            ) : (
              <>
                <MdFavoriteBorder /> Add to Wishlist
              </>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={toggleCart}
            disabled={!user}
            className={`w-48 py-2 font-semibold border-b border-gray-800 flex items-center justify-center gap-2 transition ${
              isVariantInCart
                ? "bg-black text-white"
                : isProductInCart
                ? "bg-gray-800 text-white"
                : "hover:bg-black hover:text-white"
            } ${!user && "opacity-50 cursor-not-allowed"}`}
          >
            {isVariantInCart ? (
              <>
                <PiShoppingCartSimpleFill /> In Cart
              </>
            ) : isProductInCart ? (
              <>
                <PiShoppingCartSimpleFill /> Added (Other Size)
              </>
            ) : (
              <>
                <PiShoppingCartSimple /> Add to Cart
              </>
            )}
          </button>

          {!user && (
            <p className="text-red-500 text-xs">
              *Please log in first
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
