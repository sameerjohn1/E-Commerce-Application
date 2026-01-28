import { useEffect, useRef, useState } from "react";
import {
  themes,
  themeButtonColors,
  classes,
  getInputClass,
} from "../assets/dummyStyles";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Image, PlusCircle, Trash2, Upload } from "lucide-react";

const AddPage = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeColor, setActiveColor] = useState("grey");
  const [category, setCategory] = useState("men");
  const [brandName, setBrandName] = useState("");

  const inputRef = useRef(null);
  const API_BASE = "http://localhost:4000";
  const BRANDS = [
    "Rolex",
    "Omega",
    "Audemars Piguet",
    "Cartier",
    "Breitling",
    "IWC",
    "Hublot",
    "Jaeger LeCoultre",
    "Tag Heuer",
    "Patek Philippe",
  ];

  const theme = themes[activeColor];
  const inputClass = getInputClass(theme);

  //   to see the preview
  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (category !== "brand") setBrandName("");
  }, [category]);

  //   to remove image from te preview
  const clearFileInput = () => {
    if (inputRef.current) inputRef.current.value = "";
    setImageFile(null);
    setImagePreviewUrl("");
  };

  const handleImageChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/"))
      return toast.error("Please select an image file");
    const maxMB = 5;
    if (f.size > maxMB * 1024 * 1024)
      return toast.error(`Image too large (max ${maxMB} MB)`);
    setImageFile(f);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("men");
    setBrandName("");
    clearFileInput();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile || !name.trim() || !description.trim() || !price.trim())
      return toast.error("Please fill all fields and select an image.");
    if (isNaN(Number(price)) || Number(price) <= 0)
      return toast.error("Enter a valid price greater than 0.");
    if (category === "brand" && !brandName.trim())
      return toast.error("Please select the brand.");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("price", String(Number(price)));
      formData.append("category", category);
      if (category === "brand") {
        formData.append(
          "brandName",
          brandName.trim().toLowerCase().replace(/\s+/g, "-"),
        );
      }

      const resp = await axios.post(`${API_BASE}/api/watches`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Saved:", resp?.data);
      toast.success("Watch added successfully!");
      resetForm();
    } catch (err) {
      console.error(err);
      const serverMsg =
        err?.response?.data?.message || err?.response?.data || null;
      toast.error(String(serverMsg || "Failed to add watch. Try again."));
    } finally {
      setLoading(false);
    }
  };

  const prettyCategory = (c) =>
    c === "men" ? "Men" : c === "women" ? "Women" : c === "brand" ? "Brand" : c;

  return (
    <div className={`${classes.pageContainer} ${theme.bg}`}>
      <ToastContainer position="top-right" autoClose={2500} />

      <div className={classes.maxWidthContainer}>
        <div className={classes.headerContainer}>
          <h1 className={classes.headerTitle}>Add New Watch</h1>

          <div className={classes.themeButtonsContainer}>
            {["grey", "blue", "purple"].map((c) => (
              <button
                key={c}
                className={`${classes.themeButton(activeColor === c)} ${themeButtonColors[c]}`}
                onClick={() => setActiveColor(c)}
              />
            ))}
          </div>
        </div>

        <div className={classes.gridContainer}>
          <form
            onSubmit={handleSubmit}
            className={classes.formContainer(theme)}
          >
            <div>
              <div className={classes.formLabel}>
                <Upload className="w-4 h-4 " /> Watch Image{" "}
                <span className={classes.requiredStar}>*</span>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className={`${classes.imagePreviewContainer(theme)} ${
                    imagePreviewUrl ? "" : classes.imagePreviewEmpty
                  }`}
                >
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={classes.imagePlaceholder}>
                      <Image className="w-8 h-8" />
                      <div className="text-xs">No image</div>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <label htmlFor="watch-image" className={classes.uploadButton}>
                    <PlusCircle className="w-4 h-4 text-slate-700" />
                    <span className="text-slate-700 text-sm">Choose Image</span>
                    <input
                      id="watch-image"
                      ref={inputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {imagePreviewUrl && (
                    <button
                      type="button"
                      onClick={clearFileInput}
                      className={classes.removeButton}
                    >
                      <Trash2 className="w-4 h-4 text-slate-600" /> Remove
                    </button>
                  )}

                  <p className={classes.helperText}>
                    Recommended: JPG/PNG. Max size: 5MB.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className={classes.formLabelSimple}>
                Watch Name <span className={classes.requiredStar}>*</span>
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Classic Silver Chrono"
                className={inputClass}
                required
                disabled={loading}
              />
            </div>

            <div>
              <div className={classes.formLabelSimple}>
                Category <span className={classes.requiredStar}>*</span>
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
                disabled={loading}
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="brand">Brand</option>
              </select>
            </div>

            {category === "brand" && (
              <div>
                <div className={classes.formLabelSimple}>
                  Brand <span className={classes.requiredStar}>*</span>
                </div>

                <select
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className={inputClass}
                  required
                  disabled={loading}
                >
                  <option value="">Select Brand</option>
                  {BRANDS.map((b) => (
                    <option value={b} key={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <div className={classes.formLabelSimple}>
                Description <span className={classes.requiredStar}>*</span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Short description about watch"
                className={`${inputClass} resize-none`}
                required
                disabled={loading}
              ></textarea>
            </div>

            <div>
              <div className={classes.formLabelSimple}>
                Price (Pkr) <span className={classes.requiredStar}>*</span>
              </div>

              <div className={classes.priceInputContainer}>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="199.99"
                  inputMode="decimal"
                  className={classes.priceInput(theme)}
                  required
                  disabled={loading}
                  type="text"
                />
              </div>
            </div>

            <div className="mt-3">
              <button
                type="submit"
                disabled={loading}
                className={classes.submitButton(theme, loading)}
              >
                <PlusCircle className="w-5 h-5" />
                <span className="text-sm">
                  {loading ? "Adding..." : "Add Watch"}
                </span>
              </button>
            </div>
          </form>

          <div className={classes.previewContent}>
            <h3 className={classes.previewName}>{name || "Watch name"}</h3>
            <div className={classes.previewCategory}>
              <strong>Category:</strong> {prettyCategory(category)}
              {category === "brand" && brandName && (
                <span className="ml-2 text-slate-500">({brandName})</span>
              )}
            </div>
            <p className={classes.previewDescription}>
              {description || "Watch description will appear here."}
            </p>
            <div className={classes.previewPriceContainer}>
              <div className={classes.previewPriceLabel}>Price</div>
              <div className={classes.previewPriceValue}>
                {price ? `${Number(price).toFixed(2)}` : "0.00"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPage;
