import { vi } from "vitest";

export function createMockReq(overrides = {}) {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
    ip: "127.0.0.1",
    socket: { remoteAddress: "127.0.0.1" },
    app: { get: () => undefined, set: () => undefined },
    user: undefined,
    ...overrides,
  };
}

export function createMockRes() {
  const res = {};
  res.statusCode = 200;
  res.headers = {};
  res.status = vi.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((payload) => {
    res.body = payload;
    return res;
  });
  res.setHeader = vi.fn((name, value) => {
    res.headers[name] = value;
    return res;
  });
  res.sendFile = vi.fn(() => res);
  return res;
}

export async function flushPromises() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}
