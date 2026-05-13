# Debug Layout Placement Issue

## Vấn đề

- API layout trả về 200 OK
- Nhưng UI hiển thị "0/20 vị trí AI"
- Đồ nội thất không được positioned từ AI layout

## Nguyên nhân

`product.layoutPlacement` luôn undefined → `getAiLayoutPlacement()` không tìm được placement.

## Debugging Steps

### 1. Check Browser Console cho logs sau:

#### **Step 1: Layout API Request**

```
[AI Layout FE] POST /api/ai-layout/generate
[AI Layout FE] request payload {room: {...}, recommendation: {...}, topK: 20, minScore: 0.55, ...}
[AI Layout FE] response status 200
[AI Layout FE] response data {...}
```

Kiểm tra:

- `room` có `widthM`, `lengthM`, `heightM` với giá trị hợp lý (3-6 cho phòng bình thường)?
- `recommendation.products` có mấy sản phẩm?
- Response có `items` array không?

#### **Step 2: Normalize Layout Result**

```
[normalizeAiLayoutResult] rawItems count: X
[normalizeAiLayoutResult] rawItems[0]: {...}
[normalizeAiLayoutResult] Item 0 position is null. Item: {...}
[normalizeAiLayoutResult] Item 0 normalized: {...}
[normalizeAiLayoutResult] After filter items count: Y
```

Kiểm tra:

- `rawItems count` = bao nhiêu?
- Có items bị filter vì position = null?
- Final items count = bao nhiêu?

**Nếu rawItems > 0 nhưng After filter = 0:**
→ Items bị lọc vì position parsing failed
→ Backend trả position format không khớp

#### **Step 3: Merge Result**

```
[mergeAiLayoutResult] layout.items count: X
[mergeAiLayoutResult] layout.items sample: {...}
[mergeAiLayoutResult] layoutById map size: X layoutByName map size: Y
[mergeAiLayoutResult] Product 0 (product name) - NO placement found. productId:"..." productName:"..."
[mergeAiLayoutResult] Product 0 (product name) - PLACED position: [x, y, z]
[mergeAiLayoutResult] Result: X/Y products placed
```

Kiểm tra:

- `layout.items count` = bao nhiêu?
- `layoutById map size` = bao nhiêu? (phải > 0)
- Bao nhiêu sản phẩm matched?

**Nếu Result: 0/20 products placed:**
→ Mapping failed, ID không khớp hoặc layout.items empty

#### **Step 4: Get AI Layout Placement**

```
[getAiLayoutPlacement] No placement found for product: Product Name (id: abc)
```

Nếu thấy log này:
→ `product.layoutPlacement` undefined
→ Vấn đề ở mergeAiLayoutResult

### 2. Fix Cases

#### Case A: rawItems = 0

**Vấn đề:** Backend không trả items  
**Fix:** Check backend response structure, có thể items ở `data.layout.items` thay vì `data.items`

#### Case B: rawItems > 0 nhưng After filter = 0

**Vấn đề:** Position format không khớp  
**Fix:** Xem item sample, check xem position nằm ở field nào (có thể `pos`, `location`, `center`, v.v.)

#### Case C: After filter > 0 nhưng Result = 0 products placed

**Vấn đề:** ID matching failed  
**Fix:** Check:

- `layout.items[0].productId` = `product.id` không?
- Hay cần match bằng `product.name`?

#### Case D: layoutById map = 0

**Vấn đề:** Layout items không có `productId`  
**Fix:** Backend cần trả `productId` trong items, hoặc sửa logic match bằng name

## Quick Test

1. Mở Browser DevTools → Console tab
2. Gọi AI Designer
3. Click "Generate Layout"
4. Xem console logs
5. Copy logs có relevance sang share

## Key Fields to Check

**Backend Response Samples:**

### Tốt (layout.items)

```javascript
{
  status: 200,
  data: {
    items: [
      {
        productId: "product-abc",
        position: [1.5, 0, 2.0],
        rotation: 0,
        score: 0.95
      }
    ]
  }
}
```

### Không tốt (items bị nested)

```javascript
{
  status: 200,
  data: {
    layout: {
      items: [...]  // ← items ở trong layout
    }
  }
}
```

### Không tốt (position format khác)

```javascript
{
  status: 200,
  data: {
    items: [
      {
        productId: "abc",
        coordinates: [1.5, 0, 2.0],  // ← khác tên field
        ...
      }
    ]
  }
}
```

## Files Modified

- `src/utils/aiRecommendResultV2.js`: Added debug logs to `mergeAiLayoutResult()` and `normalizeAiLayoutResult()`
- `src/pages/user/Viewer3DPage.jsx`: Added debug log to `getAiLayoutPlacement()`, fixed duplicate code

## Next Steps After Checking Logs

1. Nếu Case A/B/C: Sẽ sửa `extractLayoutItems()` để xử lý format khác
2. Nếu Case D: Sẽ sửa `mergeAiLayoutResult()` để match khác cách
3. Nếu position format khác: Sẽ thêm fallback parsing
