import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../../layout/admin/AdminHeader";
import AdminMenu from "../../layout/admin/AdminMenu";
import styles from "../../styles/Admin.module.css";
import {
  getProductAdminByIdApi,
  saveProductAdminApi,
  getProductsAdminApi,
} from "../../api/productAdminApi";
import { getErrorMessage } from "../../utils/errorMessage";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const data = await getProductAdminByIdApi(id);
      setForm({
        ...data,
        images: data.images || [],
        color: data.color || { name: "", hex: "" },
        dimensions: data.dimensions || {
          width: "",
          height: "",
          depth: "",
          unit: "cm",
        },
        careInstructions: data.careInstructions || [],
        notes: data.notes || [],
        styles: data.styles || [],
      });
    };
    fetch();

    const fetchCategories = async () => {
      const res = await getProductsAdminApi({ page: 0, size: 100 });
      const unique = [
        ...new Set(res.content.map((p) => p.category).filter(Boolean)),
      ];
      setCategories(unique);
    };
    fetchCategories();
  }, [id]);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleChangeNested = (field, key, value) =>
    setForm((prev) => ({ ...prev, [field]: { ...prev[field], [key]: value } }));

  const handleSubmit = async () => {
    try {
      setError("");

      if (!form.name.trim()) {
        setError("Tên sản phẩm không được để trống");
        return;
      }

      if (!form.sourceUrl.trim()) {
        setError("Source URL không được để trống");
        return;
      }

      if (!form.sourceProvider.trim()) {
        setError("Source Provider không được để trống");
        return;
      }

      setSaving(true);

      const payload = {
        ...form,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,

        // 🔥 fix logic
        inStock: Number(form.stock) > 0,

        images:
          form.images?.length > 0
            ? form.images.filter((i) => i.trim())
            : ["https://via.placeholder.com/300"],

        careInstructions: form.careInstructions.filter((i) => i.trim()),
        notes: form.notes.filter((i) => i.trim()),
      };

      console.log("🚀 UPDATE:", payload);

      await saveProductAdminApi(payload);

      navigate("/admin/products");
    } catch (e) {
      console.error(e);
      setError(getErrorMessage(e, "Cập nhật thất bại."));
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div>Loading...</div>;

  return (
    <div className={styles.adminDashboard}>
      <AdminHeader />
      <AdminMenu />
      <div className={styles.profileWrapper}>
        <div className={styles.leftPanel}>
          <h2>Sửa sản phẩm</h2>
          {error && <p className={styles.errorText}>{error}</p>}

          <div className={styles.infoGrid}>
            <input
              placeholder="Ảnh (URL, cách nhau dấu ,)"
              value={form.images.join(",")}
              onChange={(e) =>
                handleChange(
                  "images",
                  e.target.value
                    .split(",")
                    .map((i) => i.trim())
                    .filter(Boolean),
                )
              }
            />

            <input
              placeholder="Tên"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <input
              placeholder="Slug"
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
            />
            <input
              placeholder="SKU"
              value={form.sku}
              onChange={(e) => handleChange("sku", e.target.value)}
            />

            <input
              placeholder="Danh mục"
              list="category-list"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
            />
            <datalist id="category-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>

            <input
              placeholder="Giá"
              type="number"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
            />
            <input
              placeholder="Xuất xứ"
              value={form.origin}
              onChange={(e) => handleChange("origin", e.target.value)}
            />
            <input
              placeholder="Màu (name)"
              value={form.color.name}
              onChange={(e) =>
                handleChangeNested("color", "name", e.target.value)
              }
            />
            <input
              placeholder="Màu (hex)"
              value={form.color.hex}
              onChange={(e) =>
                handleChangeNested("color", "hex", e.target.value)
              }
            />
            <input
              placeholder="Dimensions Raw"
              value={form.dimensionsRaw}
              onChange={(e) => handleChange("dimensionsRaw", e.target.value)}
            />

            <div>
              <label>Dimensions (cm)</label>
              <input
                placeholder="Width"
                type="number"
                value={form.dimensions.width}
                onChange={(e) =>
                  handleChangeNested("dimensions", "width", e.target.value)
                }
              />
              <input
                placeholder="Height"
                type="number"
                value={form.dimensions.height}
                onChange={(e) =>
                  handleChangeNested("dimensions", "height", e.target.value)
                }
              />
              <input
                placeholder="Depth"
                type="number"
                value={form.dimensions.depth}
                onChange={(e) =>
                  handleChangeNested("dimensions", "depth", e.target.value)
                }
              />
            </div>

            <input
              placeholder="Mô tả"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
            <input
              placeholder="Care Instructions (cách nhau ,)"
              value={form.careInstructions.join(",")}
              onChange={(e) =>
                handleChange("careInstructions", e.target.value.split(","))
              }
            />
            <input
              placeholder="Notes (cách nhau ,)"
              value={form.notes.join(",")}
              onChange={(e) => handleChange("notes", e.target.value.split(","))}
            />

            <select
              value={form.inStock}
              disabled={Number(form.stock) === 0}
              onChange={(e) =>
                handleChange("inStock", e.target.value === "true")
              }
            >
              <option value="true">Còn hàng</option>
              <option value="false">Hết hàng</option>
            </select>

            <input
              placeholder="Stock"
              type="number"
              value={form.stock}
              onChange={(e) => {
                const value = Number(e.target.value);

                setForm((prev) => ({
                  ...prev,
                  stock: value,
                  inStock: value > 0,
                }));
              }}
            />
            <input
              placeholder="Sold Count"
              type="number"
              value={form.soldCount}
              onChange={(e) => handleChange("soldCount", e.target.value)}
            />

            <input
              placeholder="Source URL"
              value={form.sourceUrl}
              onChange={(e) => handleChange("sourceUrl", e.target.value)}
            />
            <input
              placeholder="Source Provider"
              value={form.sourceProvider}
              onChange={(e) => handleChange("sourceProvider", e.target.value)}
            />
          </div>

          <div className={styles.editActions}>
            <button
              className={styles.saveBtn}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Cập nhật"}
            </button>
            <button className={styles.cancelBtn} onClick={() => navigate(-1)}>
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEdit;
