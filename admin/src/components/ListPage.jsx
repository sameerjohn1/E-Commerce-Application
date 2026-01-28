import React, { useEffect, useState } from "react";
import { listPageStyles } from "../assets/dummyStyles";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Trash2 } from "lucide-react";

const ListPage = () => {
  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const API_BASE = "http://localhost:4000";
  const LIST_PATH = "/api/watches";

  const mapServerToUI = (item) => {
    let img = item.image ?? item.img ?? "";
    if (typeof img === "string" && img.startsWith("/"))
      img = `${API_BASE}${img}`;
    return {
      id: item._id,
      name: item.name,
      desc: item.description ?? "",
      price: item.price,
      category: item.category ?? "Brand",
      brand: item.brandName ?? "",
      img,
    };
  };

  useEffect(() => {
    let mounted = true;
    const fetchWatches = async () => {
      setLoading(true);
      try {
        // Short, intentional change: request a very large limit so backend returns all records.
        const resp = await axios.get(`${API_BASE}${LIST_PATH}?limit=10000`);
        const data = resp.data;
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.watches)
              ? data.watches
              : Array.isArray(data?.results)
                ? data.results
                : [];

        if (mounted) {
          setWatches(items.map(mapServerToUI));
        }
      } catch (err) {
        console.error("Failed to fetch watches:", err);
        if (mounted) {
          setWatches([]);
          toast.error("Could not fetch watches from server.");
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

  async function handleDelete(id) {
    const prev = watches.slice();
    setWatches((list) => list.filter((w) => w.id !== id));
    setDeletingId(id);
    try {
      await axios.delete(`${API_BASE}${LIST_PATH}/${id}`);
      toast.success("Watch deleted successfully.");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete item. Restoring list.");
      setWatches(prev);
    } finally {
      setDeletingId(null);
    }
  }

  const getCategoryLabel = (watch) => {
    const cat = String(watch.category ?? "").toLowerCase();
    if (cat === "men") return "Men";
    if (cat === "women") return "Women";
    if (cat === "brand" || watch.brand) return watch.brand || "Brand";
    return watch.category || "";
  };
  return (
    <div className={listPageStyles.root}>
      <ToastContainer />

      <div className={listPageStyles.container}>
        <header className={listPageStyles.header}>
          <h1 className={listPageStyles.title}>Watch Collection</h1>
        </header>

        <section className={listPageStyles.grid}>
          {watches.map((watch) => (
            <article key={watch.id} className={listPageStyles.article}>
              <div className={listPageStyles.imageContainer}>
                {watch.img ? (
                  <img
                    src={watch.img}
                    alt={watch.name}
                    className={listPageStyles.image}
                    onError={(e) => {
                      e.currentTarget.style.objectFit = "contain";
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f8fafc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='16'%3EImage not available%3C/text%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <div className={listPageStyles.fallbackImageContainer}>
                    No Image
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-2">
                <h3 className={listPageStyles.name}>{watch.name}</h3>
                <p className={listPageStyles.description}>{watch.desc}</p>

                <div className="flex items-center gap-2 text-sm mt-2">
                  <span className={listPageStyles.categoryTag}>
                    {getCategoryLabel(watch)}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className={listPageStyles.price}>{watch.price}</div>

                  <button
                    onClick={() => handleDelete(watch.id)}
                    className={listPageStyles.deleteButton}
                    disabled={deletingId === watch.id}
                  >
                    <Trash2 size={16} />
                    {deletingId === watch.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        {!loading && (!watches || watches.length === 0) && (
          <p className={listPageStyles.noItems}>No Watches found.</p>
        )}
      </div>
    </div>
  );
};

export default ListPage;
