import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";

const mockEmit = vi.fn();
const rooms = new Map();
const sockets = [];

class mockSocketServer {
  constructor(server, options) {
    this.server = server;
    this.options = options;
    this.handlers = {};
    this.sockets = { adapter: { rooms } };
    mockSocketServer.instances.push(this);
  }

  on(event, cb) {
    this.handlers[event] = cb;
  }

  to(room) {
    return {
      emit: (event, payload) => mockEmit(room, event, payload),
    };
  }
}

mockSocketServer.instances = [];

vi.mock("socket.io", () => ({
  Server: mockSocketServer,
}));

const modelMap = {
  Device: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    updateMany: vi.fn(),
    countDocuments: vi.fn(),
    find: vi.fn(),
  },
  User: {
    countDocuments: vi.fn(),
  },
  Exam: {
    countDocuments: vi.fn(),
  },
  Submission: {
    countDocuments: vi.fn(),
  },
};

vi.spyOn(mongoose, "model").mockImplementation((name) => {
  const model = modelMap[name];
  if (!model) throw new Error(`Unexpected model ${name}`);
  return model;
});

const {
  initSocket,
  getIO,
  notifyViolation,
  notifyActivity,
  updateDeviceStatus,
  broadcastSystemStats,
} = await import("../../server/socket.js");

function createFakeSocket() {
  const handlers = {};
  const socket = {
    id: `socket-${sockets.length + 1}`,
    join: vi.fn((room) => {
      if (!rooms.has(room)) rooms.set(room, new Set());
      rooms.get(room).add(socket.id);
    }),
    on: vi.fn((event, cb) => {
      handlers[event] = cb;
    }),
    emit: vi.fn(),
    disconnect: vi.fn(),
    removeAllListeners: vi.fn(),
    handlers,
  };
  sockets.push(socket);
  return socket;
}

describe("socket service", () => {
  beforeEach(() => {
    mockEmit.mockClear();
    rooms.clear();
    sockets.length = 0;
    Object.values(modelMap).forEach((model) => {
      Object.values(model).forEach((fn) => fn.mockReset?.());
    });
    mockSocketServer.instances.length = 0;
  });

  it("throws before initialization", () => {
    expect(() => getIO()).toThrow("Socket.io not initialized!");
  });

  it("registers dashboard and exam-room listeners", () => {
    const io = initSocket({});
    const socket = createFakeSocket();

    io.handlers.connection(socket);
    socket.handlers["join-dashboard"]();
    socket.handlers["join-exam-room-monitoring"]("exam-1");

    expect(socket.join).toHaveBeenCalledWith("admin-dashboard");
    expect(socket.join).toHaveBeenCalledWith("monitoring-exam-1");
  });

  it("broadcasts screen updates with rate limiting", () => {
    const io = initSocket({});
    const socket = createFakeSocket();
    io.handlers.connection(socket);
    socket.handlers["join-exam-room-monitoring"]("exam-1");

    socket.handlers["screen-data"]({
      examId: "exam-1",
      frame: "frame-1",
      studentId: "student-1",
      studentName: "Student",
      studentRoll: "R1",
      violationCount: 2,
    });
    socket.handlers["screen-data"]({
      examId: "exam-1",
      frame: "frame-2",
      studentId: "student-1",
      studentName: "Student",
      studentRoll: "R1",
      violationCount: 3,
    });

    expect(mockEmit).toHaveBeenCalledWith(
      "monitoring-exam-1",
      "screen-update",
      expect.objectContaining({
        studentId: "student-1",
        studentName: "Student",
        studentRoll: "R1",
        frame: "frame-1",
        violationCount: 2,
      }),
    );
    expect(mockEmit).toHaveBeenCalledTimes(1);
  });

  it("publishes helper notifications to the admin dashboard room", async () => {
    initSocket({});
    notifyViolation({ id: "v1" });
    notifyActivity({ id: "a1" });
    updateDeviceStatus("device-1", "offline");

    expect(mockEmit).toHaveBeenCalledWith("admin-dashboard", "new-violation", { id: "v1" });
    expect(mockEmit).toHaveBeenCalledWith("admin-dashboard", "new-activity", { id: "a1" });
    expect(mockEmit).toHaveBeenCalledWith("admin-dashboard", "device-update", {
      deviceId: "device-1",
      status: "offline",
    });
  });

  it("broadcasts system stats from the current model state", async () => {
    initSocket({});
    modelMap.User.countDocuments.mockResolvedValueOnce(12).mockResolvedValueOnce(4);
    modelMap.Device.countDocuments.mockResolvedValueOnce(3).mockResolvedValueOnce(2);
    modelMap.Exam.countDocuments.mockResolvedValueOnce(1);
    modelMap.Submission.countDocuments.mockResolvedValueOnce(5);

    await broadcastSystemStats();

    expect(mockEmit).toHaveBeenCalledWith(
      "admin-dashboard",
      "stats-update",
      expect.objectContaining({
        students: 12,
        faculty: 4,
        devices: 3,
        online: 2,
        activeExams: 1,
        violationsToday: 5,
      }),
    );
  });
});
