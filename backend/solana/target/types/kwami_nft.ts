/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/kwami_nft.json`.
 */
export type KwamiNft = {
  "address": "6W3VGmDkjwswpY8JNNDQH5f1VuCdqrttR6koWPkN7drr",
  "metadata": {
    "name": "kwamiNft",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Kwami NFT program with DNA-based uniqueness validation"
  },
  "instructions": [
    {
      "name": "burnKwami",
      "docs": [
        "Burn Kwami NFT and remove DNA from registry (no SOL refund in SOL-paid MVP).",
        "This allows re-minting with a different DNA."
      ],
      "discriminator": [
        211,
        238,
        101,
        178,
        199,
        234,
        211,
        172
      ],
      "accounts": [
        {
          "name": "kwamiNft",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  107,
                  119,
                  97,
                  109,
                  105,
                  45,
                  110,
                  102,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "kwami_nft.mint",
                "account": "kwamiNft"
              }
            ]
          }
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "dnaRegistry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  110,
                  97,
                  45,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "dna_registry.collection",
                "account": "dnaRegistry"
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
                  107,
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
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "kwamiNft"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "checkDnaExists",
      "docs": [
        "Check if a DNA hash is already registered"
      ],
      "discriminator": [
        183,
        228,
        254,
        11,
        59,
        1,
        131,
        134
      ],
      "accounts": [
        {
          "name": "dnaRegistry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  110,
                  97,
                  45,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "dna_registry.collection",
                "account": "dnaRegistry"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "dnaHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ],
      "returns": "bool"
    },
    {
      "name": "createCollectionNft",
      "docs": [
        "Create the Metaplex Collection NFT (metadata + master edition) for the configured collection mint.",
        "Wallets typically only group NFTs when the collection is *verified* against a real collection NFT."
      ],
      "discriminator": [
        57,
        187,
        157,
        254,
        110,
        19,
        20,
        253
      ],
      "accounts": [
        {
          "name": "collectionMint",
          "writable": true
        },
        {
          "name": "collectionAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  101,
                  99,
                  116,
                  105,
                  111,
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
                "path": "collection_authority.collection_mint",
                "account": "collectionAuthority"
              }
            ]
          }
        },
        {
          "name": "collectionMetadata",
          "writable": true
        },
        {
          "name": "collectionMasterEdition",
          "writable": true
        },
        {
          "name": "authorityTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "collectionMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "authority",
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
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenMetadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize the Kwami NFT program, DNA registry, and treasury"
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
          "name": "collectionMint",
          "docs": [
            "Collection mint must be created off-chain (keeps this instruction under the SBF stack limit)"
          ],
          "writable": true
        },
        {
          "name": "collectionAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  101,
                  99,
                  116,
                  105,
                  111,
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
                "path": "collectionMint"
              }
            ]
          }
        },
        {
          "name": "dnaRegistry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  110,
                  97,
                  45,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "collectionMint"
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
                  107,
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
        }
      ],
      "args": []
    },
    {
      "name": "initializeCollection",
      "docs": [
        "Initialize a *new* collection authority + DNA registry while reusing the existing treasury.",
        "This is useful if the original collection mint was created incorrectly (e.g. missing freeze authority)",
        "and you need to rotate to a new collection mint without resetting the treasury."
      ],
      "discriminator": [
        112,
        62,
        53,
        139,
        173,
        152,
        98,
        93
      ],
      "accounts": [
        {
          "name": "collectionMint",
          "docs": [
            "Collection mint must be created off-chain."
          ],
          "writable": true
        },
        {
          "name": "collectionAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  101,
                  99,
                  116,
                  105,
                  111,
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
                "path": "collectionMint"
              }
            ]
          }
        },
        {
          "name": "dnaRegistry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  110,
                  97,
                  45,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "collectionMint"
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
                  107,
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
        }
      ],
      "args": []
    },
    {
      "name": "mintKwami",
      "docs": [
        "Mint a new Kwami NFT with unique DNA validation (requires SOL payment)"
      ],
      "discriminator": [
        200,
        116,
        147,
        137,
        42,
        111,
        131,
        148
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true,
          "signer": true
        },
        {
          "name": "kwamiNft",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  107,
                  119,
                  97,
                  109,
                  105,
                  45,
                  110,
                  102,
                  116
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
          "name": "collectionAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  101,
                  99,
                  116,
                  105,
                  111,
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
                "path": "collection_authority.collection_mint",
                "account": "collectionAuthority"
              }
            ]
          }
        },
        {
          "name": "dnaRegistry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  110,
                  97,
                  45,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "collection_authority.collection_mint",
                "account": "collectionAuthority"
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
                  107,
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
          "name": "metadata",
          "writable": true
        },
        {
          "name": "ownerTokenAccount",
          "docs": [
            "Owner's token account to receive the minted NFT"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "owner",
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
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenMetadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        }
      ],
      "args": [
        {
          "name": "dnaHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "mintKwamiWithReceipt",
      "docs": [
        "Finalize a mint using a previously purchased roll receipt.",
        "This does NOT transfer SOL (payment already happened in `purchase_roll`)."
      ],
      "discriminator": [
        211,
        53,
        40,
        156,
        118,
        241,
        212,
        117
      ],
      "accounts": [
        {
          "name": "mintReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116,
                  45,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "arg",
                "path": "rollId"
              }
            ]
          }
        },
        {
          "name": "mint",
          "writable": true,
          "signer": true
        },
        {
          "name": "kwamiNft",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  107,
                  119,
                  97,
                  109,
                  105,
                  45,
                  110,
                  102,
                  116
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
          "name": "collectionAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  101,
                  99,
                  116,
                  105,
                  111,
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
                "path": "collection_authority.collection_mint",
                "account": "collectionAuthority"
              }
            ]
          }
        },
        {
          "name": "dnaRegistry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  110,
                  97,
                  45,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "collection_authority.collection_mint",
                "account": "collectionAuthority"
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
                  107,
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
          "name": "metadata",
          "writable": true
        },
        {
          "name": "ownerTokenAccount",
          "docs": [
            "Owner's token account to receive the minted NFT"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "owner",
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
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenMetadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        }
      ],
      "args": [
        {
          "name": "rollId",
          "type": "pubkey"
        },
        {
          "name": "dnaHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "purchaseRoll",
      "docs": [
        "Purchase a \"roll\" (SOL payment) before selecting DNA/metadata.",
        "This enables a Candy Machine style UX: pay first, then roll/reveal, then upload, then finalize mint."
      ],
      "discriminator": [
        180,
        76,
        131,
        145,
        187,
        102,
        67,
        245
      ],
      "accounts": [
        {
          "name": "mintReceipt",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116,
                  45,
                  114,
                  101,
                  99,
                  101,
                  105,
                  112,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "arg",
                "path": "rollId"
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
                  107,
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
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "rollId",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "transferKwami",
      "docs": [
        "Transfer Kwami NFT ownership (updates internal record)"
      ],
      "discriminator": [
        78,
        177,
        34,
        189,
        140,
        216,
        46,
        30
      ],
      "accounts": [
        {
          "name": "kwamiNft",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  107,
                  119,
                  97,
                  109,
                  105,
                  45,
                  110,
                  102,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "kwami_nft.mint",
                "account": "kwamiNft"
              }
            ]
          }
        },
        {
          "name": "currentOwner",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "newOwner",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "updateCollectionNftMetadata",
      "docs": [
        "Update the collection NFT's Metaplex metadata (name/symbol/uri).",
        "This is needed because the collection NFT update authority is the PDA."
      ],
      "discriminator": [
        242,
        213,
        64,
        25,
        57,
        54,
        13,
        43
      ],
      "accounts": [
        {
          "name": "collectionMint",
          "writable": true
        },
        {
          "name": "collectionAuthority",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  101,
                  99,
                  116,
                  105,
                  111,
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
                "path": "collection_authority.collection_mint",
                "account": "collectionAuthority"
              }
            ]
          }
        },
        {
          "name": "collectionMetadata",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenMetadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateMetadata",
      "docs": [
        "Update Kwami NFT metadata (mind/soul changes only, DNA must stay same)"
      ],
      "discriminator": [
        170,
        182,
        43,
        239,
        97,
        78,
        225,
        186
      ],
      "accounts": [
        {
          "name": "kwamiNft",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  107,
                  119,
                  97,
                  109,
                  105,
                  45,
                  110,
                  102,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "kwami_nft.mint",
                "account": "kwamiNft"
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "kwamiNft"
          ]
        }
      ],
      "args": [
        {
          "name": "newUri",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "collectionAuthority",
      "discriminator": [
        209,
        221,
        189,
        233,
        183,
        32,
        247,
        91
      ]
    },
    {
      "name": "dnaRegistry",
      "discriminator": [
        238,
        254,
        46,
        166,
        250,
        189,
        213,
        199
      ]
    },
    {
      "name": "kwamiNft",
      "discriminator": [
        109,
        60,
        55,
        32,
        11,
        83,
        16,
        242
      ]
    },
    {
      "name": "kwamiTreasury",
      "discriminator": [
        133,
        17,
        225,
        138,
        62,
        14,
        246,
        227
      ]
    },
    {
      "name": "mintReceipt",
      "discriminator": [
        140,
        16,
        143,
        24,
        20,
        95,
        250,
        15
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "maxSupplyReached",
      "msg": "Maximum supply of 10 billion KWAMIs has been reached (2100). No more can be minted."
    },
    {
      "code": 6001,
      "name": "generationSupplyReached",
      "msg": "Current generation's supply limit reached. Wait for next generation (January 1st)."
    },
    {
      "code": 6002,
      "name": "duplicateDna",
      "msg": "This DNA already exists. Each Kwami must have unique DNA."
    },
    {
      "code": 6003,
      "name": "registryFull",
      "msg": "DNA registry is full. Maximum capacity reached."
    },
    {
      "code": 6004,
      "name": "invalidOwner",
      "msg": "Invalid owner for this Kwami NFT"
    },
    {
      "code": 6005,
      "name": "nameTooLong",
      "msg": "Name exceeds maximum length of 32 characters"
    },
    {
      "code": 6006,
      "name": "symbolTooLong",
      "msg": "Symbol exceeds maximum length of 10 characters"
    },
    {
      "code": 6007,
      "name": "uriTooLong",
      "msg": "URI exceeds maximum length of 200 characters"
    },
    {
      "code": 6008,
      "name": "insufficientSolBalance",
      "msg": "Insufficient SOL balance to mint this NFT."
    },
    {
      "code": 6009,
      "name": "invalidCollectionMintAuthority",
      "msg": "Invalid collection mint authority"
    },
    {
      "code": 6010,
      "name": "invalidCollectionMintDecimals",
      "msg": "Invalid collection mint decimals"
    },
    {
      "code": 6011,
      "name": "invalidTreasuryAuthority",
      "msg": "Treasury authority wallet does not match the configured authority"
    },
    {
      "code": 6012,
      "name": "invalidCollectionMint",
      "msg": "Invalid collection mint (must match the program's collection mint)"
    },
    {
      "code": 6013,
      "name": "invalidCollectionMetadata",
      "msg": "Invalid collection metadata PDA"
    },
    {
      "code": 6014,
      "name": "invalidCollectionMasterEdition",
      "msg": "Invalid collection master edition PDA"
    },
    {
      "code": 6015,
      "name": "mathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6016,
      "name": "invalidReceipt",
      "msg": "Invalid mint receipt"
    },
    {
      "code": 6017,
      "name": "receiptAlreadyUsed",
      "msg": "Mint receipt already used"
    },
    {
      "code": 6018,
      "name": "receiptExpired",
      "msg": "Mint receipt expired (generation changed); please purchase again"
    },
    {
      "code": 6019,
      "name": "invalidCollectionAuthority",
      "msg": "Invalid collection authority"
    }
  ],
  "types": [
    {
      "name": "collectionAuthority",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Authority that can manage the collection"
            ],
            "type": "pubkey"
          },
          {
            "name": "collectionMint",
            "docs": [
              "Collection mint address"
            ],
            "type": "pubkey"
          },
          {
            "name": "totalMinted",
            "docs": [
              "Total number of Kwamis minted"
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
      "name": "dnaRegistry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Authority"
            ],
            "type": "pubkey"
          },
          {
            "name": "collection",
            "docs": [
              "Collection this registry belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "dnaHashes",
            "docs": [
              "Array of DNA hashes"
            ],
            "type": {
              "vec": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "dnaCount",
            "docs": [
              "Count of registered DNAs"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "kwamiNft",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "docs": [
              "The mint address of this NFT"
            ],
            "type": "pubkey"
          },
          {
            "name": "owner",
            "docs": [
              "Current owner"
            ],
            "type": "pubkey"
          },
          {
            "name": "dnaHash",
            "docs": [
              "DNA hash (SHA-256)"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "mintedAt",
            "docs": [
              "Timestamp when minted"
            ],
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "docs": [
              "Timestamp when last updated"
            ],
            "type": "i64"
          },
          {
            "name": "metadataUri",
            "docs": [
              "Metadata URI (Arweave)"
            ],
            "type": "string"
          },
          {
            "name": "mintCostLamports",
            "docs": [
              "Original base minting cost in lamports (used for refund calculation)"
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
      "name": "kwamiTreasury",
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
              "Total SOL (lamports) received from NFT mints"
            ],
            "type": "u64"
          },
          {
            "name": "nftMintsCount",
            "docs": [
              "Total number of NFT mints"
            ],
            "type": "u64"
          },
          {
            "name": "nftBurnsCount",
            "docs": [
              "Total number of NFT burns"
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
      "name": "mintReceipt",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rollId",
            "docs": [
              "Client-provided roll id to allow multiple receipts per buyer."
            ],
            "type": "pubkey"
          },
          {
            "name": "buyer",
            "docs": [
              "Buyer who paid for this roll."
            ],
            "type": "pubkey"
          },
          {
            "name": "generation",
            "docs": [
              "Generation at time of purchase."
            ],
            "type": "i64"
          },
          {
            "name": "priceLamports",
            "docs": [
              "Amount paid (lamports)."
            ],
            "type": "u64"
          },
          {
            "name": "paidAt",
            "docs": [
              "Timestamp of payment."
            ],
            "type": "i64"
          },
          {
            "name": "used",
            "docs": [
              "Whether this receipt has been consumed."
            ],
            "type": "bool"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed."
            ],
            "type": "u8"
          }
        ]
      }
    }
  ]
};
