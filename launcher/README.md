# Baseball Pi Pro (UI Launcher)

---

## Getting Started

- Use [Raspberry Pi Imager](https://www.raspberrypi.com/software) to install Raspberry Pi OS *(Trixie)* on a microSD card
- Use [raspi-config](https://www.raspberrypi.org/documentation/configuration/raspi-config.md) to:
  - Set up your WiFi connection
- Execute the following to update all installed software to the latest version(s):
```bash
sudo apt update && sudo apt full-upgrade -y && sudo apt autoremove -y && sudo apt autoclean
```



## Installation

Installation of the program, as well as any software prerequisites, can be completed with the following two-line install script.

```bash
wget -q https://raw.githubusercontent.com/eat-sleep-code/baseballpi.pro/main/launcher/install.sh -O ~/install.sh
sudo chmod +x ~/install.sh && ~/install.sh
```
---

## Autostart

### Enable

To enable autostart of the program, execute the following command:

```
sudo mv /etc/service/camera.pro/run.disabled /etc/service/camera.pro/run
```

### Disable

To disable autostart of the program, execute the following command:

```
sudo mv /etc/service/camera.pro/run /etc/service/camera.pro/run.disabled
```