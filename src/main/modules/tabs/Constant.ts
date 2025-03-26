export function Layout(width, height) {
  // Tab布局位置
  const NavbarHeight = 30
  const OffsetHeight = NavbarHeight + 100
  return { x: 0, y: OffsetHeight, width: width, height: height - OffsetHeight }
}
