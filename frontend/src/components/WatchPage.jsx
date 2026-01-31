import React, { useEffect, useMemo, useState } from "react";
import { watchPageStyles } from "../assets/dummyStyles";
import { WATCHES, FILTERS as RAW_FILTERS } from "../assets/dummywdata";
import { useCart } from "../CartContext";
import { Grid, Minus, Plus, ShoppingCart, User, Users } from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const ICON_MAP = { Grid, User, Users };
const FILTERS = RAW_FILTERS?.length
  ? RAW_FILTERS.map((f) => ({ ...f, icon: ICON_MAP[f.iconName] ?? Grid }))
  : [
      { key: "all", label: "All", icon: Grid },
      { key: "men", label: "Men", icon: User },
      { key: "women", label: "Women", icon: Users },
    ];

const API_BASE = "http://localhost:4000";
const WatchPage = () => {
  const [filter, setFilter] = useState("all");
  const { cart, addItem, increment, decrement, removeItem } = useCart();

  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const mapServerToUI = (item) => {
    let img = item.image ?? item.img ?? "";
    if (typeof img === "string" && img.startsWith("/")) {
      img = `${API_BASE}${img}`;
    }
    const rawGender =
      (item.gender && String(item.gender).toLowerCase()) ||
      (item.category && String(item.category).toLowerCase()) ||
      "";

    const gender =
      rawGender === "men" || rawGender === "male"
        ? "men"
        : rawGender === "women" || rawGender === "female"
          ? "women"
          : "unisex";

    return {
      id:
        item._id ??
        item.id ??
        String(item.sku ?? item.name ?? Math.random()).slice(2, 12),
      name: item.name,
      price: item.price ?? 0,
      category: item.category ?? "",
      brand: item.brandName ?? "",
      description: item.description,
      img,
      gender,
      raw: item,
    };
  };

  useEffect(() => {
    let mounted = true;
    const fetchWatches = async () => {
      setLoading(true);
      try {
        const resp = await axios.get(`${API_BASE}/api/watches?limit=10000`);
        const data = resp.data;
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.watches)
              ? data.watches
              : null;

        if (!items) {
          if (mounted) {
            if (Array.isArray(DUMMY_WATCHES) && DUMMY_WATCHES.length) {
              setWatches(DUMMY_WATCHES.map(mapServerToUI));
              toast.info("Using local dummy watches.");
            } else {
              setWatches([]);
              toast.info("No watches returned from server.");
            }
          }
        } else if (mounted) {
          setWatches(items.map(mapServerToUI));
        }
      } catch (err) {
        console.error("Failed to fetch watches:", err);
        if (mounted) {
          if (Array.isArray(DUMMY_WATCHES) && DUMMY_WATCHES.length) {
            setWatches(DUMMY_WATCHES.map(mapServerToUI));
            toast.warn("Could not reach server — using local dummy watches.");
          } else {
            setWatches([]);
            toast.error("Could not fetch watches from server.");
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchWatches();
    return () => {
      mounted = false;
    };
  }, []);

  const getQty = (id) => {
    const items = Array.isArray(cart) ? cart : (cart?.items ?? []);
    const match = items.find((c) => {
      const candidates = [c.productId, c.id, c._id];
      return candidates.some((field) => String(field ?? "") === String(id));
    });
    if (!match) return 0;
    const qty = match.qty ?? match.quantity ?? 0;
    return Number(qty) || 0;
  };

  const filtered = useMemo(
    () =>
      watches.filter((w) =>
        filter === "all"
          ? true
          : filter === "men"
            ? w.gender === "men"
            : filter === "women"
              ? w.gender === "women"
              : true,
      ),
    [filter, watches],
  );

  return (
    <div className={watchPageStyles.container}>
      <ToastContainer />
      <div className={watchPageStyles.headerContainer}>
        <div>
          <h1 className={watchPageStyles.headerTitle}>
            Timepieces{" "}
            <span className={watchPageStyles.titleAccent}>Curated</span>
          </h1>
          <p className={watchPageStyles.headerDescription}>
            A handpicked selection - clean presentation, zero borders. Choose a
            filter to refine.
          </p>
        </div>

        <div className={watchPageStyles.filterContainer}>
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`${watchPageStyles.filterButtonBase} ${active ? watchPageStyles.filterButtonActive : watchPageStyles.filterButtonInactive}`}
              >
                <Icon className={watchPageStyles.filterIcon} />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* loading and length=0 state */}
      {loading ? (
        <div className={watchPageStyles.loadingText}>Loading watches...</div>
      ) : filtered.length === 0 ? (
        <div className={watchPageStyles.noWatchesText}>No watches found.</div>
      ) : (
        <div className={watchPageStyles.grid}>
          {filtered.map((w) => {
            const sid = String(w.id ?? w._id ?? w.sku ?? w.name);
            const qty = getQty(sid);

            return (
              <div key={sid} className={watchPageStyles.card}>
                <div className={watchPageStyles.imageContainer}>
                  <img
                    src={w.img}
                    alt={w.name}
                    className={watchPageStyles.image}
                    draggable={false}
                  />

                  {/* for controls */}
                  <div className={watchPageStyles.cartControlsContainer}>
                    {qty > 0 ? (
                      // show minus, qty, plus
                      <div className={watchPageStyles.cartQuantityControls}>
                        <button
                          onClick={() => {
                            if (qty > 1) decrement(sid);
                            else removeItem(sid); // remove when qty is 1
                          }}
                          className={watchPageStyles.quantityButton}
                        >
                          <Minus className={watchPageStyles.quantityIcon} />
                        </button>

                        <div className={watchPageStyles.cartQuantity}>
                          {qty}
                        </div>

                        <button
                          onClick={() => increment(sid)}
                          className={watchPageStyles.cartButton}
                        >
                          <Plus className={watchPageStyles.filterIcon} />
                        </button>
                      </div>
                    ) : (
                      // show Add button when not in cart
                      <button
                        onClick={() =>
                          addItem({
                            id: sid,
                            name: w.name,
                            price: w.price,
                            img: w.img,
                          })
                        }
                        className={watchPageStyles.addToCartButton}
                      >
                        <ShoppingCart
                          className={watchPageStyles.addToCartIcon}
                        />
                        Add
                      </button>
                    )}
                  </div>
                </div>

                <div className={watchPageStyles.productInfo}>
                  <h3 className={watchPageStyles.productName}>{w.name}</h3>
                  <p className={watchPageStyles.productDescription}>{w.desc}</p>
                  <div className={watchPageStyles.productPrice}>{w.price}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WatchPage;
