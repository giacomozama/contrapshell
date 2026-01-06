<center>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/logo_dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/logo_light.svg">
  <img alt="contrapshell" src="./assets/logo_dark.svg">
</picture>

contraptionDE's shell.
</center>

# Description

**contrapshell** is the shell/panel/widget set for my Hyprland rice, the contraptionDE project. It's (mostly) written in TypeScript using [AGS](https://github.com/Aylur/ags) with GTK4.

It's designed to appeal to my own taste, and deliberately lacks in configurability in favor of being faster to tweak via code.

# Features

The shell comprises of a top-anchored bar, a bottom-anchored dock and a background panel, which covers a specific monitor with a wall of widgets.

### The **top bar** contains (from left to right):
- A **shutdown** button, which opens a custom modal menu
- An **appearance settings** button, which opens a dialog for picking a wallpaper and UI accent colors.
- Indicators showing current **resource usage** for CPU, RAM and GPU
- A **package updates** indicator.
- An **MPRIS client** with a fancy **CAVA**-based bars effect
- **System tray** icons
- **Bluetooth** controls
- **Network** controls (it's actually just nm-applet's system tray icon getting special treatment)
- A caffeine-style **idle inhibitor**
- A **GSConnect** indicator
- **Audio** controls
- A **clock**/**calendar**
- A **notifications** indicator and list

A **volume changed** popup will appear whenever the volume is changed, and a **notification** popup will appear whenever a notification is received.

The bar will automatically move to another monitor whenever an application is set to exclusive fullscreen on the monitor the bar is currently on.

A dark scrim can optionally be shown below the top bar to increase readability on bright wallpapers.

### The **dock** contains:
- Application **quick launch** icons, including special icons for:
    - A **music library** widget, for playing music through MPD
    - A **game launcher** widget, for launching **Steam** and **Bottles** games
- A **trash** icon
- A **workspace indicator/switcher**
- A **launcher** button, for opening your preferred launcher

The dock will appear on each monitor.

### The **background panel** contains:
- An **RSS news aggregator** widget
- A **yfinance**-based **stock performance** widget
- Decorative **clock** and **calendar** widgets
- A **weather forecast** widget

The background panel will only appear if no windows are open on the monitor it's shown on.

# Setup

## Dependencies
- `gtk4` - this is a GTK4 app
- `aylurs-gtk-shell` - **contrapshell** is based on AGS
- `libastal`
    - `libastal-bluetooth` for bluetooth controls
    - `libastal-cava` for cava-based effects
    - `libastal-hyprland` for integrating with Hyprland's IPC
    - `libastal-mpris` for MPRIS support
    - `libastal-notifd` for notification features
    - `libastal-tray` for the system tray integration
    - `libastal-wireplumber` for audio controls
- `papirus-icon-theme` - the shell only ships with icons which are not present in the Papirus theme
- [auto-palette-cli](https://crates.io/crates/auto-palette-cli/0.3.0) to extract color palettes. You can install it from cargo or build it from source
- [biiwadi](https://github.com/giacomozama/biiwadi) provides the DBus service for **contrapshell**'s idle inhibitor. It must be built from source
- `gsconnect` for the GSConnect integration. ([How to use GSConnect without Gnome](https://github.com/GSConnect/gnome-shell-extension-gsconnect/wiki/CLI-usage-without-Gnome-environment))
- `nm-applet` for network controls
- `python` and `python-yfinance` for the stocks panel
- `mpd` and `mpd-mpris` for the music library
- `imagemagick` for compressing cached images

**contrapshell** exclusively supports Hyprland at the moment.

## Installation
```bash
# Clone the repository
git clone https://github.com/giacomozama/contrapshell.git
cd contrapshell

# Generate AGS types. By default, contrapshell uses types in your ~/.config/ags directory. 

# Build with Cargo
cargo build --release
```
Just clone the repo somewhere.

## Configuration
