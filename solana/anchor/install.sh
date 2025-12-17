#!/bin/bash

# Exit on error
set -e

echo "Starting Solana and Anchor installation..."

# Update system and install build dependencies
echo "Updating system packages..."
sudo apt-get update
sudo apt-get install -y pkg-config build-essential libudev-dev libssl-dev git curl

# Install Rust
if ! command -v rustc &> /dev/null; then
    echo "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "Rust is already installed."
fi

# Install Solana CLI
if ! command -v solana &> /dev/null; then
    echo "Installing Solana CLI..."
    
    # Download installer
    if curl -sSfL https://release.solana.com/stable/install -o solana_installer.sh; then
        sh solana_installer.sh
        rm solana_installer.sh
    else
        echo "Error: Failed to download Solana installer from release.solana.com"
        echo "Retrying with GitHub raw script..."
        
        # Fallback to GitHub raw script
        FALLBACK_URL="https://raw.githubusercontent.com/solana-labs/solana/master/install/solana-install-init.sh"
        if curl -sSfL "$FALLBACK_URL" -o solana_installer.sh; then
            # Install specific stable version
            sh solana_installer.sh v1.18.4
            rm solana_installer.sh
        else
             echo "Error: Failed to download from GitHub too."
             exit 1
        fi
    fi
    
    # Add to path for current session
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    
    # Verify installation
    if ! command -v solana &> /dev/null; then
         echo "Error: Solana installation failed."
         exit 1
    fi
else
    echo "Solana CLI is already installed."
fi

# Install Node.js
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js is already installed."
fi

# Install project dependencies
echo "Installing project dependencies..."

if [ -d "qwami" ]; then
    echo "Installing dependencies for qwami..."
    cd qwami && npm install && cd ..
fi

if [ -d "kwami" ]; then
    echo "Installing dependencies for kwami..."
    cd kwami && npm install && cd ..
fi

# Install Anchor via AVM
if ! command -v avm &> /dev/null; then
    echo "Installing AVM (Anchor Version Manager)..."
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
    
    echo "Installing latest Anchor version..."
    avm install latest
    avm use latest
else
    echo "AVM is already installed."
    if ! command -v anchor &> /dev/null; then
        echo "Installing latest Anchor version..."
        avm install latest
        avm use latest
    fi
fi

# Ensure Solana binaries are in PATH for the next steps
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Configure Solana Wallet
echo "Configuring Solana Wallet..."
SOLANA_CONFIG_DIR="$HOME/.config/solana"
KEYPAIR_PATH="$SOLANA_CONFIG_DIR/id.json"

if [ ! -f "$KEYPAIR_PATH" ]; then
    echo "Generating new Solana wallet keypair..."
    mkdir -p "$SOLANA_CONFIG_DIR"
    # Generate keypair without passphrase for devnet convenience
    solana-keygen new -o "$KEYPAIR_PATH" --no-bip39-passphrase
    echo "✅ Wallet generated at $KEYPAIR_PATH"
else
    echo "✅ Wallet already exists at $KEYPAIR_PATH"
fi

# Set default config to devnet
echo "Setting default cluster to devnet..."
solana config set --url devnet

echo "Installation complete!"
echo "Please restart your shell or run: source $HOME/.bashrc (or your shell profile)"
