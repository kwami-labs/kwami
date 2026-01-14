/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/kwami_dao.json`.
 */
export type KwamiDao = {
  "address": "6j64Ct74mypeT3UKVhtFUjBW8RX144VvxWJjH9iBqbAv",
  "metadata": {
    "name": "kwamiDao",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "KWAMI DAO Governance Program"
  },
  "instructions": [
    {
      "name": "cancelProposal",
      "docs": [
        "Cancel a proposal (only by proposer or authority)"
      ],
      "discriminator": [
        106,
        74,
        128,
        146,
        19,
        65,
        39,
        23
      ],
      "accounts": [
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "proposal.proposal_id",
                "account": "proposal"
              }
            ]
          }
        },
        {
          "name": "daoState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  97,
                  111,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "caller",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "createProposal",
      "docs": [
        "Create a new governance proposal"
      ],
      "discriminator": [
        132,
        116,
        68,
        174,
        216,
        160,
        198,
        22
      ],
      "accounts": [
        {
          "name": "daoState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  97,
                  111,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "dao_state.proposal_count",
                "account": "daoState"
              }
            ]
          }
        },
        {
          "name": "proposerQwamiAccount"
        },
        {
          "name": "proposer",
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
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "executionDelaySeconds",
          "type": "i64"
        },
        {
          "name": "votingPeriodSeconds",
          "type": "i64"
        }
      ]
    },
    {
      "name": "finalizeProposal",
      "docs": [
        "Finalize a proposal after voting period ends"
      ],
      "discriminator": [
        23,
        68,
        51,
        167,
        109,
        173,
        187,
        164
      ],
      "accounts": [
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "proposal.proposal_id",
                "account": "proposal"
              }
            ]
          }
        },
        {
          "name": "daoState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  97,
                  111,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize the DAO governance system"
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
          "name": "daoState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  97,
                  111,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "qwamiMint"
        },
        {
          "name": "authority",
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
          "name": "governanceConfig",
          "type": {
            "defined": {
              "name": "governanceConfig"
            }
          }
        }
      ]
    },
    {
      "name": "updateConfig",
      "docs": [
        "Update governance configuration (authority only)"
      ],
      "discriminator": [
        29,
        158,
        252,
        191,
        10,
        83,
        219,
        99
      ],
      "accounts": [
        {
          "name": "daoState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  97,
                  111,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "daoState"
          ]
        }
      ],
      "args": [
        {
          "name": "newConfig",
          "type": {
            "defined": {
              "name": "governanceConfig"
            }
          }
        }
      ]
    },
    {
      "name": "vote",
      "docs": [
        "Cast a vote on a proposal"
      ],
      "discriminator": [
        227,
        110,
        155,
        23,
        136,
        126,
        172,
        25
      ],
      "accounts": [
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "proposal.proposal_id",
                "account": "proposal"
              }
            ]
          }
        },
        {
          "name": "voteRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "proposal"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "daoState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  97,
                  111,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "qwamiMint"
        },
        {
          "name": "voterQwamiAccount"
        },
        {
          "name": "voteVault",
          "docs": [
            "Per-vote escrow vault owned by `dao_state` PDA."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "proposal"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "voteType",
          "type": {
            "defined": {
              "name": "voteType"
            }
          }
        },
        {
          "name": "qwamiAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawVote",
      "docs": [
        "Withdraw locked voting tokens after the voting period ends (or proposal is no longer active)."
      ],
      "discriminator": [
        243,
        255,
        70,
        200,
        3,
        242,
        103,
        137
      ],
      "accounts": [
        {
          "name": "daoState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  97,
                  111,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "proposal",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "proposal.proposal_id",
                "account": "proposal"
              }
            ]
          }
        },
        {
          "name": "voteRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "proposal"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "voteVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101,
                  45,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "proposal"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "voterQwamiAccount",
          "writable": true
        },
        {
          "name": "voter",
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "daoState",
      "discriminator": [
        24,
        50,
        14,
        105,
        233,
        60,
        201,
        244
      ]
    },
    {
      "name": "proposal",
      "discriminator": [
        26,
        94,
        189,
        187,
        116,
        136,
        53,
        33
      ]
    },
    {
      "name": "voteRecord",
      "discriminator": [
        112,
        9,
        123,
        165,
        234,
        9,
        157,
        167
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "titleTooLong",
      "msg": "Title must be 100 characters or less"
    },
    {
      "code": 6001,
      "name": "descriptionTooLong",
      "msg": "Description must be 2000 characters or less"
    },
    {
      "code": 6002,
      "name": "votingPeriodTooShort",
      "msg": "Voting period must be at least 1 day"
    },
    {
      "code": 6003,
      "name": "votingPeriodTooLong",
      "msg": "Voting period cannot exceed 14 days"
    },
    {
      "code": 6004,
      "name": "insufficientQwami",
      "msg": "Insufficient QWAMI tokens"
    },
    {
      "code": 6005,
      "name": "proposalNotActive",
      "msg": "Proposal is not active"
    },
    {
      "code": 6006,
      "name": "votingPeriodEnded",
      "msg": "Voting period has ended"
    },
    {
      "code": 6007,
      "name": "votingPeriodNotEnded",
      "msg": "Voting period has not ended yet"
    },
    {
      "code": 6008,
      "name": "alreadyVoted",
      "msg": "Already voted on this proposal"
    },
    {
      "code": 6009,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6010,
      "name": "executionNotAvailable",
      "msg": "Proposal execution not available yet"
    },
    {
      "code": 6011,
      "name": "alreadyExecuted",
      "msg": "Proposal has already been executed"
    },
    {
      "code": 6012,
      "name": "votingStillActive",
      "msg": "Vote tokens are still locked because voting is still active"
    },
    {
      "code": 6013,
      "name": "alreadyWithdrawn",
      "msg": "Vote tokens already withdrawn"
    },
    {
      "code": 6014,
      "name": "nothingToWithdraw",
      "msg": "Nothing to withdraw"
    }
  ],
  "types": [
    {
      "name": "daoState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "qwamiMint",
            "type": "pubkey"
          },
          {
            "name": "kwamiCollection",
            "type": "pubkey"
          },
          {
            "name": "treasuryWallet",
            "docs": [
              "Wallet where SOL proceeds are deposited (for dashboard display)."
            ],
            "type": "pubkey"
          },
          {
            "name": "qwamiTokenAuthority",
            "docs": [
              "QWAMI TokenAuthority PDA (for minted/burned dashboard stats)."
            ],
            "type": "pubkey"
          },
          {
            "name": "kwamiCollectionAuthority",
            "docs": [
              "KWAMI CollectionAuthority PDA (for minted dashboard stats)."
            ],
            "type": "pubkey"
          },
          {
            "name": "proposalCount",
            "type": "u64"
          },
          {
            "name": "governanceConfig",
            "type": {
              "defined": {
                "name": "governanceConfig"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "governanceConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "minQwamiToPropose",
            "type": "u64"
          },
          {
            "name": "quorum",
            "type": "u64"
          },
          {
            "name": "maxVotingPeriod",
            "type": "i64"
          },
          {
            "name": "minExecutionDelay",
            "type": "i64"
          },
          {
            "name": "kwamiCollection",
            "type": "pubkey"
          },
          {
            "name": "treasuryWallet",
            "docs": [
              "Wallet where SOL proceeds are deposited (for dashboard display)."
            ],
            "type": "pubkey"
          },
          {
            "name": "qwamiTokenAuthority",
            "docs": [
              "QWAMI TokenAuthority PDA (for minted/burned dashboard stats)."
            ],
            "type": "pubkey"
          },
          {
            "name": "kwamiCollectionAuthority",
            "docs": [
              "KWAMI CollectionAuthority PDA (for minted dashboard stats)."
            ],
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "proposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposalId",
            "type": "u64"
          },
          {
            "name": "proposer",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "proposalStatus"
              }
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "votingEndsAt",
            "type": "i64"
          },
          {
            "name": "executionDelaySeconds",
            "type": "i64"
          },
          {
            "name": "executionAvailableAt",
            "type": "i64"
          },
          {
            "name": "votesFor",
            "type": "u64"
          },
          {
            "name": "votesAgainst",
            "type": "u64"
          },
          {
            "name": "votesAbstain",
            "type": "u64"
          },
          {
            "name": "totalVotes",
            "type": "u64"
          },
          {
            "name": "executed",
            "type": "bool"
          },
          {
            "name": "cancelled",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "proposalStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "passed"
          },
          {
            "name": "rejected"
          },
          {
            "name": "quorumNotMet"
          },
          {
            "name": "cancelled"
          },
          {
            "name": "executed"
          }
        ]
      }
    },
    {
      "name": "voteRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposalId",
            "type": "u64"
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "voteType",
            "type": {
              "defined": {
                "name": "voteType"
              }
            }
          },
          {
            "name": "qwamiAmount",
            "type": "u64"
          },
          {
            "name": "votedAt",
            "type": "i64"
          },
          {
            "name": "withdrawn",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "voteType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "for"
          },
          {
            "name": "against"
          },
          {
            "name": "abstain"
          }
        ]
      }
    }
  ]
};
