/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/qwami_token.json`.
 */
export type QwamiToken = {
  "address": "6CAgdgpPq8Np78LsDwREJqFPh9rM5Jh6RSS8eZ37kZuv",
  "metadata": {
    "name": "qwamiToken",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "QWAMI SPL Token - Integer token with 1 trillion supply, powering KWAMI AI ecosystem"
  },
  "instructions": [
    {
      "name": "burnTokens",
      "docs": [
        "Burn QWAMI tokens"
      ],
      "discriminator": [
        76,
        15,
        51,
        254,
        229,
        215,
        121,
        66
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true,
          "relations": [
            "tokenAuthority"
          ]
        },
        {
          "name": "tokenAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "source",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize the QWAMI token, authority, and treasury"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "mint",
          "docs": [
            "QWAMI mint account must be created off-chain (so this instruction stays under the SBF stack limit)"
          ],
          "writable": true
        },
        {
          "name": "tokenAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  119,
                  97,
                  109,
                  105,
                  45,
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "mintTokens",
      "docs": [
        "Mint new QWAMI tokens (authority only)"
      ],
      "discriminator": [
        59,
        132,
        24,
        246,
        122,
        39,
        8,
        243
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true,
          "relations": [
            "tokenAuthority"
          ]
        },
        {
          "name": "tokenAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "destination",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "tokenAuthority"
          ]
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "mintWithSol",
      "docs": [
        "Mint QWAMI tokens by paying with SOL (SOL-only MVP).",
        "QWAMI amount is derived from lamports at a fixed ratio:",
        "1 SOL (1,000,000,000 lamports) = 1,000 QWAMI."
      ],
      "discriminator": [
        189,
        31,
        158,
        202,
        48,
        34,
        190,
        162
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true,
          "relations": [
            "tokenAuthority"
          ]
        },
        {
          "name": "tokenAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  119,
                  97,
                  109,
                  105,
                  45,
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "treasuryAuthority",
          "docs": [
            "The wallet that receives SOL proceeds (must match `treasury.authority`)."
          ],
          "writable": true
        },
        {
          "name": "buyerQwamiAccount",
          "docs": [
            "Buyer's QWAMI token account (receives minted tokens)"
          ],
          "writable": true
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "solLamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferAuthority",
      "docs": [
        "Transfer authority to a new address"
      ],
      "discriminator": [
        48,
        169,
        76,
        72,
        229,
        180,
        55,
        161
      ],
      "accounts": [
        {
          "name": "tokenAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "token_authority.mint",
                "account": "tokenAuthority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "tokenAuthority"
          ]
        }
      ],
      "args": [
        {
          "name": "newAuthority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "updateBasePrice",
      "docs": [
        "Update base price (authority only)"
      ],
      "discriminator": [
        236,
        70,
        121,
        237,
        125,
        3,
        109,
        133
      ],
      "accounts": [
        {
          "name": "tokenAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "token_authority.mint",
                "account": "tokenAuthority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "tokenAuthority"
          ]
        }
      ],
      "args": [
        {
          "name": "newPriceUsdCents",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "qwamiTreasury",
      "discriminator": [
        94,
        128,
        139,
        205,
        226,
        161,
        97,
        215
      ]
    },
    {
      "name": "tokenAuthority",
      "discriminator": [
        145,
        159,
        9,
        246,
        161,
        7,
        193,
        203
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "maxSupplyExceeded",
      "msg": "Maximum supply of 1 trillion tokens exceeded"
    },
    {
      "code": 6001,
      "name": "invalidAuthority",
      "msg": "Invalid authority provided"
    },
    {
      "code": 6002,
      "name": "invalidPrice",
      "msg": "Invalid price value"
    },
    {
      "code": 6003,
      "name": "mathOverflow",
      "msg": "Math operation overflow"
    },
    {
      "code": 6004,
      "name": "invalidMintAuthority",
      "msg": "Invalid mint authority"
    },
    {
      "code": 6005,
      "name": "invalidMintDecimals",
      "msg": "Invalid mint decimals"
    },
    {
      "code": 6006,
      "name": "invalidTreasuryAuthority",
      "msg": "Treasury authority wallet does not match the configured authority"
    }
  ],
  "types": [
    {
      "name": "qwamiTreasury",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Authority that can manage the treasury"
            ],
            "type": "pubkey"
          },
          {
            "name": "totalSolReceived",
            "docs": [
              "Total SOL received from QWAMI mints"
            ],
            "type": "u64"
          },
          {
            "name": "qwamiMintsWithSol",
            "docs": [
              "Number of QWAMI mints with SOL"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "tokenAuthority",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "The authority that can mint tokens and update settings"
            ],
            "type": "pubkey"
          },
          {
            "name": "mint",
            "docs": [
              "The mint address"
            ],
            "type": "pubkey"
          },
          {
            "name": "totalMinted",
            "docs": [
              "Total tokens minted (including burned)"
            ],
            "type": "u64"
          },
          {
            "name": "totalBurned",
            "docs": [
              "Total tokens burned"
            ],
            "type": "u64"
          },
          {
            "name": "basePriceUsdCents",
            "docs": [
              "Base price in USD cents (1 cent = 0.01 USD)"
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA"
            ],
            "type": "u8"
          }
        ]
      }
    }
  ]
};
