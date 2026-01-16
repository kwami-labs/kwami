# AI Agent Instructions

## LiveKit Documentation

Always use the LiveKit Docs MCP Server to ensure your code is grounded in the latest documentation.

**MCP Server Endpoint:** `https://docs.livekit.io/mcp`

### For Cursor IDE

The LiveKit MCP server is already configured in this workspace. When generating code or answering questions about LiveKit, always consult the MCP server for accurate, up-to-date information.

### Key LiveKit Concepts

- **Rooms**: Virtual spaces where participants connect
- **Participants**: Users or agents in a room
- **Tracks**: Audio/video streams
- **Agents**: AI-powered participants that can interact in real-time

### Backend API

Our backend (`backend/api/`) provides a Rust-based proxy for LiveKit services:

- Token generation for secure room access
- Room management (create, list, delete)
- Participant management
- Agent integration

Always refer to the LiveKit MCP server for the most current API documentation and best practices.
