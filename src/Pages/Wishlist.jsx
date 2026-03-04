import { useEffect, useState } from "react";
import API from "../api.jsx";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { Link } from "react-router-dom";

export default function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await API.get("/wishlist/wishlist/");
                setWishlist(response.data);
            } catch (error) {
                console.error("Error fetching wishlist:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, []);

    const removeFromWishlist = async (wishlistId) => {
        try {
            await API.delete(`/wishlist/wishlist/${wishlistId}/`);
            setWishlist((prev) =>
                prev.filter((item) => item.id !== wishlistId)
            );
        } catch (error) {
            console.error("Error removing item:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <NavBar />
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-lg tracking-wide uppercase">
                        Loading Wishlist...
                    </p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <NavBar />

            <main className="flex-grow max-w-7xl mx-auto px-6 pt-36 pb-16 w-full">
                <h1 className="text-5xl mb-16 text-center uppercase tracking-wide">
                    My Wishlist
                </h1>

                {wishlist.length === 0 ? (
                    <div className="flex flex-col items-center py-24">
                        <p className="text-2xl font-semibold uppercase tracking-wide">
                            Your Wishlist Is Empty
                        </p>
                        <Link
                            to="/"
                            className="mt-10 border px-8 py-3 uppercase tracking-wide hover:bg-black hover:text-white transition"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                        {wishlist.map((item) => {
    const product = item.product;

    if (!product) return null;

    const imageUrl =
        product.images && product.images.length > 0
            ? product.images[0].url
            : null;

    return (
        <div key={item.id} className="group flex flex-col">
            <div className="relative overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-[350px] object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-[350px] bg-gray-200 flex items-center justify-center">
                        No Image
                    </div>
                )}

                <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-4 right-4 border px-3 py-1 text-xs uppercase bg-white hover:bg-black hover:text-white transition"
                >
                    Remove
                </button>
            </div>

            <div className="mt-6 flex flex-col gap-2">
                <h2 className="text-lg font-semibold uppercase tracking-wide">
                    {product.name}
                </h2>

                <p className="text-sm tracking-wide">
                    ₹{product.price}
                </p>

                <Link
                    to={`/products/${product.id}`}
                    className="mt-3 border px-6 py-2 text-center uppercase tracking-wide hover:bg-black hover:text-white transition"
                >
                    View Product
                </Link>
            </div>
        </div>
    );
})}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
