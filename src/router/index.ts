import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "@/supabase";

export interface RouteMeta {
  title?: string;
  requiresAuth?: boolean;
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("../views/Home.vue"),
      meta: { title: "藏品一覽" },
    },
    {
      path: "/item/:id",
      name: "ItemDetail",
      component: () => import("../views/ItemDetail.vue"),
      meta: { title: "藏品詳情" },
    },
    {
      path: "/item/:id/edit",
      name: "EditItem",
      component: () => import("../views/EditItem.vue"),
      meta: { title: "編輯藏品", requiresAuth: true },
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("../views/Login.vue"),
      meta: { title: "登入" },
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: () => import("../views/Dashboard.vue"),
      meta: { title: "新增藏品", requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
  document.title = (to.meta as RouteMeta).title
    ? `${(to.meta as RouteMeta).title} | 古董收藏`
    : "古董收藏";
  if ((to.meta as RouteMeta).requiresAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return next({ name: "Login" });
  }
  next();
});

export default router;
