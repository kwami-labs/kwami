import type { KwamiAvatarOptions } from './types';
import { getAvatarCoordinates } from './animations';
import { createPopover as createGlassPopover } from '../../primitives/Popover';

export function createKwamiAvatar(options: KwamiAvatarOptions): { element: HTMLDivElement; destroy: () => void } {
  const size = options.size ?? 48;
  const position = options.position ?? 'top-left';
  const coords = getAvatarCoordinates(position, size);

  // Create avatar container
  const avatar = document.createElement('div');
  avatar.className = 'kwami-avatar';
  avatar.style.position = 'fixed';
  avatar.style.width = `${size}px`;
  avatar.style.height = `${size}px`;
  avatar.style.borderRadius = '50%';
  avatar.style.overflow = 'hidden';
  avatar.style.cursor = 'pointer';
  avatar.style.zIndex = '9999';
  avatar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(255, 255, 255, 0.1)';
  avatar.style.transition = 'transform 0.2s, box-shadow 0.2s';
  avatar.style.background = 'rgba(0, 0, 0, 0.3)';
  avatar.style.backdropFilter = 'blur(10px)';

  // Apply position
  if (coords.top) avatar.style.top = coords.top;
  if (coords.right) avatar.style.right = coords.right;
  if (coords.bottom) avatar.style.bottom = coords.bottom;
  if (coords.left) avatar.style.left = coords.left;

  // Add hover effect
  avatar.addEventListener('mouseenter', () => {
    avatar.style.transform = 'scale(1.05)';
    avatar.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(255, 255, 255, 0.2)';
  });

  avatar.addEventListener('mouseleave', () => {
    avatar.style.transform = 'scale(1)';
    avatar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(255, 255, 255, 0.1)';
  });

  // Add NFT image
  if (options.nft.image) {
    const img = document.createElement('img');
    img.src = options.nft.image;
    img.alt = options.nft.name;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.display = 'block';
    avatar.appendChild(img);
  } else {
    // Fallback: show initials
    const initials = document.createElement('div');
    initials.textContent = (options.nft.name || 'K').substring(0, 2).toUpperCase();
    initials.style.width = '100%';
    initials.style.height = '100%';
    initials.style.display = 'flex';
    initials.style.alignItems = 'center';
    initials.style.justifyContent = 'center';
    initials.style.fontSize = `${size * 0.4}px`;
    initials.style.fontWeight = '700';
    initials.style.color = '#fff';
    avatar.appendChild(initials);
  }

  // Create popover menu
  const menuContent = document.createElement('div');
  menuContent.style.display = 'flex';
  menuContent.style.flexDirection = 'column';
  menuContent.style.gap = '12px';
  menuContent.style.minWidth = '240px';

  // NFT info
  const info = document.createElement('div');
  info.style.display = 'flex';
  info.style.flexDirection = 'column';
  info.style.gap = '6px';

  const name = document.createElement('div');
  name.textContent = options.nft.name || 'Unnamed KWAMI';
  name.style.fontSize = '15px';
  name.style.fontWeight = '700';
  name.style.color = '#fff';

  const address = document.createElement('div');
  address.textContent = truncateAddress(options.walletAddress);
  address.className = 'mono';
  address.style.fontSize = '13px';
  address.style.opacity = '0.7';
  address.style.color = '#cbd5e1';

  info.appendChild(name);
  info.appendChild(address);

  // Divider
  const divider = document.createElement('div');
  divider.style.height = '1px';
  divider.style.background = 'rgba(148, 163, 184, 0.2)';

  // Logout button
  const logoutBtn = document.createElement('button');
  logoutBtn.type = 'button';
  logoutBtn.textContent = 'Logout';
  logoutBtn.className = 'kwami-glass-surface';
  logoutBtn.style.padding = '10px 16px';
  logoutBtn.style.borderRadius = '12px';
  logoutBtn.style.border = '1px solid rgba(239, 68, 68, 0.3)';
  logoutBtn.style.background = 'rgba(239, 68, 68, 0.1)';
  logoutBtn.style.color = 'rgba(248, 113, 113, 0.95)';
  logoutBtn.style.fontSize = '14px';
  logoutBtn.style.fontWeight = '600';
  logoutBtn.style.cursor = 'pointer';
  logoutBtn.style.transition = 'all 0.2s';

  logoutBtn.addEventListener('mouseenter', () => {
    logoutBtn.style.background = 'rgba(239, 68, 68, 0.2)';
    logoutBtn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
  });

  logoutBtn.addEventListener('mouseleave', () => {
    logoutBtn.style.background = 'rgba(239, 68, 68, 0.1)';
    logoutBtn.style.borderColor = 'rgba(239, 68, 68, 0.3)';
  });

  logoutBtn.addEventListener('click', () => {
    popover.hide();
    options.onLogout?.();
  });

  menuContent.appendChild(info);
  menuContent.appendChild(divider);
  menuContent.appendChild(logoutBtn);

  const popover = createGlassPopover({
    header: 'KWAMI Account',
    content: menuContent,
    width: 280,
    closeOnBlur: true,
  });

  // Show popover on click
  avatar.addEventListener('click', (e) => {
    e.stopPropagation();
    const rect = avatar.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.bottom + 10;
    popover.show(centerX, centerY);
  });

  function destroy() {
    avatar.remove();
  }

  return { element: avatar, destroy };
}

function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address || address.length <= start + end + 3) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}
