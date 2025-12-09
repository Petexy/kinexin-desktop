var plasma = getApiVersion(1);

// Desktop configuration
var activity = activityIds[0];
var desktop = desktopById(activity);
desktop.wallpaperPlugin = "org.kde.image";
desktop.currentConfigGroup = ["Wallpaper", "org.kde.image", "General"];
desktop.writeConfig("Image", "/usr/share/wallpapers/Kinexin/Content/images/Kinexin.svg");
desktop.writeConfig("SlidePaths", "/usr/share/wallpapers/");

// Bottom Panel - Floating, Fit Content
var bottomPanel = new Panel;
bottomPanel.location = "bottom";
bottomPanel.height = 44; // approximately 2.5 grid units
bottomPanel.alignment = "center";
bottomPanel.hiding = "dodgewindows";
bottomPanel.lengthMode = "fit";

// Bottom panel widgets
var kickerdash = bottomPanel.addWidget("org.kde.plasma.kickerdash");
kickerdash.currentConfigGroup = ["Configuration", "General"];
kickerdash.writeConfig("customButtonImage", "windowshuffler-symbolic");
kickerdash.writeConfig("favoritesPortedToKAstats", true);
kickerdash.writeConfig("useCustomButtonImage", true);

var icontasks = bottomPanel.addWidget("org.kde.plasma.icontasks");
icontasks.currentConfigGroup = ["General"];
icontasks.writeConfig("launchers", "applications:app.zen_browser.zen.desktop,preferred://filemanager,applications:org.kde.discover.desktop,applications:github.petexy.linexincenter.desktop,applications:steam.desktop");

// Top Panel - Not floating, full width
var topPanel = new Panel;
topPanel.location = "top";
topPanel.height = 32; // approximately 2 grid units
topPanel.alignment = "left";
topPanel.hiding = "normal";
topPanel.floating = 0;

// Top panel widgets
var kicker = topPanel.addWidget("org.kde.plasma.kicker");
kicker.currentConfigGroup = ["Configuration", "General"];
kicker.writeConfig("favoritesPortedToKAstats", true);
kicker.writeConfig("icon", "/usr/share/logo/logosmall.png");
kicker.writeConfig("systemFavorites", "suspend\\,hibernate\\,reboot\\,shutdown");

var windowtitle = topPanel.addWidget("org.kde.windowtitle");
windowtitle.currentConfigGroup = ["Configuration", "Appearance"];
windowtitle.writeConfig("midSpace", 10);
windowtitle.writeConfig("txt", "%a");
windowtitle.writeConfig("visible", false);

var appmenu = topPanel.addWidget("org.kde.plasma.appmenu");

var spacer = topPanel.addWidget("org.kde.plasma.panelspacer");

var systemtray = topPanel.addWidget("org.kde.plasma.systemtray");
systemtray.currentConfigGroup = ["General"];
systemtray.writeConfig("extraItems", "org.kde.plasma.battery,org.kde.plasma.clipboard,org.kde.plasma.notifications,org.kde.plasma.printmanager,org.kde.plasma.networkmanagement,org.kde.plasma.weather,org.kde.plasma.cameraindicator,org.kde.plasma.devicenotifier,org.kde.plasma.brightness,org.kde.plasma.keyboardindicator,org.kde.plasma.manage-inputmethod,org.kde.plasma.bluetooth,org.kde.plasma.vault,org.kde.plasma.keyboardlayout,org.kde.plasma.volume,org.kde.kscreen,org.kde.plasma.mediacontroller");
systemtray.writeConfig("knownItems", "org.kde.plasma.battery,org.kde.plasma.clipboard,org.kde.plasma.notifications,org.kde.plasma.printmanager,org.kde.plasma.networkmanagement,org.kde.plasma.weather,org.kde.plasma.cameraindicator,org.kde.plasma.devicenotifier,org.kde.plasma.brightness,org.kde.plasma.keyboardindicator,org.kde.plasma.manage-inputmethod,org.kde.plasma.bluetooth,org.kde.plasma.vault,org.kde.plasma.keyboardlayout,org.kde.plasma.volume,org.kde.kscreen,org.kde.plasma.mediacontroller");

var digitalclock = topPanel.addWidget("org.kde.plasma.digitalclock");
digitalclock.currentConfigGroup = ["Appearance"];
digitalclock.writeConfig("showDate", "true");
digitalclock.writeConfig("dateDisplayFormat", "BesideTime");
digitalclock.writeConfig("dateFormat", "custom");
digitalclock.writeConfig("fontFamily", "Noto Sans");
digitalclock.writeConfig("fontWeight", 400);

var showdesktop = topPanel.addWidget("org.kde.plasma.showdesktop");
