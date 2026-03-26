import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminHeader from "../../layout/admin/AdminHeader";
import AdminMenu from "../../layout/admin/AdminMenu";
import styles from "../../styles/Admin.module.css";
import { Pencil } from "lucide-react";
import { getProductAdminByIdApi } from "../../api/productAdminApi";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getProductAdminByIdApi(id);
        // Khởi tạo fallback cho nested object
        setProduct({
          ...data,
          color: data.color || { name: "", hex: "" },
          dimensions: data.dimensions || {
            width: "",
            height: "",
            depth: "",
            unit: "cm",
          },
          styles: data.styles || [],
          careInstructions: data.careInstructions || [],
          notes: data.notes || [],
          images: data.images || [],
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Không tìm thấy sản phẩm</div>;

  return (
    <div className={styles.adminDashboard}>
      <AdminHeader />
      <AdminMenu />

      <div className={styles.productDetailContainer}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{product.name || "—"}</h2>
          <button
            className={styles.editBtn}
            onClick={() => navigate(`/admin/products/${id}/edit`)}
          >
            <Pencil size={16} />
          </button>
        </div>

        <div className={styles.infoBox}>
          <p>
            <b>Slug:</b> {product.slug || "—"}
          </p>
          <p>
            <b>SKU:</b> {product.sku || "—"}
          </p>
          <p>
            <b>Danh mục:</b> {product.category || "—"}
          </p>
          <p>
            <b>Giá:</b>{" "}
            {product.price
              ? Number(product.price).toLocaleString("vi-VN") + " VND"
              : "—"}
          </p>
          <p>
            <b>Chất liệu:</b> {product.material || "—"}
          </p>
          <p>
            <b>Màu:</b> {product.color?.name || "—"}{" "}
            {product.color?.hex && `( ${product.color.hex} )`}
          </p>
          <p>
            <b>Xuất xứ:</b> {product.origin || "—"}
          </p>
          <p>
            <b>Dimensions:</b> W:{product.dimensions?.width || "-"} H:
            {product.dimensions?.height || "-"} D:
            {product.dimensions?.depth || "-"}{" "}
            {product.dimensions?.unit || "cm"}
          </p>
          <p>
            <b>Dimensions Raw:</b> {product.dimensionsRaw || "—"}
          </p>
          <p>
            <b>Mô tả:</b> {product.description || "—"}
          </p>
          <p>
            <b>Styles:</b> {product.styles?.join(", ") || "—"}
          </p>
          <p>
            <b>Care Instructions:</b>{" "}
            {product.careInstructions?.join(", ") || "—"}
          </p>
          <p>
            <b>Notes:</b> {product.notes?.join(", ") || "—"}
          </p>
          <p>
            <b>Kho:</b>{" "}
            {product.inStock ? (
              <span className={styles.active}>Còn hàng</span>
            ) : (
              <span className={styles.inactive}>Hết hàng</span>
            )}
          </p>
          <p>
            <b>Số lượng kho:</b> {product.stock || 0}
          </p>
          <p>
            <b>Đã bán:</b> {product.soldCount || 0}
          </p>
          <p>
            <b>Source:</b>{" "}
            {product.sourceUrl ? (
              <a href={product.sourceUrl} target="_blank">
                {product.sourceProvider || product.sourceUrl}
              </a>
            ) : (
              "—"
            )}
          </p>
        </div>

        <div className={styles.imageGrid}>
          {product.images?.length ? (
            product.images.map((img, i) => (
              <img key={i} src={img} alt={`img-${i}`} />
            ))
          ) : (
            <p>Không có ảnh</p>
          )}
        </div>

        <div className={styles.actionRow}>
          <button
            className={styles.backBtn}
            onClick={() => navigate("/admin/products")}
          >
            ← Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
