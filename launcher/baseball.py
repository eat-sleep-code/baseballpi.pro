#!/usr/bin/env python3
"""
Baseball Pi Pro - Raspberry Pi Kiosk Application
Full-screen web browser with splash screen and configurable server URL
"""

import sys
import json
import os
from pathlib import Path
from PyQt5.QtWidgets import QApplication, QMainWindow, QLabel
from PyQt5.QtWebEngineWidgets import QWebEngineView, QWebEngineSettings
from PyQt5.QtCore import Qt, QTimer, QUrl
from PyQt5.QtGui import QPixmap, QKeySequence

class SplashScreen(QMainWindow):
    """Splash screen window that displays for at least 3 seconds"""
    
    def __init__(self, image_path, duration_ms=3000):
        super().__init__()
        self.setWindowTitle("Baseball Pi Pro")
        self.setWindowFlags(Qt.FramelessWindowHint)
        self.showFullScreen()
        
        # Create label to display splash image
        self.label = QLabel(self)
        self.setCentralWidget(self.label)
        
        # Load and display the splash image
        pixmap = QPixmap(image_path)
        if pixmap.isNull():
            print(f"Warning: Could not load splash image: {image_path}")
            self.label.setText("Baseball Pi Pro")
            self.label.setAlignment(Qt.AlignCenter)
            self.label.setStyleSheet("QLabel { background-color: #1a1a1a; color: white; font-size: 48px; }")
        else:
            # Scale the image to fit the screen while maintaining aspect ratio
            self.label.setPixmap(pixmap.scaled(
                self.label.size(),
                Qt.KeepAspectRatio,
                Qt.SmoothTransformation
            ))
            self.label.setAlignment(Qt.AlignCenter)
            self.label.setStyleSheet("QLabel { background-color: black; }")
        
        # Timer to close splash screen after duration
        self.timer = QTimer()
        self.timer.timeout.connect(self.close_splash)
        self.timer.setSingleShot(True)
        self.timer.start(duration_ms)
    
    def close_splash(self):
        """Close the splash screen"""
        self.close()
    
    def keyPressEvent(self, event):
        """Handle keyboard events"""
        if event.key() == Qt.Key_Escape or (event.key() == Qt.Key_C and event.modifiers() == Qt.ControlModifier):
            QApplication.quit()


class BrowserWindow(QMainWindow):
    """Full-screen browser window with touch and mouse support"""
    
    def __init__(self, url):
        super().__init__()
        self.setWindowTitle("Baseball Pi Pro")
        
        # Create web view
        self.browser = QWebEngineView()
        self.setCentralWidget(self.browser)
        
        # Enable touch and mouse support
        settings = self.browser.settings()
        settings.setAttribute(QWebEngineSettings.TouchIconsEnabled, True)
        settings.setAttribute(QWebEngineSettings.LocalStorageEnabled, True)
        settings.setAttribute(QWebEngineSettings.JavascriptEnabled, True)
        settings.setAttribute(QWebEngineSettings.PluginsEnabled, True)
        
        # Load the URL
        self.browser.setUrl(QUrl(url))
        
        # Show full screen without window chrome
        self.setWindowFlags(Qt.FramelessWindowHint)
        self.showFullScreen()
    
    def keyPressEvent(self, event):
        """Handle keyboard events"""
        if event.key() == Qt.Key_Escape or (event.key() == Qt.Key_C and event.modifiers() == Qt.ControlModifier):
            QApplication.quit()


def load_settings(settings_file="settings.json"):
    """Load settings from JSON file, create default if it doesn't exist"""
    default_settings = {
        "server_url": "https://baseballpi.pro"
    }
    
    settings_path = Path(settings_file)
    
    # Create default settings file if it doesn't exist
    if not settings_path.exists():
        print(f"Settings file not found. Creating default: {settings_file}")
        with open(settings_path, 'w') as f:
            json.dump(default_settings, f, indent=4)
        return default_settings
    
    # Load existing settings
    try:
        with open(settings_path, 'r') as f:
            settings = json.load(f)
            # Ensure server_url exists
            if 'server_url' not in settings:
                settings['server_url'] = default_settings['server_url']
            return settings
    except json.JSONDecodeError as e:
        print(f"Error parsing settings file: {e}")
        print("Using default settings")
        return default_settings
    except Exception as e:
        print(f"Error loading settings: {e}")
        print("Using default settings")
        return default_settings


def main():
    """Main application entry point"""
    app = QApplication(sys.argv)
    app.setApplicationName("Baseball Pi Pro")
    
    # Determine the base directory (where the script is located)
    base_dir = Path(__file__).parent
    splash_path = base_dir / "splash.jpg"
    settings_path = base_dir / "settings.json"
    
    # Show splash screen for at least 3 seconds
    splash = SplashScreen(str(splash_path), duration_ms=3000)
    splash.show()
    
    # Load settings
    settings = load_settings(str(settings_path))
    server_url = settings.get('server_url', 'https://baseballpi.pro')
    print(f"Loading URL: {server_url}")
    
    # Create browser window (but don't show it yet)
    browser = BrowserWindow(server_url)
    
    # Show browser window after splash screen closes
    def show_browser():
        browser.show()
    
    QTimer.singleShot(3000, show_browser)
    
    # Run the application
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()