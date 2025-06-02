import { render, screen, fireEvent } from "@testing-library/react";
import Room from "../screens/room/Room";
import { BrowserRouter } from "react-router-dom";
import { Server } from "mock-socket";
import "@testing-library/jest-dom";

describe("Room Component", () => {
  let mockServer: Server;

  beforeAll(() => {
    mockServer = new Server("ws://localhost:4000");
  });

  afterAll(() => {
    mockServer.stop();
  });

  it("renders the room and user video", () => {
    render(<Room />);

    expect(screen.getByText(/leave room/i)).toBeInTheDocument();
    expect(screen.getByRole("video")).toBeInTheDocument();
  });

  it("toggles video state on button click", () => {
    render(
      <BrowserRouter>
        <Room />
      </BrowserRouter>
    );

    const toggleVideoButton = screen.getByRole("button", { name: /videocam/i });
    fireEvent.click(toggleVideoButton);

    // Assert that the video toggle state changed
    expect(toggleVideoButton).toContainHTML(
      '<svg data-testid="VideocamOffIcon"'
    );
  });

  it("handles peer connection updates", () => {
    render(
      <BrowserRouter>
        <Room />
      </BrowserRouter>
    );

    // Simulate user joining
    mockServer.emit("user joined", {
      signal: {},
      callerID: "peer_1",
      userName: "TestUser",
    });

    expect(screen.getByText(/testuser/i)).toBeInTheDocument();
  });

  it("removes disconnected peers", () => {
    render(
      <BrowserRouter>
        <Room />
      </BrowserRouter>
    );

    // Simulate peer leaving
    mockServer.emit("remove-user", "peer_1");

    expect(screen.queryByText(/testuser/i)).not.toBeInTheDocument();
  });
});
