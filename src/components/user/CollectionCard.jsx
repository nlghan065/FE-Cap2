// import styles from "../../styles/Products.module.css";
// import { Tag } from "lucide-react";

// function CollectionCard({ item, index, onClick }) {
//   const colors = [
//     "rgba(255,140,0,0.6)",
//     "rgba(0,102,204,0.5)",
//     "rgba(0,150,100,0.5)",
//   ];

//   return (
//     <div
//       className={styles.collectionCard}
//       style={{ backgroundImage: `url(${item.image})` }}
//       onClick={onClick}
//     >
//       {/* overlay */}
//       <div
//         className={styles.collectionOverlay}
//         style={{ backgroundColor: colors[index % 3] }}
//       />

//       {/* content */}
//       <div className={styles.collectionContent}>
//         <div className={styles.collectionCount}>
//           <Tag size={16} />
//           <span>{item.count} sản phẩm</span>
//         </div>

//         <h3>{item.title}</h3>
//         <p>{item.subtitle}</p>

//         <div className={styles.collectionLink}>Khám phá ngay →</div>
//       </div>
//     </div>
//   );
// }

// export default CollectionCard;
