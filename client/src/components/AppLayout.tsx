import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { to: "/", label: "Tổng quan" },
  { to: "/students", label: "Học sinh" },
  { to: "/classes", label: "Lớp học" },
  { to: "/subjects", label: "Môn học" },
  { to: "/schedule", label: "Lịch học" },
  { to: "/tuitions", label: "Học phí" },
  { to: "/reports", label: "Báo cáo" },
];

export function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white p-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-6 w-full rounded px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100"
        >
          Đăng xuất
        </button>
      </aside>
      <main className="flex-1 bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
