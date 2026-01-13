import { createGlassButton } from '../primitives/GlassButton';
import type { GlassPopoverHandle } from '../primitives/GlassPopover';
import type { WalletConnectWidgetOptions } from './types';
import type { ExtendedWidgetState } from './state-manager';
import { getWalletConnector } from '../../apps/wallet/WalletConnector';

export function showNetworkChooser(
  anchorEl: HTMLElement,
  currentNetwork: string,
  networkPopover: GlassPopoverHandle,
  wallet: any,
  options: WalletConnectWidgetOptions,
  onNetworkChanged: (network: string) => Promise<void>,
  setError: (message?: string) => void
): void {
  const networks = ['mainnet-beta', 'devnet', 'testnet'] as const;
  const container = document.createElement('div');
  container.className = 'kwami-network-chooser';

  networks.forEach((network) => {
    const isActive = network === currentNetwork;
    const btn = createGlassButton({
      label: network === 'mainnet-beta' ? 'Mainnet' : network.charAt(0).toUpperCase() + network.slice(1),
      mode: isActive ? 'primary' : 'ghost',
      size: 'sm',
      theme: options.theme,
      onClick: async () => {
        try {
          // Use wallet.switchNetwork if available, or fallback
          const fallback = getWalletConnector();
          const switchFn =
            (typeof wallet.switchNetwork === 'function' && wallet.switchNetwork.bind(wallet)) ||
            (typeof fallback.switchNetwork === 'function' && fallback.switchNetwork.bind(fallback));

          if (!switchFn) {
            setError('Network switching is not supported by this connector.');
            return;
          }

          const success = await switchFn(network);
          if (!success) {
            setError('Network switching is not supported by this connector.');
            return;
          }

          await onNetworkChanged(network);
          options.onNetworkChange?.({ network });
          networkPopover.hide();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to switch network';
          setError(message);
          options.onError?.(error);
        }
      },
    });
    btn.element.style.width = '100%';
    container.appendChild(btn.element);
  });

  networkPopover.setContent(container);
  const r = anchorEl.getBoundingClientRect();
  networkPopover.show(r.left + r.width / 2, r.bottom + 10);
}

export function showAddressChooser(
  anchorEl: HTMLElement,
  state: ExtendedWidgetState,
  wallet: any,
  addressPopover: GlassPopoverHandle
): void {
  const currentPk = state.selectedPublicKey ?? wallet.getPublicKey();
  if (!currentPk) return;

  const msg = document.createElement('div');
  msg.className = 'kwami-address-copy-msg';
  msg.textContent = 'Copied!';

  void navigator.clipboard.writeText(currentPk.toBase58()).catch(() => {
    msg.textContent = 'Copy failed, copy manually';
  });

  addressPopover.setContent(msg);
  const r = anchorEl.getBoundingClientRect();
  addressPopover.show(r.left + r.width / 2, r.bottom + 6);
  setTimeout(() => addressPopover.hide(), 900);
}

export function positionAndShowPopover(
  buttonElement: HTMLElement,
  popover: GlassPopoverHandle
): void {
  const rect = buttonElement.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.bottom + 14;
  popover.show(x, y);
}
