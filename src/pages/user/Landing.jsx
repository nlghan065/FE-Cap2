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
import styles from "../../styles/Landing.module.css";

const features = [
  {
    icon: Cpu,
    title: "Hiểu căn phòng trước khi chọn đồ",
    description:
      "Từ một ảnh chụp, VirtuSpace giúp bạn nhìn rõ bố cục hiện tại và những khoảng có thể tận dụng tốt hơn.",
  },
  {
    icon: Box,
    title: "AI gợi ý cách đặt đồ hợp lý",
    description:
      "Hệ thống đề xuất bố cục và món nội thất phù hợp với diện tích, nhu cầu sử dụng và cảm giác bạn muốn tạo ra.",
  },
  {
    icon: Palette,
    title: "Xem thử trước khi mua thật",
    description:
      "Bạn có thể so sánh vài phương án trong cùng một không gian để biết món nào hợp phòng, món nào nên bỏ qua.",
  },
  {
    icon: ShoppingBag,
    title: "Mua dễ hơn khi đã hình dung",
    description:
      "Khi đã thấy trước trong phòng của mình, việc chọn đúng món trở nên nhanh, đỡ lăn tăn và tự tin hơn.",
  },
];

const steps = [
  {
    number: "01",
    title: "Tải ảnh phòng của bạn",
    description:
      "Bắt đầu bằng một ảnh phòng thật để hệ thống hiểu bố cục, ánh sáng và diện tích bạn đang có.",
  },
  {
    number: "02",
    title: "Hệ thống phân tích & gợi ý",
    description:
      "AI đọc không gian và đề xuất phong cách, cách sắp đặt cùng các món nội thất phù hợp.",
  },
  {
    number: "03",
    title: "Xem và chỉnh sửa trong không gian 3D",
    description:
      "Preview kết quả, đổi vị trí hoặc phối lại để tìm phương án hợp mắt và hợp nhu cầu.",
  },
  {
    number: "04",
    title: "Mua những món phù hợp",
    description:
      "Chọn các sản phẩm đã được gợi ý cho căn phòng của bạn và mua với cảm giác chắc tay hơn.",
  },
];

const inspirationRooms = [
  {
    title: "Phòng khách đương đại",
    style: "Modern Balance",
    image:
      "https://i.pinimg.com/1200x/a9/2a/ea/a92aea04c0d7dbf54ef6346ee5d9a5c7.jpg",
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
      "https://i.pinimg.com/736x/04/a7/fa/04a7faf29212751ada0a182de6361c9f.jpg",
  },
];

