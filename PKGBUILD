# Maintainer: Petexy <https://github.com/Petexy>

pkgname=kinexin-desktop
pkgver=1.4.1.r
pkgrel=1
pkgdesc='Linexin KDE Plasma Desktop Full Experience'
url='https://github.com/Petexy'
arch=('x86_64')
license=('GPL-3.0')
depends=(
  'fwupd'
  'power-profiles-daemon'
  'qt6-base'
  'qt5-base'
  'qt5-graphicaleffects'
  'qt5-quickcontrols'
  'qt5-quickcontrols2'
  'kcrash'
  'kpackage'
  'python-gobject'
  'gtk4'
  'libadwaita'
  'linexin-center'
  'qt6-svg'
  'gwenview'
  'vlc'
  'plasma-meta'
  'dolphin'
  'dolphin-plugins'
  'konsole'
  'kvantum'
  'ark'
  'kate'
  'sddm'
  'ffmpegthumbs'
  'kwin-effect-rounded-corners-git'
  'kwin-effects-glass-git'
  'kinexin-deco'
  'cmake'
  'git'
  'gcc'
  'extra-cmake-modules'
)
install="${pkgname}.install"
options=('!strip' '!debug')

package() {
    cd "${srcdir}"

    find . -mindepth 1 -type f | while IFS= read -r _file; do
        local _dest="${_file#./}"
        if [[ "${_dest}" == usr/bin/* ]]; then
            install -Dm755 "${_file}" "${pkgdir}/${_dest}"
        else
            install -Dm644 "${_file}" "${pkgdir}/${_dest}"
        fi
    done

    find . -mindepth 1 -type l | while IFS= read -r _link; do
        local _dest="${_link#./}"
        local _target
        _target="$(readlink "${_link}")"
        install -dm755 "${pkgdir}/$(dirname "${_dest}")"
        ln -sf "${_target}" "${pkgdir}/${_dest}"
    done
}
