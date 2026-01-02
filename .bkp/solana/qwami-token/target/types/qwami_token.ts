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
      "name": "burnForSol",
      "docs": [
        "Burn QWAMI tokens to receive SOL",
        "Formula: SOL_amount = (QWAMI_amount × QWAMI_price_USD) / SOL_price_USD"
      ],
      "discriminator": [
        82,
        25,
        84,
        184,
        136,
        66,
        237,
        11
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
          "name": "solVault",
          "docs": [
            "Treasury's SOL vault (PDA)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "sellerQwamiAccount",
          "docs": [
            "Seller's QWAMI token account (burns tokens)"
          ],
          "writable": true
        },
        {
          "name": "seller",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "qwamiAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "burnForUsdc",
      "docs": [
        "Burn QWAMI tokens to receive USDC",
        "Formula: USDC_amount = QWAMI_amount × QWAMI_price_USD"
      ],
      "discriminator": [
        113,
        121,
        38,
        96,
        169,
        61,
        54,
        156
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
          "name": "usdcVault",
          "docs": [
            "Treasury's USDC vault"
          ],
          "writable": true
        },
        {
          "name": "sellerUsdcAccount",
          "docs": [
            "Seller's USDC token account (receives USDC)"
          ],
          "writable": true
        },
        {
          "name": "sellerQwamiAccount",
          "docs": [
            "Seller's QWAMI token account (burns tokens)"
          ],
          "writable": true
        },
        {
          "name": "seller",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "qwamiAmount",
          "type": "u64"
        }
      ]
    },
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
          "name": "usdcVault",
          "docs": [
            "USDC token vault must be created off-chain and owned by the `treasury` PDA"
          ],
          "writable": true
        },
        {
          "name": "usdcMint",
          "docs": [
            "USDC mint (official USDC on Solana)"
          ]
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
        "Mint QWAMI tokens by paying with SOL",
        "Formula: QWAMI_amount = (SOL_amount × SOL_price_USD) / QWAMI_price_USD",
        "Note: For MVP, using 1:1 ratio. In production, integrate Pyth oracle for SOL price"
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
          "name": "solVault",
          "docs": [
            "Treasury's SOL vault (PDA)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
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
      "name": "mintWithUsdc",
      "docs": [
        "Mint QWAMI tokens by paying with USDC",
        "Formula: QWAMI_amount = USDC_amount / QWAMI_price_USD"
      ],
      "discriminator": [
        128,
        28,
        133,
        173,
        71,
        142,
        185,
        206
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
          "name": "usdcVault",
          "docs": [
            "Treasury's USDC vault"
          ],
          "writable": true
        },
        {
          "name": "buyerUsdcAccount",
          "docs": [
            "Buyer's USDC token account (pays with USDC)"
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
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "usdcAmount",
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
      "name": "invalidTreasuryVault",
      "msg": "Invalid treasury vault provided"
    },
    {
      "code": 6005,
      "name": "invalidMintAuthority",
      "msg": "Invalid mint authority"
    },
    {
      "code": 6006,
      "name": "invalidMintDecimals",
      "msg": "Invalid mint decimals"
    },
    {
      "code": 6007,
      "name": "insufficientTreasuryBalance",
      "msg": "Insufficient treasury balance to process this transaction"
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
            "name": "usdcVault",
            "docs": [
              "USDC token vault PDA"
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
            "name": "totalUsdcReceived",
            "docs": [
              "Total USDC received from QWAMI mints"
            ],
            "type": "u64"
          },
          {
            "name": "totalSolDistributed",
            "docs": [
              "Total SOL distributed from QWAMI burns"
            ],
            "type": "u64"
          },
          {
            "name": "totalUsdcDistributed",
            "docs": [
              "Total USDC distributed from QWAMI burns"
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
            "name": "qwamiMintsWithUsdc",
            "docs": [
              "Number of QWAMI mints with USDC"
            ],
            "type": "u64"
          },
          {
            "name": "qwamiBurnsForSol",
            "docs": [
              "Number of QWAMI burns for SOL"
            ],
            "type": "u64"
          },
          {
            "name": "qwamiBurnsForUsdc",
            "docs": [
              "Number of QWAMI burns for USDC"
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
