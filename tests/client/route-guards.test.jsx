// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "../../client/routes/ProtectedRoutes.jsx";
import { ROUTES } from "../../client/core/constants/routes.js";

const mockUseAuth = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/shared/components/Loader/Loader", () => ({
  PageLoader: ({ message }) => <div data-testid="loader">{message}</div>,
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

beforeEach(() => {
  mockUseAuth.mockReset();
});

describe("ProtectedRoute", () => {
  it("renders the loader while auth is loading", () => {
    mockUseAuth.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <ProtectedRoute allowedRoles="admin">
          <div>admin content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("loader")).toHaveTextContent("Authenticating");
  });

  it("redirects unauthenticated visitors to login", async () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles="admin">
                <div>admin content</div>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent(ROUTES.LOGIN);
    });
  });

  it("redirects unauthorized roles to the unauthorized page", async () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { role: "student" },
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles="admin">
                <div>admin content</div>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent(ROUTES.UNAUTHORIZED);
    });
  });

  it("renders children for authorized roles", () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { role: "admin" },
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <ProtectedRoute allowedRoles="admin">
          <div>admin content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("admin content")).toBeInTheDocument();
  });
});

describe("GuestRoute", () => {
  it("sends authenticated users to their role home", async () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { role: "faculty" },
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <div>login form</div>
              </GuestRoute>
            }
          />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent("/faculty");
    });
  });

  it("renders guest content for anonymous users", () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <GuestRoute>
          <div>login form</div>
        </GuestRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("login form")).toBeInTheDocument();
  });
});
