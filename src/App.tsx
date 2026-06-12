import { Authenticated, Unauthenticated } from "convex/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Dashboard from "@/pages/dashboard";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Order from "@/pages/order";
import PortalLogin from "@/pages/portal-login";
import Profile from "@/pages/profile";

import { Layout } from "@/components/layout";

import { usePortalLink } from "./hooks/use-portals-link";

export default function App() {
  usePortalLink();
  return (
    <BrowserRouter>
      <Authenticated>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/order" element={<Order />} />
          </Routes>
        </Layout>
      </Authenticated>

      <Unauthenticated>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/login/:portalId" element={<PortalLogin />} />
        </Routes>
      </Unauthenticated>
    </BrowserRouter>
  );
}
