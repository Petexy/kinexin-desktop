# Maintainer: Petexy <https://github.com/Petexy>

pkgname=kinexin-desktop
pkgver=1.2.1.r
pkgrel=2
_currentdate=$(date +"%Y-%m-%d%H-%M-%S")
pkgdesc='Linexin KDE Plasma Desktop Full Experience'
url='https://github.com/Petexy'
arch=(x86_64)
license=('GPL-3.0')
depends=(
  qt6-base
  qt5-base
  qt5-graphicaleffects
  qt5-quickcontrols
  qt5-quickcontrols2
  kcrash
  kpackage
  python-gobject
  gtk4
  libadwaita
  linexin-center
  qt6-svg
  gwenview
  vlc
  plasma-meta
  dolphin
  konsole
  kvantum
  ark
  kate
  sddm
  kvantum
  ffmpegthumbs
  kwin-effect-rounded-corners-git
  kwin-effects-glass-git
)
makedepends=(
)
install="${pkgname}.install"
options=(!strip !debug)

package() {
   cp -rf ${srcdir}/* ${pkgdir}/
}
