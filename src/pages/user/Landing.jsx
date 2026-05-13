import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Box,
  CheckCircle2,
  Cpu,
  Eye,
  Palette,
  ShoppingBag,
  Sparkles,
  Star,
  Wand2,
} from "lucide-react";
import { getProductsApi } from "../../api/productApi";
import logoImage from "../../assets/logo.png";
import styles from "../../styles/Landing.module.css";

const features = [
  {
    icon: Cpu,
    title: "AI gợi ý bố cục thông minh",
    description:
      "Phân tích không gian nhanh để đề xuất phong cách, vị trí và cách phối nội thất hợp lý.",
  },
  {
    icon: Box,
    title: "Hình dung không gian trực quan",
    description:
      "Xem trước thiết kế với bố cục rõ ràng, dễ so sánh và dễ chỉnh trước khi mua.",
  },
  {
    icon: Palette,
    title: "Phối màu hài hòa",
    description:
      "Từ tông ấm đến phong cách tối giản, người dùng có thể khám phá nhiều hướng thiết kế phù hợp.",
  },
  {
    icon: ShoppingBag,
    title: "Chuyển sang mua sắm ngay",
    description:
      "Từ ý tưởng sang giỏ hàng mượt mà với cùng hệ sinh thái sản phẩm của dự án.",
  },
];

const steps = [
  {
    number: "01",
    title: "Chọn cảm hứng",
    description:
      "Bắt đầu từ phong cách hiện đại, ấm cúng hoặc tinh gọn phù hợp với nhu cầu.",
  },
  {
    number: "02",
    title: "Khám phá sản phẩm",
    description:
      "Duyệt nhanh các danh mục bàn, ghế, sofa và nội thất phù hợp với không gian.",
  },
  {
    number: "03",
    title: "Tối ưu không gian",
    description:
      "So sánh bố cục, màu sắc và công năng trước khi đưa ra lựa chọn cuối cùng.",
  },
  {
    number: "04",
    title: "Đặt mua nhanh",
    description:
      "Thêm vào giỏ, thanh toán và theo dõi đơn hàng ngay trong cùng hệ thống.",
  },
];

const normalizeLandingProduct = (item, index) => ({
  id: item.id || item._id || `product-${index}`,
  name: item.name || "Sản phẩm nội thất",
  price: Number(item.price) || 0,
  image: item.images?.[0] || logoImage,
  category: item.category || "Nội thất",
  description: item.description || "",
  stock: Number(item.stock) || 0,
});

const buildCollectionEntries = (products) => {
  const counts = new Map();
  const firstByCategory = new Map();

  products.forEach((product) => {
    const category = product.category || "Nội thất";
    counts.set(category, (counts.get(category) || 0) + 1);

    if (!firstByCategory.has(category)) {
      firstByCategory.set(category, product);
    }
  });

  return Array.from(firstByCategory.entries())
    .slice(0, 3)
    .map(([category, product]) => ({
      title: category,
      subtitle:
        product.description ||
        `Khám phá thêm các sản phẩm trong danh mục ${category.toLowerCase()}.`,
      tag: `${counts.get(category) || 0} sản phẩm đang hiển thị`,
      image: product.image || logoImage,
      href: `/products?category=${encodeURIComponent(category)}`,
    }));
};