const collections = [
  {
    title: "Valencia",
    subtitle:
      "Dễ áp cho phòng khách cần cảm giác ấm, sáng và thư giãn hơn sau khi lên preview.",
    tag: "Phong cách tối giản ấm",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Nordic Calm",
    subtitle:
      "Phù hợp với những không gian cần gọn hơn, sáng hơn và ít chi tiết thừa.",
    tag: "Phù hợp phòng nhỏ",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Urban Studio",
    subtitle:
      "Thường được chọn khi người dùng muốn tối ưu căn hộ hiện đại nhưng vẫn giữ điểm nhấn.",
    tag: "Được gợi ý nhiều",
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

const productContextNotes = [
  "Phù hợp không gian nhỏ",
  "Dễ phối với phong cách hiện đại",
  "Gợi ý cho phòng ngủ ấm",
  "Hợp góc sinh hoạt tối giản",
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
        image:
          item.images?.[0] ||
          fallbackProducts[index % fallbackProducts.length].image,
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
              <span>AI-powered room visualization</span>
            </div>

            <h1 className={styles.heroTitle}>
              Xem trước không gian sống của bạn
              <span> trước khi quyết định mua bất kỳ món đồ nào</span>
            </h1>

            <p className={styles.heroDescription}>
              Tải ảnh phòng của bạn, nhận gợi ý nội thất và bố cục phù hợp từ
              AI, rồi xem trước mọi thứ trông như thế nào trước khi chọn mua.
            </p>

            <div className={styles.heroActions}>
              <Link to="/ai-designer" className={styles.primaryButton}>
                <Wand2 size={18} />
                <span>Thử với phòng của bạn</span>
              </Link>

              <Link to="/ai-demo" className={styles.secondaryButton}>
                <Eye size={18} />
                <span>Xem demo</span>
              </Link>
            </div>

            <div className={styles.trustRow}>
              <div>
                <strong>1000+</strong>
                <span>lượt thử bố trí không gian</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <span>đánh giá trải nghiệm xem trước</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>sẵn sàng để bạn thử với phòng thật</span>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroCardLarge}>
              <img
                src="https://file.hstatic.net/1000360516/file/mau-phong-khach-hien-dai-2b_057ca737bf5f47ad833f0598dc4181e0_1024x1024.jpg"
                alt="Không gian nội thất hiện đại"
              />
              <div className={styles.heroOverlay}></div>
            </div>

            <div className={styles.heroFloatingTop}>
              <span>AI đề xuất</span>
              <strong>Modern Minimal</strong>
            </div>

            <div className={styles.heroFloatingBottom}>
              <CheckCircle2 size={18} />
              <div>
                <strong>Dễ quyết định hơn</strong>
                <span>So sánh bố cục và chọn đúng món trước khi mua</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Giá trị cốt lõi</p>
          <h2>Từ một bức ảnh đến quyết định mua tự tin hơn</h2>
          <p>
            VirtuSpace không bắt bạn tưởng tượng mơ hồ. Bạn nhìn rõ phòng của
            mình, nhận gợi ý phù hợp và chỉ mua khi đã thấy trước.
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

      <section
        id="quy-trinh"
        className={`${styles.section} ${styles.processSection}`}
      >
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Cách hoạt động</p>
          <h2>4 bước để đi từ ảnh phòng thật tới quyết định mua rõ ràng</h2>
          <p>
            Đây là luồng sử dụng thực tế của VirtuSpace: tải ảnh, để AI phân
            tích, xem trong không gian 3D và mua đúng món hợp phòng.
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
            <p className={styles.eyebrow}>Thử phong cách nhanh</p>
            <h2>
              Thử nhanh các phong cách trước khi áp dụng vào phòng của bạn
            </h2>
            <p>
              Mỗi concept là một hướng tham chiếu để bạn áp lên bản preview của
              mình, so sánh nhanh trước khi chốt cách bài trí.
            </p>
            <Link to="/ai-designer" className={styles.inlineLink}>
              Áp dụng vào phòng của bạn
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
                    <span>Thử trên bản xem trước</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.collectionSection}`}>
        <div className={styles.sectionHeadingLight}>
          <p className={styles.eyebrowLight}>Bộ sưu tập gợi ý</p>
          <h2>
            Những bộ sưu tập giúp bạn đi tiếp từ bản preview tới món đồ phù hợp
          </h2>
          <p>
            Sau khi xem bố cục AI gợi ý, bạn có thể bắt đầu nhanh với các nhóm
            sản phẩm hợp diện tích, phong cách và cảm giác không gian của mình.
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
                  Xem các món phù hợp
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
            <p className={styles.eyebrow}>Món đồ nên xem tiếp</p>
            <h2>
              Các sản phẩm dễ bắt đầu sau khi bạn đã có gợi ý cho không gian
            </h2>
          </div>

          <Link to="/products" className={styles.inlineLink}>
            Xem toàn bộ sản phẩm
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.productGrid}>
          {featuredProducts.map((product, index) => (
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
                  <span>AI gợi ý</span>
                </div>
                <h3>{product.name}</h3>
                <p className={styles.productPrice}>
                  {formatPrice(product.price)}
                </p>
                <p className={styles.productNote}>
                  {productContextNotes[index % productContextNotes.length]}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <div>
            <p className={styles.eyebrow}>Bắt đầu với ảnh thật</p>
            <h2>
              Tải ảnh phòng của bạn và xem trước kết quả chỉ trong vài giây
            </h2>
            <p className={styles.ctaText}>
              Từ một ảnh chụp đơn giản, bạn có thể nhận gợi ý bố cục, xem trước
              không gian và chọn món phù hợp với cảm giác chắc chắn hơn.
            </p>
          </div>

          <div className={styles.ctaActions}>
            <Link to="/ai-designer" className={styles.primaryButton}>
              <Wand2 size={18} />
              <span>Thử ngay</span>
            </Link>
            <Link to="/ai-demo" className={styles.secondaryButton}>
              <Eye size={18} />
              <span>Xem demo</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
