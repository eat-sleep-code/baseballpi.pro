# This script will install Baseball Pi Pro and any required prerequisites.
cd ~
echo -e ''
echo -e '\033[32mBaseball Pi Pro [Installation Script] \033[0m'
echo -e '\033[32m-------------------------------------------------------------------------- \033[0m'
echo -e ''
echo -e '\033[93mUpdating package repositories... \033[0m'
sudo apt update


echo ''
echo -e '\033[93mInstalling prerequisites... \033[0m'
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y git python3 python3-pip python3-pyqt5 python3-pyqt5.qtwebengine nodejs
sudo python3 -m venv --system-site-packages ~/baseballpi.pro-venv
sudo ~/baseballpi.pro-venv/bin/pip3 install piexif ffmpeg-python google-api-python-client google-auth-httplib2 google-auth-oauthlib oauth2client moviepy pyside6 evdev


echo ''
echo -e '\033[93mProvisioning logs... \033[0m'
sudo mkdir -p /home/pi/logs
sudo chmod +rw /home/pi/logs
sudo sed -i '\|^tmpfs /home/pi/logs|d' /etc/fstab
sudo sed -i '$ a tmpfs /home/pi/logs tmpfs defaults,noatime,nosuid,size=16m 0 0' /etc/fstab
sudo systemctl daemon-reload
sudo mount -a


echo ''
echo -e '\033[93mInstalling Baseball Pi Pro... \033[0m'
cd ~
sudo rm -Rf ~/baseballpi.pro
sudo git clone https://github.com/eat-sleep-code/baseballpi.pro
sudo chown -R $USER:$USER baseballpi.pro
cd baseballpi.pro/launcher
sudo chmod +x baseball.py
sudo chown -R $USER:$USER ~/logs


echo ''
echo -e '\033[093mSetting up autostart daemon... \033[0m'
cd ~
echo 'Removing legacy service instance...'
sudo svc -d /etc/service/baseballpi.pro
sudo rm -Rf /etc/service/baseballpi.pro
echo 'Configuring new service instance...'
sudo mkdir -p /etc/service/baseballpi.pro
sudo mv ~/baseballpi.pro/run.disabled /etc/service/baseballpi.pro/run.disabled
sudo chmod +x /etc/service/baseballpi.pro/run.disabled
sudo chown -R root:root /etc/service/baseballpi.pro
echo 'Please see the README file for more information on configuring autostart.'


cd ~
echo ''
echo -e '\033[93mSetting up aliases... \033[0m'
sudo touch ~/.bash_aliases
sudo sed -i '/\b\(function baseball\)\b/d' ~/.bash_aliases
sudo sed -i '$ a function baseball { sudo ~/baseballpi.pro-venv/bin/python3 ~/baseballpi.pro/launcher/baseball.py "$@"; }' ~/.bash_aliases
echo -e 'You may use \e[1mbaseball \e[0m to launch the program.'
echo ''
echo 'Please see the README file for more information.'
echo ''
echo -e '\033[32m-------------------------------------------------------------------------- \033[0m'
echo -e '\033[32mInstallation completed. \033[0m'
echo ''
#sudo rm ~/install-baseballpi.sh
bash