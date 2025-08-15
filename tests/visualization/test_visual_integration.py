#!/usr/bin/env python3
"""
Visual Integration Testing Script for CADS Research Visualization
Tests that the visualization is working after cleanup and deployment
"""

import os
import json
import gzip
import webbrowser
import time
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading
import requests


def test_data_files():
    """Test that all required data files exist and are valid"""
    print("🔍 Testing data files...")
    
    data_dir = Path("visuals/public/data")
    required_files = [
        "visualization-data.json",
        "cluster_themes.json", 
        "clustering_results.json",
        "search-index.json"
    ]
    
    all_good = True
    
    for filename in required_files:
        file_path = data_dir / filename
        if file_path.exists():
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                print(f"   ✅ {filename} - Valid JSON with {len(str(data))} characters")
            except json.JSONDecodeError as e:
                print(f"   ❌ {filename} - Invalid JSON: {e}")
                all_good = False
        else:
            print(f"   ❌ {filename} - File missing")
            all_good = False
    
    return all_good


def test_compressed_files():
    """Test that compressed files exist and are valid"""
    print("🗜️  Testing compressed files...")
    
    data_dir = Path("visuals/public/data")
    compressed_files = [
        "visualization-data.json.gz",
        "cluster_themes.json.gz",
        "clustering_results.json.gz", 
        "search-index.json.gz"
    ]
    
    all_good = True
    
    for filename in compressed_files:
        file_path = data_dir / filename
        if file_path.exists():
            try:
                with gzip.open(file_path, 'rt') as f:
                    data = json.load(f)
                print(f"   ✅ {filename} - Valid compressed JSON")
            except (gzip.BadGzipFile, json.JSONDecodeError) as e:
                print(f"   ❌ {filename} - Invalid compressed file: {e}")
                all_good = False
        else:
            print(f"   ❌ {filename} - File missing")
            all_good = False
    
    return all_good


def test_html_structure():
    """Test that HTML file exists and has required structure"""
    print("🌐 Testing HTML structure...")
    
    html_file = Path("visuals/public/index.html")
    if not html_file.exists():
        print("   ❌ index.html not found")
        return False
    
    with open(html_file, 'r') as f:
        content = f.read()
    
    required_elements = [
        'id="map-container"',
        'id="ui-panel"',
        'deck.gl',
        'visualization-data.json',
        'cluster_themes.json'
    ]
    
    all_good = True
    for element in required_elements:
        if element in content:
            print(f"   ✅ Found: {element}")
        else:
            print(f"   ❌ Missing: {element}")
            all_good = False
    
    return all_good


def start_local_server(port=8000):
    """Start a local HTTP server for testing"""
    original_dir = os.getcwd()
    os.chdir("visuals/public")
    
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass  # Suppress log messages
    
    server = HTTPServer(('localhost', port), QuietHandler)
    
    def run_server():
        server.serve_forever()
    
    thread = threading.Thread(target=run_server, daemon=True)
    thread.start()
    
    # Change back to original directory
    os.chdir(original_dir)
    
    return server, f"http://localhost:{port}"


def test_server_response(url):
    """Test that the server responds correctly"""
    print(f"🌐 Testing server response at {url}...")
    
    try:
        # Test main page
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print("   ✅ Main page loads successfully")
        else:
            print(f"   ❌ Main page returned status {response.status_code}")
            return False
        
        # Test data files
        data_files = [
            "data/visualization-data.json",
            "data/cluster_themes.json",
            "data/search-index.json"
        ]
        
        for data_file in data_files:
            response = requests.get(f"{url}/{data_file}", timeout=5)
            if response.status_code == 200:
                print(f"   ✅ {data_file} accessible")
            else:
                print(f"   ❌ {data_file} returned status {response.status_code}")
                return False
        
        return True
        
    except requests.RequestException as e:
        print(f"   ❌ Server test failed: {e}")
        return False


def main():
    """Main testing function"""
    print("🧪 CADS Research Visualization - Visual Integration Testing")
    print("=" * 60)
    
    # Change to project root
    project_root = Path(__file__).parent.parent.parent
    os.chdir(project_root)
    
    # Test 1: Data files
    data_ok = test_data_files()
    print()
    
    # Test 2: Compressed files  
    compressed_ok = test_compressed_files()
    print()
    
    # Test 3: HTML structure
    html_ok = test_html_structure()
    print()
    
    if not (data_ok and compressed_ok and html_ok):
        print("❌ Some tests failed. Fix issues before testing server.")
        return False
    
    # Test 4: Start local server
    print("🚀 Starting local server for visual testing...")
    try:
        server, url = start_local_server()
        print(f"   ✅ Server started at {url}")
        
        # Wait a moment for server to start
        time.sleep(1)
        
        # Test server response
        server_ok = test_server_response(url)
        
        if server_ok:
            print(f"\n🎉 All tests passed!")
            print(f"🌐 Visual test: {url}")
            print(f"📱 Open this URL in your browser to test the visualization")
            
            # Ask if user wants to open browser
            try:
                response = input("\nOpen browser automatically? (y/N): ")
                if response.lower() == 'y':
                    webbrowser.open(url)
                    print("🌐 Browser opened!")
            except KeyboardInterrupt:
                pass
            
            print(f"\n📋 Manual Testing Checklist:")
            print(f"   □ Page loads without errors")
            print(f"   □ Visualization renders (you should see dots/points)")
            print(f"   □ Search box works")
            print(f"   □ Filters work (researcher, year, cluster)")
            print(f"   □ Tooltips appear when hovering over points")
            print(f"   □ No console errors in browser dev tools")
            
            print(f"\n⏹️  Press Ctrl+C to stop the server when done testing")
            
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print(f"\n🛑 Stopping server...")
                server.shutdown()
                print(f"✅ Server stopped")
                
        else:
            print(f"\n❌ Server tests failed")
            server.shutdown()
            return False
            
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        return False
    
    return True


if __name__ == "__main__":
    try:
        success = main()
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n🛑 Testing interrupted")
        exit(1)