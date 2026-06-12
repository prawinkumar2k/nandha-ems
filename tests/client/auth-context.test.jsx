// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../../client/contexts/AuthContext.jsx";

function Consumer() {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="user">{auth.user ? auth.user.email : "none"}</div>
      <div data-testid="authenticated">{String(auth.isAuthenticated)}</div>
      <button onClick={() => auth.updateUser({ name: "Updated" })}>update</button>
      <button onClick={() => auth.logout()}>logout</button>
      <button
        onClick={async () => {
          await auth.login("alice@example.com", "Secret123!");
        }}
      >
        login
      </button>
    </div>
  );
}

function FailureConsumer() {
  const auth = useAuth();
  const [error, setError] = React.useState("");
  return (
    <div>
      <button
        onClick={async () => {
          try {
            await auth.login("alice@example.com", "Secret123!");
          } catch (err) {
            setError(err.message);
          }
        }}
      >
        login
      </button>
      <div data-testid="error">{error}</div>
    </div>
  );
}

function renderAuth(view = <Consumer />) {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{view}</AuthProvider>
    </QueryClientProvider>,
  );
  return queryClient;
}

beforeEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe("AuthProvider", () => {
  it("loads a stored user from session storage on mount", async () => {
    sessionStorage.setItem(
      "user",
      JSON.stringify({ email: "stored@example.com", role: "student" }),
    );

    renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("stored@example.com");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });
  });

  it("updates the stored user and session snapshot", async () => {
    renderAuth();

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    });

    fireEvent.click(screen.getByText("update"));

    await waitFor(() => {
      expect(JSON.parse(sessionStorage.getItem("user"))).toEqual(
        expect.objectContaining({ name: "Updated" }),
      );
    });
  });

  it("logs in and stores the returned session data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            token: "token-123",
            user: {
              id: "u1",
              email: "alice@example.com",
              name: "Alice",
              role: "student",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    renderAuth();
    fireEvent.click(screen.getByText("login"));

    await waitFor(() => {
      expect(sessionStorage.getItem("authToken")).toBe("token-123");
      expect(JSON.parse(sessionStorage.getItem("user"))).toEqual(
        expect.objectContaining({ email: "alice@example.com" }),
      );
      expect(screen.getByTestId("user")).toHaveTextContent("alice@example.com");
    });
  });

  it("surfaces unsuccessful login responses without mutating session state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ message: "Invalid credentials" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    renderAuth(<FailureConsumer />);
    fireEvent.click(screen.getByText("login"));

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Invalid credentials");
      expect(sessionStorage.getItem("authToken")).toBeNull();
      expect(sessionStorage.getItem("user")).toBeNull();
    });
  });

  it("clears session data and query cache on logout", async () => {
    const queryClient = new QueryClient();
    const clearSpy = vi.spyOn(queryClient, "clear");
    sessionStorage.setItem("authToken", "token-123");
    sessionStorage.setItem("user", JSON.stringify({ email: "alice@example.com" }));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ message: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByText("logout"));

    await waitFor(() => {
      expect(sessionStorage.getItem("authToken")).toBeNull();
      expect(sessionStorage.getItem("user")).toBeNull();
      expect(clearSpy).toHaveBeenCalledTimes(1);
    });
  });
});
