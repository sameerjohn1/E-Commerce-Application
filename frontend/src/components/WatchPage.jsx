import React, { useMemo, useState } from "react";
import { watchPageStyles } from "../assets/dummyStyles";
import { WATCHES, FILTERS as RAW_FILTERS } from "../assets/dummywdata";
import { useCart } from "../CartContext";
import { Grid, Minus, Plus, ShoppingCart, User, Users } from "lucide-react";

const ICON_MAP = { Grid, User, Users };
const FILTERS = RAW_FILTERS?.length
  ? RAW_FILTERS.map((f) => ({ ...f, icon: ICON_MAP[f.iconName] ?? Grid }))
  : [
      { key: "all", label: "All", icon: Grid },
      { key: "men", label: "Men", icon: User },
      { key: "women", label: "Women", icon: Users },
    ];

const WatchPage = () => {
  const [filter, setFilter] = useState("all");
  const { cart, addItem, increment, decrement, removeItem } = useCart();

  //for filter
  const filtered = useMemo(
    () =>
      WATCHES.filter((w) => (filter === "all" ? true : w.gender === filter)),
    [filter],
  );

  const getQty = (id) => {
    const it = cart.find((c) => String(c.id) === String(id));
    return it ? Number(it.qty || 0) : 0;
  };

  return (
    <div className={watchPageStyles.container}>
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
                        className={watchPageStyles.cartButton}
                      >
                        <Minus className={watchPageStyles.filterIcon} />
                      </button>

                      <div className={watchPageStyles.cartQuantity}>{qty}</div>

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
                      <ShoppingCart className={watchPageStyles.addToCartIcon} />
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
    </div>
  );
};

export default WatchPage;
