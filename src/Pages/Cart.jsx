import { useEffect, useState } from "react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api.jsx";
import "react-toastify/dist/ReactToastify.css";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const res = await API.get("cart/cart/");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.items)
          ? res.data.items
          : [];

      setCartItems(data);
    } catch (err) {
      console.error("Cart fetch error:", err.response || err);
      setCartItems([]);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await API.delete(`cart/cart/${itemId}/`);
      toast.info("Item removed from cart!");
      fetchCartItems();
    } catch {
      toast.error("Failed to remove item!");
    }
  };

  const changeQuantity = async (itemId, delta) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    try {
      await API.patch(`cart/cart/${itemId}/`, {
        quantity: newQuantity,
      });
      fetchCartItems();
    } catch {
      toast.error("Failed to update quantity!");
    }
  };

  // Fixed subtotal
  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.variant?.final_price) || 0;
    return acc + price * item.quantity;
  }, 0);

  const shipping = 99;
  const total = subtotal + shipping;

  const validateShipping = () => {
    const newErrors = {};

    if (!shippingDetails.name.trim()) newErrors.name = "Name is required";
    if (!shippingDetails.address.trim()) newErrors.address = "Address is required";
    if (!shippingDetails.city.trim()) newErrors.city = "City is required";
    if (!shippingDetails.postalCode.trim())
      newErrors.postalCode = "Postal code is required";
    if (!shippingDetails.phone.trim()) newErrors.phone = "Phone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    // 1. Basic Validations
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!validateShipping()) {
      toast.error("Please fill all shipping details.");
      return;
    }

    try {
      // 2. Create the Order on your Backend
      // This returns the razorpay_order_id and your API key
      const res = await API.post("/orders/create-order/", {
        shipping_details: shippingDetails,
      });

      const {
        razorpay_order_id,
        razorpay_key,
        amount,
        currency
      } = res.data;

      // 3. Configure Razorpay Options
      const options = {
        key: razorpay_key,
        amount: amount,
        currency: currency,
        name: "Your Store Name",
        description: "E-commerce Purchase",
        order_id: razorpay_order_id, // The ID created by your Django view
        handler: async function (response) {
          // This function runs ONLY after the user pays successfully in the modal
          try {
            // Send the signature to your VerifyPaymentView
            await API.post("/orders/verify-payment/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Payment successful! Order placed.");

            // Cleanup
            setCartItems([]);
            setCheckoutOpen(false);
            setShippingDetails({
              name: "", address: "", city: "", postalCode: "", phone: "",
            });

            navigate("/profile");
          } catch (err) {
            console.error("Verification error:", err);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: shippingDetails.name,
          contact: shippingDetails.phone,
        },
        theme: {
          color: "#000000", // Matches your minimalist black/white UI
        },
      };

      // 4. Open the Razorpay Modal
      const rzp = new window.Razorpay(options);

      // Optional: Handle payment failure (modal closed or card declined)
      rzp.on('payment.failed', function (response) {
        toast.error("Payment failed: " + response.error.description);
      });

      rzp.open();

    } catch (error) {
      console.error("Checkout error:", error.response || error);
      const errorMsg = error.response?.data?.detail || "Checkout failed!";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />

      <main className="flex-grow max-w-7xl mx-auto px-6 pt-36 pb-12 w-full">
        <h1 className="text-6xl mb-16 text-center">SHOPPING CART</h1>

        {cartItems.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-6 pr-6 border-r border-gray-300">
              {cartItems.map((item) => {
                const variant = item.variant;
                const product = variant?.product;

                const imageUrl = product?.main_image;

                return (
                  <div
                    key={item.id}
                    className="relative flex flex-col md:flex-row items-center justify-between border-b pb-4"
                  >
                    <button
                      className="absolute top-2 right-2 text-red-500 text-lg"
                      onClick={() => removeItem(item.id)}
                    >
                      ×
                    </button>

                    <div className="flex items-center gap-4">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product?.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-lg">
                          No Image
                        </div>
                      )}

                      <div>
                        <h2 className="font-semibold uppercase">
                          {product?.name}
                        </h2>

                        <p className="text-sm uppercase">
                          Size: {variant?.size?.value}
                        </p>

                        <p className="font-semibold">
                          ₹{variant?.final_price}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => changeQuantity(item.id, -1)}
                        className="px-3 border"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => changeQuantity(item.id, 1)}
                        className="px-3 border"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="w-full md:w-1/3 pl-8 pr-5 py-5">
              <h2 className="text-xl font-semibold mb-4">
                Order Summary
              </h2>

              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>₹{shipping}</span>
              </div>

              <div className="flex justify-between font-semibold border-t pt-3 mt-3">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              <button
                className="w-full mt-6 border py-2"
                onClick={() => setCheckoutOpen(true)}
              >
                Proceed to Checkout
              </button>

              {/* Checkout Form */}
              {checkoutOpen && (
                <div className="mt-6 space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={shippingDetails.name}
                      onChange={(e) =>
                        setShippingDetails({
                          ...shippingDetails,
                          name: e.target.value,
                        })
                      }
                      className="w-full border p-2"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Address"
                      value={shippingDetails.address}
                      onChange={(e) =>
                        setShippingDetails({
                          ...shippingDetails,
                          address: e.target.value,
                        })
                      }
                      className="w-full border p-2"
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="City"
                      value={shippingDetails.city}
                      onChange={(e) =>
                        setShippingDetails({
                          ...shippingDetails,
                          city: e.target.value,
                        })
                      }
                      className="w-full border p-2"
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={shippingDetails.postalCode}
                      onChange={(e) =>
                        setShippingDetails({
                          ...shippingDetails,
                          postalCode: e.target.value,
                        })
                      }
                      className="w-full border p-2"
                    />
                    {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Phone"
                      value={shippingDetails.phone}
                      onChange={(e) =>
                        setShippingDetails({
                          ...shippingDetails,
                          phone: e.target.value,
                        })
                      }
                      className="w-full border p-2"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-black text-white py-2 uppercase tracking-widest cursor-pointer hover:bg-gray-800 transition"
                  >
                    Pay ₹{total} Now
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-24">
            <p className="text-2xl font-bold uppercase">
              YOUR CART IS EMPTY
            </p>
            <Link to="/" className="mt-10 border px-6 py-2 uppercase">
              Home
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