function Home() {
  const [landingProducts, setLandingProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchLandingProducts = async () => {
      const res = await getProductsApi({ page: 0, size: 12 });

      if (!isMounted) return;

      const mappedProducts = (res?.content || []).map(normalizeLandingProduct);
      setLandingProducts(mappedProducts);
      setTotalProducts(res?.totalElements || mappedProducts.length);
    };

    fetchLandingProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);

  const heroProduct = landingProducts[0] || null;
  const showcaseProducts = landingProducts.slice(0, 3);
  const featuredProducts = landingProducts.slice(0, 4);
  const collectionEntries = buildCollectionEntries(landingProducts);
  const uniqueCategoryCount = new Set(
    landingProducts.map((item) => item.category).filter(Boolean),
  ).size;
  const availableProductsCount = landingProducts.filter(
    (item) => item.stock > 0,
  ).length;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlowLeft} />
        <div className={styles.heroGlowRight} />

        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.badge}>
              <Sparkles size={16} />
              <span>Interior commerce experience</span>
            </div>

            <h1 className={styles.heroTitle}>
              Thiết kế không gian sống
              <span> thông minh, mua sắm mượt mà</span>
            </h1>

            <p className={styles.heroDescription}>
              Khám phá cảm hứng nội thất, xem sản phẩm nổi bật và biến ý tưởng
              thành trải nghiệm mua sắm liền mạch ngay trên VirtuSpace.
            </p>

            <div className={styles.heroActions}>
              <Link to="/products" className={styles.primaryButton}>
                <ShoppingBag size={18} />
                <span>Khám phá cửa hàng</span>
              </Link>

              <Link to="/register" className={styles.secondaryButton}>
                <Wand2 size={18} />
                <span>Tạo tài khoản</span>
              </Link>
            </div>

            <div className={styles.trustRow}>
              <div>
                <strong>{totalProducts || 0}+</strong>
                <span>sản phẩm trong hệ thống</span>
              </div>
              <div>
                <strong>{uniqueCategoryCount || 0}+</strong>
                <span>danh mục đang hiển thị</span>
              </div>
              <div>
                <strong>{availableProductsCount || 0}+</strong>
                <span>sản phẩm còn hàng</span>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroCardLarge}>
              <img
                src={heroProduct?.image || logoImage}
                alt={heroProduct?.name || "Không gian nội thất"}
              />
              <div className={styles.heroOverlay}>
                <p>{heroProduct?.category || "Danh mục nổi bật"}</p>
                <h3>{heroProduct?.name || "Khám phá sản phẩm nội thất nổi bật"}</h3>
              </div>
            </div>

            <div className={styles.heroFloatingTop}>
              <span>Danh mục đề xuất</span>
              <strong>{heroProduct?.category || "Nội thất chọn lọc"}</strong>
            </div>

            <div className={styles.heroFloatingBottom}>
              <CheckCircle2 size={18} />
              <div>
                <strong>
                  {availableProductsCount > 0
                    ? `${availableProductsCount} sản phẩm sẵn sàng mua`
                    : "Kết nối trực tiếp với danh mục sản phẩm"}
                </strong>
                <span>
                  {heroProduct?.description
                    ? heroProduct.description.slice(0, 90)
                    : "Trang chủ đang dùng dữ liệu thật từ hệ thống sản phẩm."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Tính năng nổi bật</p>
          <h2>Những điểm chạm giúp khách hàng ở lại lâu hơn trên trang chủ</h2>
          <p>
            Từ phần giới thiệu cảm hứng đến khu vực sản phẩm nổi bật, mọi khối
            nội dung đều hướng tới hành trình khám phá và mua sắm liền mạch.
          </p>
        </div>

        <div className={styles.featureGrid}>
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article key={feature.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <Icon size={24} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className={`${styles.section} ${styles.processSection}`}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Cách hoạt động</p>
          <h2>4 bước để dẫn người dùng từ cảm hứng tới đơn hàng</h2>
          <p>
            Một luồng ngắn gọn, rõ ràng để người dùng mới hiểu ngay giá trị của
            hệ thống và nhanh chóng tìm được sản phẩm phù hợp.
          </p>
        </div>

        <div className={styles.stepGrid}>
          {steps.map((step) => (
            <article key={step.number} className={styles.stepCard}>
              <span className={styles.stepNumber}>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.showcaseLayout}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Không gian truyền cảm hứng</p>
            <h2>Những bố cục giúp người xem hình dung ngay phong cách sống</h2>
            <p>
              Dữ liệu hiển thị ở khu vực này được lấy trực tiếp từ sản phẩm thật
              trong hệ thống thay vì dùng mẫu minh họa cố định.
            </p>
            <Link to="/products" className={styles.inlineLink}>
              Xem toàn bộ sản phẩm
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.showcaseGrid}>
            {showcaseProducts.length > 0 ? (
              showcaseProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className={styles.showcaseCard}
                >
                  <img src={product.image} alt={product.name} />
                  <div className={styles.showcaseOverlay}>
                    <span>{product.category}</span>
                    <h3>{product.name}</h3>
                    <div className={styles.showcaseMeta}>
                      <Eye size={16} />
                      <span>Xem chi tiết</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className={styles.sectionEmpty}>
                Chưa có sản phẩm để hiển thị cảm hứng.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.collectionSection}`}>
        <div className={styles.sectionHeadingLight}>
          <p className={styles.eyebrowLight}>Bộ sưu tập nổi bật</p>
          <h2>Những danh mục được chọn trực tiếp từ dữ liệu sản phẩm hiện có</h2>
          <p>
            Các khối dưới đây được nhóm theo danh mục sản phẩm thực tế đang có
            trong hệ thống để tránh dùng dữ liệu mẫu hardcode.
          </p>
        </div>

        <div className={styles.collectionGrid}>
          {collectionEntries.length > 0 ? (
            collectionEntries.map((collection) => (
              <Link
                key={collection.title}
                to={collection.href}
                className={styles.collectionCard}
              >
                <img src={collection.image} alt={collection.title} />
                <div className={styles.collectionOverlay}>
                  <span>{collection.tag}</span>
                  <h3>{collection.title}</h3>
                  <p>{collection.subtitle}</p>
                  <span className={styles.collectionLink}>
                    Khám phá ngay
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className={styles.sectionEmpty}>
              Chưa có bộ sưu tập động để hiển thị.
            </p>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.productsHeader}>
          <div className={styles.sectionHeadingCompact}>
            <p className={styles.eyebrow}>Sản phẩm nổi bật</p>
            <h2>
              Khám phá nhanh những món đồ đang đại diện cho trải nghiệm mua sắm
            </h2>
          </div>

          <Link to="/products" className={styles.inlineLink}>
            Đi đến cửa hàng
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.productGrid}>
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className={styles.productCard}
              >
                <div className={styles.productImageWrap}>
                  <img src={product.image} alt={product.name} />
                </div>

                <div className={styles.productInfo}>
                  <div className={styles.productRating}>
                    <Star size={14} fill="currentColor" />
                    <span>{product.category}</span>
                  </div>
                  <h3>{product.name}</h3>
                  <p>{formatPrice(product.price)}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className={styles.sectionEmpty}>
              Chưa có sản phẩm nổi bật để hiển thị.
            </p>
          )}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <div>
            <p className={styles.eyebrow}>Sẵn sàng sử dụng</p>
            <h2>Bắt đầu hành trình hoàn thiện không gian sống của bạn hôm nay</h2>
            <p className={styles.ctaText}>
              Khám phá danh mục nội thất, chọn phong cách phù hợp và chuyển sang
              mua sắm chỉ với vài thao tác đơn giản.
            </p>
          </div>

          <div className={styles.ctaActions}>
            <Link to="/products" className={styles.primaryButton}>
              <ShoppingBag size={18} />
              <span>Xem sản phẩm</span>
            </Link>
            <Link to="/login" className={styles.ghostButton}>
              <span>Đăng nhập</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
