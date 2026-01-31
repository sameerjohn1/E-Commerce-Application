import React, { useEffect, useState } from "react";
import { brandPageStyles } from "../assets/dummyStyles";
import { useNavigate, useParams } from "react-router-dom";
import watchesData from "../assets/Categoriesdata";
import { useCart } from "../CartContext";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import axios from "axios";

const API_BASE = "http://localhost:4000";

const BrandPage = () => {
  const { brandName } = useParams();
  const navigate = useNavigate();
  const { addItem, cart, increment, decrement } = useCart();

  const [brandWatches, setBrandWatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ensure instant jump to top (no smooth scrolling)
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      // also reset potential scroll on html/body for some browsers
      try {
        document.documentElement && (document.documentElement.scrollTop = 0);
        document.body && (document.body.scrollTop = 0);
      } catch (e) {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    if (!brandName) return setBrandWatches([]);

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_BASE}/api/watches/brands/${encodeURIComponent(
          brandName,
        )}`;
        const resp = await axios.get(url);
        const items = resp?.data?.items ?? resp?.data ?? [];
        const mapped = (items || []).map((it) => {
          const id = it._id ?? it.id;
          const rawPrice =
            typeof it.price === "number"
              ? it.price
              : Number(String(it.price ?? "").replace(/[^0-9.-]+/g, "")) || 0;
          let img = it.image ?? "";
          if (typeof img === "string" && img.startsWith("/"))
            img = `${API_BASE}${img}`;
          return {
            id: String(id),
            image: img || null,
            name: it.name ?? "",
            desc: it.description ?? "",
            priceDisplay: `₹${Number(rawPrice).toFixed(2)}`,
            price: rawPrice,
          };
        });
        if (!cancelled) setBrandWatches(mapped);
      } catch (err) {
        console.error("Failed to fetch brand watches:", err);
        if (!cancelled) setError("Failed to load watches. Try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [brandName]);

  const findInCart = (id) =>
    cart.find(
      (p) => String(p.id) === String(id) || String(p.productId) === String(id),
    );

  if (loading) {
    return (
      <div className={brandPageStyles.loadingContainer}>
        <div className="text-center">
          <div className={brandPageStyles.loadingText}>Loading watches...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={brandPageStyles.notFoundContainer}>
        <div className={brandPageStyles.notFoundCard}>
          <h2 className={brandPageStyles.notFoundTitle}>Error</h2>
          <p className={brandPageStyles.notFoundText}>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className={brandPageStyles.goBackButton}
          >
            <ArrowLeft className={brandPageStyles.goBackIcon} /> Go back
          </button>
        </div>
      </div>
    );
  }

  if (!brandWatches.length) {
    return (
      <div className="h-screen w-full flex justify-center items-center">
        <div className={brandPageStyles.notFoundCard}>
          <h2 className={brandPageStyles.notFoundTitle}>No watches found</h2>
          <p className={brandPageStyles.notFoundText}>
            This brand has no watches listed in our collection yet.
          </p>
          <button
            onClick={() => navigate(-1)}
            className={brandPageStyles.goBackButton}
          >
            <ArrowLeft className={brandPageStyles.goBackIcon} /> Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={brandPageStyles.mainContainer}>
      <div className="max-w-7xl mx-auto relative">
        <div className={brandPageStyles.headerContainer}>
          <div className={brandPageStyles.backButtonContainer}>
            <button
              className={brandPageStyles.backButton}
              onClick={() => navigate(-1)}
            >
              <div className={brandPageStyles.backIcon}>
                <ArrowLeft size={20} />
              </div>
              <span className={brandPageStyles.backText}>Back</span>
            </button>
          </div>

          <div className={brandPageStyles.titleContainer}>
            <h1 className={brandPageStyles.title}>{brandName} Collections</h1>
          </div>
        </div>

        {/* watches grid */}
        <div className={brandPageStyles.grid}>
          {brandWatches.map((watch) => {
            const inCart = findInCart(watch.id);
            const displayQty =
              inCart?.qty ?? inCart?.quantity ?? inCart?.count ?? 0;
            const targetId = inCart?.id ?? inCart?.productId ?? watch.id;
            return (
              <div key={watch.id} className={brandPageStyles.card}>
                <div className={brandPageStyles.imageContainer}>
                  {watch.image ? (
                    <img
                      src={watch.image}
                      alt={watch.name}
                      className={brandPageStyles.image}
                    />
                  ) : (
                    <div className={brandPageStyles.noImagePlaceholder}>
                      No image
                    </div>
                  )}
                </div>

                {/* watches details */}
                <div className={brandPageStyles.detailsContainer}>
                  <h2 className={brandPageStyles.watchName}>{watch.name}</h2>
                  <p className={brandPageStyles.watchDesc}>{watch.desc}</p>

                  <div className={brandPageStyles.priceAndControls}>
                    <p className={brandPageStyles.price}>
                      {watch.priceDisplay ?? `${watch.price.toFixed(2)}`}
                    </p>

                    {/* if items in cart then show qty else show Add btn */}
                    {displayQty > 0 ? (
                      <div className={brandPageStyles.quantityContainer}>
                        <button
                          onClick={() => decrement(targetId)}
                          className={brandPageStyles.quantityButton}
                        >
                          <Minus className={brandPageStyles.quantityIcon} />
                        </button>

                        <div className={brandPageStyles.quantityCount}>
                          {displayQty}
                        </div>

                        <button
                          onClick={() => increment(targetId)}
                          className={brandPageStyles.quantityButton}
                        >
                          <Plus className={brandPageStyles.quantityIcon} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          addItem({
                            id: watch.id,
                            productId: watch.id,
                            name: watch.name,
                            price: watch.price,
                            img: watch.image,
                            qty: 1,
                          })
                        }
                        className={brandPageStyles.addButton}
                      >
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BrandPage;
