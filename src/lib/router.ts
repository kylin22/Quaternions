import { createRouter, createWebHistory, Router, RouteRecordRaw } from "vue-router";

import Index from "@/components/Index.vue";

const routes: Array<RouteRecordRaw> = [
  {
    component: Index,
    path: "/",
    name: "index"
  }
];

const router: Router = createRouter({
  history: createWebHistory(),
  routes
});

router.afterEach((to) => {
  const baseTitle = "Quaternion";

  if (to.name === "index") {
    document.title = baseTitle;
  } else {
    document.title = `${to.meta.title} | ${baseTitle}`;
  }
});

export default router;
