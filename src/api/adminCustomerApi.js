import axios from "axios";

// ================= BASE CLIENT =================
const createClient = () => {
  const instance = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use((config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  return instance;
};

const api = createClient();

// ================= HELPER =================
const normalize = (s) => s?.trim().toLowerCase();

// ================= PROFILE API =================

// 📥 LIST PROFILES
export const getProfilesApi = async (page = 0, size = 10) => {
  const res = await api.get("/profiles", {
    params: { page, size },
  });

  const data = res.data?.data;

  return {
    data: data?.content || [],
    totalPages: data?.totalPages || 1,
  };
};

// 👁️ DETAIL
export const getProfileByIdApi = async (id) => {
  if (!id) throw new Error("Invalid ID");

  const res = await api.get(`/profiles/${id}`);
  return res.data?.data;
};

// ✏️ UPDATE
export const updateProfileApi = async (id, body) => {
  return await api.put(`/profiles/${id}`, body);
};

// 🗑️ DELETE
export const deleteProfileApi = async (id) => {
  return await api.delete(`/profiles/${id}`);
};

// ================= ORDER API =================

let cachedOrders = null;

export const getOrdersApi = async () => {
  if (cachedOrders) return cachedOrders;

  const res = await api.get("/admin/orders", {
    params: { page: 0, size: 1000 },
  });

  cachedOrders = res.data?.data?.content || [];
  return cachedOrders;
};

// ================= CUSTOMER FULL (MERGE) =================

export const getCustomersFullApi = async (page = 0, size = 10) => {
  try {
    const { data: profiles } = await getProfilesApi(0, 1000);
    const orders = await getOrdersApi();

    const map = {};

    // ===== PROFILE =====
    profiles.forEach((p) => {
      const key = normalize(p.email);

      map[key] = {
        id: p.id,
        name: p.fullName,
        fullName: p.fullName,
        email: p.email,
        phone: p.phone,

        // ✅ THÊM FULL DATA
        address: p.address,
        city: p.city,
        ward: p.ward,
        gender: p.gender,
        dateOfBirth: p.dateOfBirth,

        totalOrders: 0,
        totalSpent: 0,
        firstOrderDate: null,
        createdAt: p.createdAt || null,
        status: "CANCELLED",
        hasProfile: true,
      };
    });

    // ===== ORDER =====
    orders.forEach((o) => {
      const key = normalize(o.customerEmail);
      if (!key) return;

      if (!map[key]) {
        map[key] = {
          id: null,
          name: o.customerName || "Khách lẻ",
          email: o.customerEmail,
          phone: o.customerPhone || "",

          // ✅ thêm default
          address: null,
          city: null,
          ward: null,
          gender: null,
          dateOfBirth: null,

          totalOrders: 0,
          totalSpent: 0,
          firstOrderDate: null,
          createdAt: null,
          status: "ACTIVE",
          hasProfile: false,
        };
      }

      map[key].totalOrders += 1;
      map[key].totalSpent += o.totalAmount || 0;

      if (
        !map[key].firstOrderDate ||
        new Date(o.createdAt) < new Date(map[key].firstOrderDate)
      ) {
        map[key].firstOrderDate = o.createdAt;
      }
    });

    // ===== STATUS =====
    Object.values(map).forEach((c) => {
      c.status = c.totalOrders > 0 ? "ACTIVE" : "CANCELLED";
    });

    // ===== SORT =====
    const allCustomers = Object.values(map).sort(
      (a, b) => b.totalSpent - a.totalSpent,
    );

    // ===== PAGINATION =====
    const start = page * size;
    const paginated = allCustomers.slice(start, start + size);

    return {
      data: paginated,
      totalPages: Math.ceil(allCustomers.length / size),
    };
  } catch (e) {
    console.log("====== ERROR FULL ======");
    console.log(e);

    console.log("====== RESPONSE ======");
    console.log(e.response);

    console.log("====== DATA ======");
    console.log(e.response?.data);

    console.log("====== STATUS ======");
    console.log(e.response?.status);

    setError(e.response?.data?.message || "Cập nhật thất bại");
  }
};

export const getUserByIdApi = async (id) => {
  if (!id) throw new Error("Invalid user ID");

  const res = await api.get(`/users/${id}`);
  return res.data?.data;
};
