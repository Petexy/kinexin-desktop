#!/bin/bash

# Rebuild kwin effects from source so they match the updated kwin headers.
echo "Rebuilding kwin-effects-glass from source..."
rm -rf /tmp/_kwin_glass_build
git clone --depth 1 https://github.com/4v3ngR/kwin-effects-glass /tmp/_kwin_glass_build \
	&& cmake -B /tmp/_kwin_glass_build/build -S /tmp/_kwin_glass_build -DCMAKE_INSTALL_PREFIX=/usr \
	&& cmake --build /tmp/_kwin_glass_build/build \
	&& cmake --install /tmp/_kwin_glass_build/build \
	|| echo "Warning: kwin-effects-glass rebuild failed." >&2
rm -rf /tmp/_kwin_glass_build

echo "Rebuilding KDE-Rounded-Corners from source..."
rm -rf /tmp/_kwin_rounded_build
git clone --depth 1 https://github.com/matinlotfali/KDE-Rounded-Corners /tmp/_kwin_rounded_build \
	&& cmake -B /tmp/_kwin_rounded_build/build -S /tmp/_kwin_rounded_build -DCMAKE_INSTALL_PREFIX=/usr \
	&& cmake --build /tmp/_kwin_rounded_build/build \
	&& cmake --install /tmp/_kwin_rounded_build/build \
	|| echo "Warning: KDE-Rounded-Corners rebuild failed." >&2
rm -rf /tmp/_kwin_rounded_build