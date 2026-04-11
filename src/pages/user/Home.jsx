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
import styles from "../../styles/Home.module.css";

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
    title: "Phối màu và chất liệu dễ dàng",
    description:
      "Từ tông gỗ ấm đến phong cách tối giản, bạn có thể thử nhiều cảm hứng trong một luồng.",
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
    description: "Bắt đầu từ phong cách hiện đại, ấm cúng hoặc tinh gọn.",
  },
  {
    number: "02",
    title: "Khám phá sản phẩm",
    description: "Duyệt danh mục sofa, bàn, ghế và các món nội thất phù hợp.",
  },
  {
    number: "03",
    title: "Tối ưu không gian",
    description: "So sánh màu sắc, chất liệu và công năng trước khi quyết định.",
  },
  {
    number: "04",
    title: "Đặt mua nhanh",
    description: "Thêm vào giỏ, thanh toán và theo dõi đơn hàng ngay trong hệ thống.",
  },
];

const inspirationRooms = [
  {
    title: "Phòng khách đương đại",
    style: "Modern Balance",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Phòng ngủ thư giãn",
    style: "Soft Minimal",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Góc làm việc tinh gọn",
    style: "Focused Living",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  },
];

const collections = [
  {
    title: "Valencia",
    subtitle: "Ánh sáng ấm, vật liệu mộc và cảm giác sống nhẹ nhàng.",
    tag: "24 sản phẩm nổi bật",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Nordic Calm",
    subtitle: "Đường nét gọn, bảng màu sáng và công năng rõ ràng.",
    tag: "18 sản phẩm nổi bật",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Urban Studio",
    subtitle: "Cho căn hộ hiện đại cần tối ưu diện tích mà vẫn có điểm nhấn.",
    tag: "32 sản phẩm nổi bật",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  },
];

const fallbackProducts = [
  {
    id: "featured-1",
    name: "Sofa vải tối giản",
    price: 12500000,
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "featured-2",
    name: "Bàn trà mặt đá",
    price: 4890000,
    image:
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "featured-3",
    name: "Ghế lounge gỗ sồi",
    price: 6790000,
    image:
      "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "featured-4",
    name: "Đèn thả phòng ăn",
    price: 3290000,
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
  },
];

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState(
    fallbackProducts.map((item) => ({ ...item, isFallback: true })),
  );

  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedProducts = async () => {
      const res = await getProductsApi({ page: 0, size: 4 });

      if (!isMounted || !res?.content?.length) return;

      const mappedProducts = res.content.map((item, index) => ({
        id: item.id || item._id || `product-${index}`,
        name: item.name || "Sản phẩm nội thất",
        price: item.price || 0,
        image: item.images?.[0] || fallbackProducts[index % fallbackProducts.length].image,
        isFallback: false,
      }));

      setFeaturedProducts(mappedProducts);
    };

    fetchFeaturedProducts();

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
                <strong>1000+</strong>
                <span>lượt khám phá không gian</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <span>đánh giá trải nghiệm</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>sẵn sàng cho hành trình mua sắm</span>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroCardLarge}>
              <img
                src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
                alt="Không gian nội thất hiện đại"
              />
              <div className={styles.heroOverlay}>
                <p>Concept nổi bật</p>
                <h3>Căn hộ tối giản với điểm nhấn gỗ ấm</h3>
              </div>
            </div>

            <div className={styles.heroFloatingTop}>
              <span>Phong cách đề xuất</span>
              <strong>Modern Minimal</strong>
            </div>

            <div className={styles.heroFloatingBottom}>
              <CheckCircle2 size={18} />
              <div>
                <strong>Sẵn sàng mua ngay</strong>
                <span>Kết nối trực tiếp với danh mục sản phẩm</span>
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
              Hình ảnh lớn, giàu cảm xúc và nhịp điệu thị giác rõ ràng giúp
              trang chủ mang cảm giác biên tập thay vì chỉ là danh sách bán hàng.
            </p>
            <Link to="/products" className={styles.inlineLink}>
              Xem toàn bộ sản phẩm
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.showcaseGrid}>
            {inspirationRooms.map((room) => (
              <article key={room.title} className={styles.showcaseCard}>
                <img src={room.image} alt={room.title} />
                <div className={styles.showcaseOverlay}>
                  <span>{room.style}</span>
                  <h3>{room.title}</h3>
                  <div className={styles.showcaseMeta}>
                    <Eye size={16} />
                    <span>Xem cảm hứng</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.collectionSection}`}>
        <div className={styles.sectionHeadingLight}>
          <p className={styles.eyebrowLight}>Bộ sưu tập nổi bật</p>
          <h2>Những bộ sưu tập được tuyển chọn cho từng phong cách sống</h2>
          <p>
            Tập hợp các concept nổi bật để khách hàng dễ bắt đầu từ một gu thẩm
            mỹ cụ thể trước khi đi sâu vào từng món đồ.
          </p>
        </div>

        <div className={styles.collectionGrid}>
          {collections.map((collection) => (
            <article key={collection.title} className={styles.collectionCard}>
              <img src={collection.image} alt={collection.title} />
              <div className={styles.collectionOverlay}>
                <span>{collection.tag}</span>
                <h3>{collection.title}</h3>
                <p>{collection.subtitle}</p>
                <Link to="/products" className={styles.collectionLink}>
                  Khám phá ngay
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.productsHeader}>
          <div className={styles.sectionHeadingCompact}>
            <p className={styles.eyebrow}>Sản phẩm nổi bật</p>
            <h2>Khám phá nhanh những món đồ đang đại diện cho trải nghiệm mua sắm</h2>
          </div>

          <Link to="/products" className={styles.inlineLink}>
            Đi đến cửa hàng
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.productGrid}>
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              to={product.isFallback ? "/products" : `/products/${product.id}`}
              className={styles.productCard}
            >
              <div className={styles.productImageWrap}>
                <img src={product.image} alt={product.name} />
              </div>

              <div className={styles.productInfo}>
                <div className={styles.productRating}>
                  <Star size={14} fill="currentColor" />
                  <span>Đề xuất nổi bật</span>
                </div>
                <h3>{product.name}</h3>
                <p>{formatPrice(product.price)}</p>
              </div>
            </Link>
          ))}
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
