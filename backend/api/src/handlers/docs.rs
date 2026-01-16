use axum::response::Html;
use axum::Json;
use serde_json::json;

pub async fn docs_ui() -> Html<&'static str> {
    Html(
        r#"<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>KWAMI API Docs</title>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </head>
  <body>
    <api-reference data-url="/openapi.json"></api-reference>
  </body>
</html>
"#,
    )
}

pub async fn openapi_spec() -> Json<serde_json::Value> {
    Json(json!({
        "openapi": "3.0.3",
        "info": {
            "title": "KWAMI API",
            "version": "0.1.0"
        },
        "servers": [
            { "url": "/" }
        ],
        "paths": {
            "/health": {
                "get": {
                    "summary": "Health check",
                    "responses": {
                        "200": {
                            "description": "OK",
                            "content": {
                                "text/plain": {
                                    "schema": { "type": "string" }
                                }
                            }
                        }
                    }
                }
            },
            "/auth/nonce": {
                "post": {
                    "summary": "Generate nonce",
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": { "$ref": "#/components/schemas/NonceRequest" }
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "Nonce response",
                            "content": {
                                "application/json": {
                                    "schema": { "$ref": "#/components/schemas/NonceResponse" }
                                }
                            }
                        },
                        "400": { "description": "Bad request" },
                        "500": { "description": "Server error" }
                    }
                }
            },
            "/auth/login": {
                "post": {
                    "summary": "Login with wallet signature",
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": { "$ref": "#/components/schemas/LoginRequest" }
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "Login response",
                            "content": {
                                "application/json": {
                                    "schema": { "$ref": "#/components/schemas/LoginResponse" }
                                }
                            }
                        },
                        "401": { "description": "Unauthorized" },
                        "500": { "description": "Server error" }
                    }
                }
            },
            "/me/owned-kwamis": {
                "get": {
                    "summary": "Get owned KWAMIs",
                    "security": [{ "bearerAuth": [] }],
                    "responses": {
                        "200": {
                            "description": "Owned KWAMIs",
                            "content": {
                                "application/json": {
                                    "schema": { "$ref": "#/components/schemas/OwnedKwamisResponse" }
                                }
                            }
                        },
                        "401": { "description": "Unauthorized" }
                    }
                }
            },
            "/auth/select-kwami": {
                "post": {
                    "summary": "Select a KWAMI as active identity",
                    "security": [{ "bearerAuth": [] }],
                    "requestBody": {
                        "required": true,
                        "content": {
                            "application/json": {
                                "schema": { "$ref": "#/components/schemas/SelectKwamiRequest" }
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "Selection response",
                            "content": {
                                "application/json": {
                                    "schema": { "$ref": "#/components/schemas/SelectKwamiResponse" }
                                }
                            }
                        },
                        "401": { "description": "Unauthorized" }
                    }
                }
            }
        },
        "components": {
            "securitySchemes": {
                "bearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT"
                }
            },
            "schemas": {
                "NonceRequest": {
                    "type": "object",
                    "required": ["pubkey"],
                    "properties": {
                        "pubkey": { "type": "string" }
                    }
                },
                "NonceResponse": {
                    "type": "object",
                    "required": ["nonce", "message", "expires_in"],
                    "properties": {
                        "nonce": { "type": "string", "format": "uuid" },
                        "message": { "type": "string" },
                        "expires_in": { "type": "integer", "format": "int64" }
                    }
                },
                "LoginRequest": {
                    "type": "object",
                    "required": ["pubkey", "signature", "message", "nonce", "kwami_mint"],
                    "properties": {
                        "pubkey": { "type": "string" },
                        "signature": { "type": "string" },
                        "message": { "type": "string" },
                        "nonce": { "type": "string", "format": "uuid" },
                        "kwami_mint": { "type": "string" }
                    }
                },
                "LoginResponse": {
                    "type": "object",
                    "required": ["token", "owned_kwamis", "pubkey"],
                    "properties": {
                        "token": { "type": "string" },
                        "owned_kwamis": {
                            "type": "array",
                            "items": { "$ref": "#/components/schemas/KwamiInfo" }
                        },
                        "pubkey": { "type": "string" }
                    }
                },
                "KwamiInfo": {
                    "type": "object",
                    "required": ["mint", "name", "symbol", "uri"],
                    "properties": {
                        "mint": { "type": "string" },
                        "name": { "type": "string" },
                        "symbol": { "type": "string" },
                        "uri": { "type": "string" },
                        "image": { "type": "string", "nullable": true },
                        "attributes": {
                            "type": "array",
                            "nullable": true,
                            "items": { "$ref": "#/components/schemas/Attribute" }
                        }
                    }
                },
                "Attribute": {
                    "type": "object",
                    "required": ["trait_type", "value"],
                    "properties": {
                        "trait_type": { "type": "string" },
                        "value": { "type": "string" }
                    }
                },
                "SelectKwamiRequest": {
                    "type": "object",
                    "required": ["kwami_mint"],
                    "properties": {
                        "kwami_mint": { "type": "string" }
                    }
                },
                "SelectKwamiResponse": {
                    "type": "object",
                    "required": ["token", "kwami_mint", "message"],
                    "properties": {
                        "token": { "type": "string" },
                        "kwami_mint": { "type": "string" },
                        "message": { "type": "string" }
                    }
                },
                "OwnedKwamisResponse": {
                    "type": "object",
                    "required": ["owned_kwamis", "count"],
                    "properties": {
                        "owned_kwamis": {
                            "type": "array",
                            "items": { "$ref": "#/components/schemas/KwamiInfo" }
                        },
                        "count": { "type": "integer", "format": "int64" }
                    }
                }
            }
        }
    }))
}
